// Copyright 2025 Laurent Le Meur

package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type OversharedLicenseData struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	User    string `json:"user"`
	Type    string `json:"type"`
	Status  string `json:"status"`
	Devices int    `json:"devices"`
}

func OversharedLicenses(w http.ResponseWriter, r *http.Request) {
	licenses := []OversharedLicenseData{
		{
			ID:      "lic-001",
			Title:   "The Complete Guide to Modern Web Development with React and TypeScript",
			User:    "john.doe@example.com",
			Type:    "loan",
			Status:  "active",
			Devices: 5,
		},
		{
			ID:      "lic-002",
			Title:   "Advanced JavaScript Patterns",
			User:    "jane.smith@example.com",
			Type:    "buy",
			Status:  "ready",
			Devices: 4,
		},
		{
			ID:      "lic-003",
			Title:   "Mastering Node.js: Build Scalable Applications",
			User:    "bob.wilson@example.com",
			Type:    "loan",
			Status:  "active",
			Devices: 6,
		},
		{
			ID:      "lic-004",
			Title:   "CSS Grid and Flexbox: A Complete Guide",
			User:    "alice.brown@example.com",
			Type:    "buy",
			Status:  "expired",
			Devices: 3,
		},
		{
			ID:      "lic-005",
			Title:   "Python for Data Science and Machine Learning",
			User:    "charlie.davis@example.com",
			Type:    "loan",
			Status:  "active",
			Devices: 7,
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
		"success": true,
		"message": "License revocation was successful",
		"licenseID": licenseID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
