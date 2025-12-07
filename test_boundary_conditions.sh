#!/bin/bash

echo "=========================================="
echo "邊界條件測試指令碼"
echo "=========================================="
echo ""

# Test 1: 空學號
echo "測試1: 空學號"
echo "輸入: ''"
echo "預期: 不傳送請求或返回錯誤"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:8000/students/" 2>&1)
echo "結果: $response"
echo ""

# Test 2: 不存在的學號
echo "測試2: 不存在的學號"
echo "輸入: '99999999'"
echo "預期: 404 找不到學生"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:8000/students/99999999")
echo "$response"
echo ""

# Test 3: 有效學號 (邊界值 - 第一個學生)
echo "測試3: 有效學號 - 第一個學生"
echo "輸入: '11430001'"
echo "預期: 返回詹景涵的資料"
response=$(curl -s "http://localhost:8000/students/11430001" | python3 -m json.tool 2>/dev/null)
echo "$response"
echo ""

# Test 4: 有效學號 (另一個學生)
echo "測試4: 有效學號 - 另一個學生"
echo "輸入: '11430002'"
echo "預期: 返回蔡旻芯的資料"
response=$(curl -s "http://localhost:8000/students/11430002" | python3 -m json.tool 2>/dev/null)
echo "$response"
echo ""

# Test 5: 特殊字元學號
echo "測試5: 特殊字元學號"
echo "輸入: 'ABC123!@#'"
echo "預期: 404 找不到學生"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:8000/students/ABC123!@#")
echo "$response"
echo ""

# Test 6: 超長學號
echo "測試6: 超長學號"
echo "輸入: '11111111111111111111'"
echo "預期: 404 找不到學生"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:8000/students/11111111111111111111")
echo "$response"
echo ""

# Test 7: 數字學號但不存在
echo "測試7: 數字學號但不存在"
echo "輸入: '10000000'"
echo "預期: 404 找不到學生"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:8000/students/10000000")
echo "$response"
echo ""

# Test 8: API 端點測試 (確認CORS)
echo "測試8: CORS設定"
echo "預期: 允許跨域請求"
response=$(curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS -I "http://localhost:8000/students/11430001" | grep -i "access-control")
echo "$response"
echo ""

echo "=========================================="
echo "測試完成"
echo "=========================================="
