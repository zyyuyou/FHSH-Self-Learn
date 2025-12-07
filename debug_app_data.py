#!/usr/bin/env python3
"""
Debug script to examine application data
"""
import requests
import json

API_BASE = "http://localhost:8000"

# Login as teacher
print("Logging in...")
login_response = requests.post(
    f"{API_BASE}/auth/login",
    json={"username": "fhshbook@fhsh.tp.edu.tw", "password": "fhshbook"}
)
token = login_response.json()["access_token"]

# Get applications
headers = {"Authorization": f"Bearer {token}"}
apps_response = requests.get(f"{API_BASE}/applications/", headers=headers)
applications = apps_response.json()

if len(applications) > 0:
    app_id = applications[0]["id"]
    print(f"\nFetching detailed data for application: {app_id}")

    # Get application details
    app_response = requests.get(f"{API_BASE}/applications/{app_id}", headers=headers)
    app_data = app_response.json()

    print("\nApplication Data:")
    print(json.dumps(app_data, indent=2, ensure_ascii=False))

    print("\n\nSignatures type:", type(app_data.get("signatures")))
    print("Signatures value:", app_data.get("signatures"))

    print("\n\nPlan items:")
    for item in app_data.get("plan_items", []):
        print(f"  - {item}")
else:
    print("No applications found")
