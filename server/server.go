// Copyright 2025 Laurent Le Meur

package main

import (
	"encoding/json"
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

	// Configuration CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8090", "http://localhost:8091"}, // URLs de votre frontend React
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Post("/dashboard/login", login)
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)
		r.Get("/dashboard/data", Dashboard)
	})

	// Démarre le serveur sur le port 8080
	log.Println("Serveur démarré sur le port 8080")
	http.ListenAndServe(":8080", r)
}

// Handler pour la route /dashboard/login
func login(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Vérifiez les identifiants (exemple simplifié)
	if creds.Username != "admin" || creds.Password != "supersecret" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	log.Println("🔐 Utilisateur connecté :", creds.Username)

	// Créez le token JWT
	expirationTime := time.Now().Add(24 * time.Hour)
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

	// Renvoie le token dans un cookie (optionnel)
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: true,
		Secure:   false, // false pour le développement local
		SameSite: http.SameSiteStrictMode,
	})

	// Renvoie aussi le token et les informations utilisateur en JSON
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
		c, err := r.Cookie("token")
		if err != nil {
			if err == http.ErrNoCookie {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		tokenStr := c.Value
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		if !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

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
		LicensesLast12Months    int               `json:"licensesLast12Months"`
		LicensesLastWeek        int               `json:"licensesLastWeek"`
		OldestLicenseDate       string            `json:"oldestLicenseDate"`
		TotalLicensesSinceStart int               `json:"totalLicensesSinceStart"`
		PublicationTypes        []PublicationType `json:"publicationTypes"`
		LicenseStatuses         []LicenseStatus   `json:"licenseStatuses"`
		ChartData               []ChartDataPoint  `json:"chartData"`
	}

	data := DashboardData{
		TotalPublications:       100,
		TotalUsers:              50,
		LicensesLast12Months:    30,
		LicensesLastWeek:        5,
		OldestLicenseDate:       "2022-01-01",
		TotalLicensesSinceStart: 200,
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
