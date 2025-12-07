#!/usr/bin/env python3
"""
測試教師審核功能
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# 教師登入資訊
TEACHER_EMAIL = "fhshbook@fhsh.tp.edu.tw"
TEACHER_PASSWORD = "teacher123"

def test_teacher_review():
    """測試教師審核功能"""

    print("=" * 80)
    print("測試教師審核功能")
    print("=" * 80)

    # 1. 教師登入
    print("\n【步驟1】教師登入...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        }
    )

    if login_response.status_code != 200:
        print(f"❌ 登入失敗: {login_response.status_code}")
        print(f"   {login_response.text}")
        return

    token = login_response.json()["access_token"]
    print(f"✅ 教師登入成功，獲得 token")

    # 2. 獲取申請表列表
    print("\n【步驟2】獲取申請表列表...")
    headers = {"Authorization": f"Bearer {token}"}

    apps_response = requests.get(
        f"{BASE_URL}/applications/",
        headers=headers
    )

    if apps_response.status_code != 200:
        print(f"❌ 獲取申請表失敗: {apps_response.status_code}")
        print(f"   {apps_response.text}")
        return

    applications = apps_response.json()
    print(f"✅ 獲得 {len(applications)} 個申請表")

    if len(applications) == 0:
        print("⚠️  沒有申請表可以審核")
        return

    # 選擇第一個申請表
    app_id = applications[0]["id"]
    print(f"\n選擇申請表 ID: {app_id}")
    print(f"   標題: {applications[0]['title']}")
    print(f"   狀態: {applications[0]['status']}")

    # 3. 測試新增評論（不改變狀態）
    print("\n【步驟3】測試只新增評論...")
    review_data = {
        "status": applications[0]['status'],  # 保持原狀態
        "comment": "測試評論：這是一個很好的計畫，建議加強學習目標的具體性。"
    }

    print(f"   傳送評論請求...")
    review_response = requests.patch(
        f"{BASE_URL}/applications/{app_id}/review",
        headers=headers,
        json=review_data
    )

    print(f"\n回應狀態碼: {review_response.status_code}")

    if review_response.status_code == 200:
        print("✅ 成功新增評論！")
        result = review_response.json()
        print(f"   更新後狀態: {result['status']}")
        print(f"   評論內容: {result['comment']}")
    else:
        print(f"❌ 新增評論失敗")
        print(f"   狀態碼: {review_response.status_code}")
        print(f"   回應: {review_response.text[:500]}")
        return

    # 4. 測試透過申請
    print("\n【步驟4】測試透過申請...")
    review_data = {
        "status": "透過",
        "comment": "計畫內容充實，準備充分，予以透過。"
    }

    print(f"   傳送透過請求...")
    review_response = requests.patch(
        f"{BASE_URL}/applications/{app_id}/review",
        headers=headers,
        json=review_data
    )

    print(f"\n回應狀態碼: {review_response.status_code}")

    if review_response.status_code == 200:
        print("✅ 成功透過申請！")
        result = review_response.json()
        print(f"   更新後狀態: {result['status']}")
        print(f"   評論內容: {result['comment']}")
    else:
        print(f"❌ 透過申請失敗")
        print(f"   狀態碼: {review_response.status_code}")
        print(f"   回應: {review_response.text[:500]}")
        return

    # 5. 測試未透過申請
    print("\n【步驟5】測試未透過申請...")
    review_data = {
        "status": "未透過",
        "comment": "學習目標不夠明確，請修改後重新提交。"
    }

    print(f"   傳送未透過請求...")
    review_response = requests.patch(
        f"{BASE_URL}/applications/{app_id}/review",
        headers=headers,
        json=review_data
    )

    print(f"\n回應狀態碼: {review_response.status_code}")

    if review_response.status_code == 200:
        print("✅ 成功標記為未透過！")
        result = review_response.json()
        print(f"   更新後狀態: {result['status']}")
        print(f"   評論內容: {result['comment']}")
    else:
        print(f"❌ 未透過申請失敗")
        print(f"   狀態碼: {review_response.status_code}")
        print(f"   回應: {review_response.text[:500]}")
        return

    print("\n" + "=" * 80)
    print("✅ 所有測試完成！")
    print("=" * 80)

if __name__ == "__main__":
    test_teacher_review()
