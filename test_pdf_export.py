#!/usr/bin/env python3
"""
Test script for PDF export functionality
"""
import requests
import json

API_BASE = "http://localhost:8000"

# Login as teacher
print("1. Logging in as teacher...")
login_response = requests.post(
    f"{API_BASE}/auth/login",
    json={"username": "fhshbook@fhsh.tp.edu.tw", "password": "fhshbook"}
)
print(f"   Status: {login_response.status_code}")

if login_response.status_code != 200:
    print(f"   Error: {login_response.text}")
    exit(1)

login_data = login_response.json()
token = login_data["access_token"]
print(f"   ✓ Login successful")

# Get applications
print("\n2. Getting applications list...")
headers = {"Authorization": f"Bearer {token}"}
apps_response = requests.get(f"{API_BASE}/applications/", headers=headers)
print(f"   Status: {apps_response.status_code}")

if apps_response.status_code != 200:
    print(f"   Error: {apps_response.text}")
    exit(1)

applications = apps_response.json()
print(f"   ✓ Found {len(applications)} applications")

if len(applications) == 0:
    print("\n⚠️ No applications found. Creating a test application first...")

    # Create a test application
    test_app = {
        "title": "PDF匯出測試申請",
        "apply_date_start": "2025-01-01",
        "apply_date_end": "2025-06-30",
        "members": [
            {
                "student_id": "TEST001",
                "name": "測試學生",
                "class_name": "高一1",
                "seat_number": 1
            }
        ],
        "motivation": "這是一個測試申請，用於驗證PDF匯出功能是否正常工作。",
        "learning_categories": ["程式語言"],
        "learning_category_other": None,
        "env_needs": ["電腦教室"],
        "env_other": None,
        "plan_items": [
            {
                "activity": "學習Python基礎",
                "time": "1-2月",
                "location": "電腦教室",
                "resources": "線上課程"
            }
        ],
        "presentation_format": ["書面報告"],
        "presentation_other": None,
        "signatures": {
            "student": "測試學生",
            "parent": "測試家長",
            "homeroom_teacher": "導師"
        }
    }

    create_response = requests.post(
        f"{API_BASE}/applications/",
        headers=headers,
        json=test_app
    )

    if create_response.status_code != 200:
        print(f"   Error creating application: {create_response.text}")
        exit(1)

    created_app = create_response.json()
    app_id = created_app["id"]
    print(f"   ✓ Created test application: {app_id}")
else:
    # Use the first application
    app_id = applications[0]["id"]
    print(f"   Using application: {app_id}")

# Test PDF export
print(f"\n3. Testing PDF export for application {app_id}...")
pdf_response = requests.get(
    f"{API_BASE}/applications/{app_id}/export-pdf",
    headers=headers
)
print(f"   Status: {pdf_response.status_code}")
print(f"   Content-Type: {pdf_response.headers.get('Content-Type')}")

if pdf_response.status_code != 200:
    print(f"   Error: {pdf_response.text}")
    exit(1)

# Save the PDF
filename = f"test_application_{app_id}.pdf"
with open(filename, "wb") as f:
    f.write(pdf_response.content)

print(f"   ✓ PDF export successful!")
print(f"   ✓ PDF saved as: {filename}")
print(f"   ✓ File size: {len(pdf_response.content)} bytes")

print("\n✅ All tests passed!")
