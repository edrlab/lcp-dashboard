// Copyright 2025 EDRLab
// Licensed under the BSD 3-Clause License (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License in the root directory of this source
// distribution or at https://opensource.org/license/bsd-3-clause/

package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
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
		r.Get("/dashdata/user-licenses/{userID}", UserLicenses)
		r.Get("/dashdata/license-events/{licenseID}", LicenseEvents)
	})

	r.Group(func(r chi.Router) {
		r.Use(authMiddleware)
		r.Use(paginate)
		r.Get("/dashdata/publications", Publications)
		r.Delete("/dashdata/publications/{uuid}", DeletePublication)
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

// authMiddleware validates JWT tokens for protected routes
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

// PaginationKey is used to store pagination parameters in the context.
type PaginationKey string

const (
	PageKey    PaginationKey = "page"
	PerPageKey PaginationKey = "per_page"
)

// paginate middleware
func paginate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// default values
		page := 1
		perPage := 20

		// read query parameters
		q := r.URL.Query()
		if p := q.Get("page"); p != "" {
			if val, err := strconv.Atoi(p); err == nil && val > 0 {
				page = val
			}
		}
		if pp := q.Get("per_page"); pp != "" {
			if val, err := strconv.Atoi(pp); err == nil && val > 0 {
				perPage = val
			}
		}

		// add to context
		ctx := context.WithValue(r.Context(), PageKey, page)
		ctx = context.WithValue(ctx, PerPageKey, perPage)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

