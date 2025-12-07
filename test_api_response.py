#!/usr/bin/env python3
"""測試API返回的資料"""
import requests
import json

# 使用已登入的帳號
# 你需要在瀏覽器中登入後，從開發者工具的Network標籤中複製一個有效的token

# 或者我們直接檢視後端日誌中的請求
print("請在瀏覽器中：")
print("1. 開啟 http://localhost:3000")
print("2. 使用教師帳號登入")
print("3. 開啟開發者工具 (F12)")
print("4. 切換到 Network 標籤")
print("5. 重新整理頁面")
print("6. 檢視 applications/ 請求的 Response")
print("\n請檢查 Response 中是否包含 submitter_student_id 欄位")
