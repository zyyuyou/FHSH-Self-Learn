#!/bin/bash

# Login and get token
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "fhshbook@fhsh.tp.edu.tw", "password": "fhshbook"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

# Export PDF
curl -v -X GET "http://localhost:8000/applications/692c50de0f39b8a49503a2c4/export-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/test_export.pdf

echo ""
echo "PDF exported to /tmp/test_export.pdf"
ls -lh /tmp/test_export.pdf
