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
