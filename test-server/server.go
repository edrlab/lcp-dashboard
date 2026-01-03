// Copyright 2025 EDRLab

package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("votre_cle_secrete")

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	// Middleware, deactivation of the cache during development
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Headers to deactivate cache
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")
			next.ServeHTTP(w, r)
		})
	})

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8090", "http://localhost:4173"}, // URLs React frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Post("/dashdata/login", login)
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)
		r.Get("/dashdata/data", Dashboard)
		r.Get("/dashdata/overshared", OversharedLicenses)
		r.Put("/dashdata/revoke/{licenseID}", RevokeLicense)
	})

	// Start the server on port 8989
	log.Println("Server started on port 8989")
	err := http.ListenAndServe(":8989", r)
	if err != nil {
		log.Fatal("Error starting server:", err)
	}
}

// Handler for the dashboard login route
func login(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Check credentials (simplified example)
	if creds.Username != "admin" || creds.Password != "supersecret" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	log.Println("🔐 User:", creds.Username)

	// Create JWT token
	//expirationTime := time.Now().Add(30 * time.Second) // 30 seconds for testing
	expirationTime := time.Now().Add(1 * time.Hour) // 1 hour for production
	claims := &Claims{
		Username: creds.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Send back the token in a cookie (optional)
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: true,
		Secure:   false, // false for local development
		SameSite: http.SameSiteStrictMode,
	})

	// Also return the token and user information as JSON
	response := map[string]interface{}{
		"token": tokenString,
		"user": map[string]interface{}{
			"id":    "1",
			"email": creds.Username + "@example.com",
			"name":  creds.Username,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string

		// Try to get token from Authorization header first (Bearer token)
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenStr = authHeader[7:]
		} else {
			// Fallback to cookie if no Authorization header
			c, err := r.Cookie("token")
			if err != nil {
				if err == http.ErrNoCookie {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusUnauthorized)
					json.NewEncoder(w).Encode(map[string]string{"error": "No authentication token provided"})
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Bad request"})
				return
			}
			tokenStr = c.Value
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)

			// Handle JWT validation errors using modern Go error handling
			errorMessage := "Invalid token"
			errorCode := ""

			// Use errors.Is() to check for specific JWT errors in composite errors
			if errors.Is(err, jwt.ErrTokenExpired) {
				errorMessage = "Token has expired"
				errorCode = "TOKEN_EXPIRED"
			} else if errors.Is(err, jwt.ErrSignatureInvalid) {
				errorMessage = "Invalid token signature"
			} else if errors.Is(err, jwt.ErrTokenNotValidYet) {
				errorMessage = "Token not valid yet"
			} else if errors.Is(err, jwt.ErrTokenMalformed) {
				errorMessage = "Token is malformed"
			} else if errors.Is(err, jwt.ErrTokenUnverifiable) {
				errorMessage = "Token could not be verified"
			} else {
				// For any other JWT parsing error, provide a generic message
				errorMessage = "Invalid or malformed token"
			}

			response := map[string]string{"error": errorMessage}
			if errorCode != "" {
				response["code"] = errorCode
			}
			json.NewEncoder(w).Encode(response)
			return
		}

		if !token.Valid {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Token is not valid"})
			return
		}

		// Add username to request context for use in handlers
		r.Header.Set("X-Username", claims.Username)
		next.ServeHTTP(w, r)
	})
}

func Dashboard(w http.ResponseWriter, r *http.Request) {
	type PublicationType struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}

	type LicenseStatus struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}

	type ChartDataPoint struct {
		Month    string `json:"month"`
		Licenses int    `json:"licenses"`
	}

	type DashboardData struct {
		TotalPublications       int               `json:"totalPublications"`
		TotalUsers              int               `json:"totalUsers"`
		TotalLicenses           int               `json:"totalLicenses"`
		LicensesLast12Months    int               `json:"licensesLast12Months"`
		LicensesLastMonth       int               `json:"licensesLastMonth"`
		LicensesLastWeek        int               `json:"licensesLastWeek"`
		LicensesLastDay         int               `json:"licensesLastDay"`
		OldestLicenseDate       string            `json:"oldestLicenseDate"`
		LatestLicenseDate       string            `json:"latestLicenseDate"`
		OversharedLicensesCount int               `json:"oversharedLicensesCount"`
		PublicationTypes        []PublicationType `json:"publicationTypes"`
		LicenseStatuses         []LicenseStatus   `json:"licenseStatuses"`
		ChartData               []ChartDataPoint  `json:"chartData"`
	}

	data := DashboardData{
		TotalPublications:       100,
		TotalUsers:              50,
		TotalLicenses:           200,
		LicensesLast12Months:    30,
		LicensesLastMonth:       8,
		LicensesLastWeek:        5,
		LicensesLastDay:         2,
		OldestLicenseDate:       "2022-01-01",
		LatestLicenseDate:       "2025-10-02",
		OversharedLicensesCount: 23,
		PublicationTypes: []PublicationType{
			{Name: "EPUB", Count: 1284},
			{Name: "PDF", Count: 892},
			{Name: "Audiobooks", Count: 456},
			{Name: "Comics", Count: 234},
		},
		LicenseStatuses: []LicenseStatus{
			{Name: "Ready", Count: 45632},
			{Name: "Active", Count: 28456},
			{Name: "Expired", Count: 12834},
			{Name: "Revoked", Count: 1856},
			{Name: "Canceled", Count: 456},
			{Name: "Returned", Count: 124},
		},
		ChartData: []ChartDataPoint{
			{Month: "Jan", Licenses: 245},
			{Month: "Feb", Licenses: 312},
			{Month: "Mar", Licenses: 198},
			{Month: "Apr", Licenses: 427},
			{Month: "May", Licenses: 389},
			{Month: "Jun", Licenses: 516},
			{Month: "Jul", Licenses: 634},
			{Month: "Aug", Licenses: 573},
			{Month: "Sep", Licenses: 692},
			{Month: "Oct", Licenses: 758},
			{Month: "Nov", Licenses: 841},
			{Month: "Dec", Licenses: 923},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

type OversharedLicenseData struct {
	ID            string `json:"id"`
	PublicationID string `json:"publicationId"`
	AltID         string `json:"altId"`
	Title         string `json:"title"`
	UserID        string `json:"userId"`
	UserEmail     string `json:"userEmail"`
	Type          string `json:"type"`
	Status        string `json:"status"`
	Devices       int    `json:"devices"`
}

func OversharedLicenses(w http.ResponseWriter, r *http.Request) {
	
	licenses := []OversharedLicenseData{
		{
			ID:            "lic-001",
			PublicationID: "pub-123",
			AltID:         "alt-123",
			Title:         "The Complete Guide to Modern Web Development with React and TypeScript",
			UserID:        "user-001",
			UserEmail:     "john.doe@example.com",
			Type:          "loan",
			Status:        "active",
			Devices:       5,
		},
		{
			ID:            "lic-002",
			PublicationID: "pub-456",
			AltID:         "alt-456",
			Title:         "Advanced JavaScript Patterns",
			UserID:        "user-002",
			UserEmail:     "",
			Type:          "buy",
			Status:        "ready",
			Devices:       4,
		},
		{
			ID:            "lic-003",
			PublicationID: "pub-789",
			AltID:         "alt-789",
			Title:         "Mastering Node.js: Build Scalable Applications",
			UserID:        "user-003",
			UserEmail:     "bob.wilson@example.com",
			Type:          "loan",
			Status:        "active",
			Devices:       6,
		},
		{
			ID:            "lic-004",
			PublicationID: "pub-101",
			AltID:         "alt-101",
			Title:         "CSS Grid and Flexbox: A Complete Guide",
			UserID:        "user-004",
			UserEmail:     "alice.brown@example.com",
			Type:          "buy",
			Status:        "expired",
			Devices:       3,
		},
		{
			ID:            "lic-005",
			PublicationID: "pub-212",
			AltID:         "alt-212",
			Title:         "Python for Data Science and Machine Learning",
			UserID:        "user-005",
			UserEmail:     "charlie.davis@example.com",
			Type:          "loan",
			Status:        "active",
			Devices:       7,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(licenses)
}

func RevokeLicense(w http.ResponseWriter, r *http.Request) {
	licenseID := chi.URLParam(r, "licenseID")

	log.Printf("🔄 Revoking license: %s", licenseID)

	// Simulate successful revocation
	response := map[string]interface{}{
		"success":   true,
		"message":   "License revocation was successful",
		"licenseID": licenseID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
