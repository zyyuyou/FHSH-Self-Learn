#!/bin/bash

echo "=========================================="
echo "完整流程測試"
echo "=========================================="

# 1. 測試學生登入
echo ""
echo "1. 測試學生登入..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"11330031@fhsh.tp.edu.tw","password":"11330031"}')

echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print('✅ 登入成功') if 'access_token' in data else print('❌ 登入失敗:', data.get('detail', '未知錯誤'))"

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 無法獲取 token，終止測試"
    exit 1
fi

# 2. 測試建立申請表
echo ""
echo "2. 測試建立申請表（包含 presentation_formats）..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8000/applications/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "測試申請表 - 完整流程",
    "apply_date_start": "2025-12-06",
    "apply_date_end": "2026-06-06",
    "members": [
      {
        "student_id": "11330031",
        "student_class": "206",
        "student_seat": "32",
        "student_name": "鄭宇佑",
        "has_submitted": "是"
      }
    ],
    "motivation": "測試學習動機",
    "learning_categories": {
      "閱讀計畫": true,
      "志工服務": true
    },
    "learning_category_other": "",
    "references": [
      {
        "book_title": "測試書籍",
        "author": "測試作者",
        "publisher": "測試出版社",
        "link": "https://example.com"
      }
    ],
    "expected_outcome": "測試預期成效",
    "equipment_needs": "測試裝置需求",
    "env_needs": {
      "自習室": true,
      "數位閱讀室": true
    },
    "env_other": "",
    "plan_items": [
      {
        "date": "2025-12-15",
        "content": "測試學習內容",
        "hours": "10",
        "metric": "測試檢核指標"
      },
      {
        "date": "2025-12-20",
        "content": "測試學習內容2",
        "hours": "8",
        "metric": "測試檢核指標2"
      }
    ],
    "midterm_goal": "測試階段中目標",
    "final_goal": "測試階段末目標",
    "presentation_formats": {
      "靜態展": true,
      "動態展": true
    },
    "presentation_other": "測試其他說明",
    "phone_agreement": "同意",
    "signatures": []
  }')

echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print('✅ 建立成功，ID:', data.get('id', '')) if 'id' in data else print('❌ 建立失敗:', data.get('detail', '未知錯誤'))"

APP_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)

if [ -z "$APP_ID" ]; then
    echo "❌ 無法獲取申請表 ID，終止測試"
    echo "響應內容: $CREATE_RESPONSE"
    exit 1
fi

# 3. 測試獲取申請表詳情
echo ""
echo "3. 測試獲取申請表詳情..."
DETAIL_RESPONSE=$(curl -s -X GET "http://localhost:8000/applications/$APP_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DETAIL_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'id' in data:
        print('✅ 獲取詳情成功')
        print('   標題:', data.get('title', ''))
        print('   presentation_formats:', data.get('presentation_formats', {}))
    else:
        print('❌ 獲取詳情失敗:', data.get('detail', '未知錯誤'))
except Exception as e:
    print('❌ JSON 解析錯誤:', str(e))
"

# 4. 測試匯出 PDF
echo ""
echo "4. 測試匯出 PDF..."
PDF_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8000/applications/$APP_ID/export-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o "/tmp/test_export_$APP_ID.pdf")

HTTP_CODE=$(echo "$PDF_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    PDF_SIZE=$(ls -lh "/tmp/test_export_$APP_ID.pdf" | awk '{print $5}')
    echo "✅ PDF 匯出成功，檔案大小: $PDF_SIZE"
    echo "   檔案位置: /tmp/test_export_$APP_ID.pdf"
else
    echo "❌ PDF 匯出失敗，HTTP 狀態碼: $HTTP_CODE"
fi

# 5. 測試教師審核
echo ""
echo "5. 測試教師登入並審核..."
TEACHER_LOGIN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"fhshbook@fhsh.tp.edu.tw","password":"復興123"}')

TEACHER_TOKEN=$(echo "$TEACHER_LOGIN" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TEACHER_TOKEN" ]; then
    echo "❌ 教師登入失敗"
else
    echo "✅ 教師登入成功"

    # 審核申請表
    REVIEW_RESPONSE=$(curl -s -X PATCH "http://localhost:8000/applications/$APP_ID/review" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TEACHER_TOKEN" \
      -d '{
        "status": "透過",
        "comment": "測試透過，非常好！"
      }')

    echo "$REVIEW_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'id' in data:
        print('✅ 審核成功')
        print('   狀態:', data.get('status', ''))
        print('   評語:', data.get('comment', ''))
    else:
        print('❌ 審核失敗:', data.get('detail', '未知錯誤'))
except Exception as e:
    print('❌ JSON 解析錯誤:', str(e))
"
fi

echo ""
echo "=========================================="
echo "測試完成！"
echo "=========================================="
