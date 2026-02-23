// Copyright 2025 EDRLab
// Licensed under the BSD 3-Clause License (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License in the root directory of this source
// distribution or at https://opensource.org/license/bsd-3-clause/

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

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

type LicenseInfo struct {
	CreatedAt        time.Time `json:"CreatedAt"`
	UpdatedAt        time.Time `json:"UpdatedAt"`
	UUID             string    `json:"uuid"`
	Provider         *string   `json:"provider,omitempty"`
	UserID           string    `json:"user_id"`
	Start            string    `json:"start"`
	End              string    `json:"end"`
	MaxEnd           *string   `json:"max_end,omitempty"`
	Copy             int       `json:"copy"`
	Print            int       `json:"print"`
	Status           string    `json:"status"`
	DeviceCount      int       `json:"device_count"`
	PublicationID    string    `json:"publication_id"`
	PublicationTitle string    `json:"publication_title"`
}

type Event struct {
	Timestamp  string `json:"timestamp"`
	Type       string `json:"type"`
	DeviceName string `json:"device_name"`
	DeviceID   string `json:"device_id"`
}

type DashboardData struct {
	TotalPublications       int               `json:"total_publications"`
	TotalUsers              int               `json:"total_users"`
	TotalLicenses           int               `json:"total_licenses"`
	LicensesLast12Months    int               `json:"licenses_last_12_months"`
	LicensesLastMonth       int               `json:"licenses_last_month"`
	LicensesLastWeek        int               `json:"licenses_last_week"`
	LicensesLastDay         int               `json:"licenses_last_day"`
	OldestLicenseDate       string            `json:"oldest_license_date"`
	LatestLicenseDate       string            `json:"latest_license_date"`
	OversharedLicensesCount int               `json:"overshared_licenses_count"`
	PublicationTypes        []PublicationType `json:"publication_types"`
	LicenseStatuses         []LicenseStatus   `json:"license_statuses"`
	ChartData               []ChartDataPoint  `json:"chart_data"`
}

func Dashboard(w http.ResponseWriter, r *http.Request) {

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
PublicationID string `json:"publication_id"`
AltID         string `json:"alt_id"`
Title         string `json:"title"`
UserID        string `json:"user_id"`
UserEmail     string `json:"user_email"`
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

func UserLicenses(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	
	log.Printf("🔍 Searching licenses for user: %s", userID)

	// Generate mock license data based on userID
	var licenses []LicenseInfo
	
	// For demonstration, create different scenarios based on userID
	switch userID {
	case "user123":
		licenses = []LicenseInfo{
			{
				CreatedAt:        time.Now().AddDate(0, -2, 0),
				UpdatedAt:        time.Now().AddDate(0, -1, 0),
				UUID:             "license-001-user123",
				Provider:         stringPtr("EDRLab"),
				UserID:           userID,
				Start:            "2024-01-15T00:00:00Z",
				End:              "2024-12-31T23:59:59Z",
				MaxEnd:           stringPtr("2025-01-31T23:59:59Z"),
				Copy:             5,
				Print:            10,
				Status:           "active",
				DeviceCount:      3,
				PublicationID:    "pub-001",
				PublicationTitle: "Introduction to Digital Publishing",
			},
			{
				CreatedAt:        time.Now().AddDate(0, -1, 0),
				UpdatedAt:        time.Now().AddDate(0, 0, -5),
				UUID:             "license-002-user123",
				UserID:           userID,
				Start:            "2024-06-01T00:00:00Z",
				End:              "2024-11-30T23:59:59Z",
				Copy:             3,
				Print:            5,
				Status:           "expired",
				DeviceCount:      2,
				PublicationID:    "pub-002",
				PublicationTitle: "Advanced eBook Technologies",
			},
		}
	case "john.doe":
		licenses = []LicenseInfo{
			{
				CreatedAt:        time.Now().AddDate(0, -3, 0),
				UpdatedAt:        time.Now().AddDate(0, 0, -10),
				UUID:             "license-003-johndoe",
				Provider:         stringPtr("LibrarySystem"),
				UserID:           userID,
				Start:            "2024-03-01T00:00:00Z",
				End:              "2025-03-01T00:00:00Z",
				Copy:             10,
				Print:            20,
				Status:           "active",
				DeviceCount:      5,
				PublicationID:    "pub-003",
				PublicationTitle: "Modern Library Management",
			},
		}
	case "empty-user":
		// Return empty array for this user
		licenses = []LicenseInfo{}
	default:
		// For unknown users, return a few generic licenses
		licenses = []LicenseInfo{
			{
				CreatedAt:        time.Now().AddDate(0, -1, -15),
				UpdatedAt:        time.Now().AddDate(0, 0, -2),
				UUID:             "license-default-001",
				UserID:           userID,
				Start:            "2024-07-01T00:00:00Z",
				End:              "2024-12-15T23:59:59Z",
				Copy:             2,
				Print:            3,
				Status:           "ready",
				DeviceCount:      1,
				PublicationID:    "pub-default",
				PublicationTitle: "Sample Digital Content",
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(licenses)
}

func LicenseEvents(w http.ResponseWriter, r *http.Request) {
	licenseID := chi.URLParam(r, "licenseID")
	
	log.Printf("Fetching events for license: %s", licenseID)

	// Generate mock events based on licenseID
	var events []Event
	
	// For demonstration, create different event scenarios based on licenseID
	switch {
	case licenseID == "license-001-user123":
		events = []Event{
			{
				Timestamp:  time.Now().AddDate(0, 0, -7).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "John's iPad",
				DeviceID:   "device-001",
			},
			{
				Timestamp:  time.Now().AddDate(0, 0, -5).Format(time.RFC3339),
				Type:       "return",
				DeviceName: "John's iPad",
				DeviceID:   "device-001",
			},
			{
				Timestamp:  time.Now().AddDate(0, 0, -3).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "John's iPhone",
				DeviceID:   "device-002",
			},
		}
	case licenseID == "license-002-user123":
		events = []Event{
			{
				Timestamp:  time.Now().AddDate(0, 0, -10).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "MacBook Pro",
				DeviceID:   "device-003",
			},
			{
				Timestamp:  time.Now().AddDate(0, 0, -1).Format(time.RFC3339),
				Type:       "renew",
				DeviceName: "MacBook Pro",
				DeviceID:   "device-003",
			},
		}
	case licenseID == "license-003-johndoe":
		events = []Event{
			{
				Timestamp:  time.Now().AddDate(0, 0, -20).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "Library Tablet 1",
				DeviceID:   "lib-tablet-001",
			},
			{
				Timestamp:  time.Now().AddDate(0, 0, -15).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "Library Tablet 2", 
				DeviceID:   "lib-tablet-002",
			},
			{
				Timestamp:  time.Now().AddDate(0, 0, -10).Format(time.RFC3339),
				Type:       "return",
				DeviceName: "Library Tablet 1",
				DeviceID:   "lib-tablet-001",
			},
		}
	default:
		// For unknown licenses, return basic events
		events = []Event{
			{
				Timestamp:  time.Now().AddDate(0, 0, -2).Format(time.RFC3339),
				Type:       "register",
				DeviceName: "Unknown Device",
				DeviceID:   "device-unknown",
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// Helper function to create string pointers
func stringPtr(s string) *string {
	return &s
}
