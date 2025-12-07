#!/usr/bin/env python3
"""
資料遷移指令碼 - 統一 has_submitted 欄位格式

目的:
將舊格式的 has_submitted 欄位統一轉換為新格式
- 舊格式可能是: true/false (boolean) 或 '是'/'第一次申請'/'否' (string)
- 新格式應為: '是'/'否' (string)

遷移規則:
- true → '是'
- false → '否'
- '是' → '是' (保持不變)
- '第一次申請' → '是' (視為已提交過)
- '否' → '否' (保持不變)
- null/undefined → '否' (預設值)
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

# MongoDB 連線設定
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
DATABASE_NAME = "self_learning"
COLLECTION_NAME = "applications"


async def migrate_has_submitted():
    """執行資料遷移"""
    print("=" * 80)
    print("開始遷移 has_submitted 欄位...")
    print("=" * 80)

    # 連線資料庫
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    try:
        # 統計資訊
        total_applications = await collection.count_documents({})
        print(f"\n總申請數: {total_applications}")

        if total_applications == 0:
            print("沒有需要遷移的資料")
            return

        # 找出所有申請
        applications = await collection.find({}).to_list(length=None)

        migrated_count = 0
        error_count = 0
        unchanged_count = 0

        for app in applications:
            app_id = app["_id"]
            members = app.get("members", [])

            if not members:
                continue

            needs_update = False
            updated_members = []

            for member in members:
                has_submitted = member.get("has_submitted")
                original_value = has_submitted

                # 轉換邏輯
                if has_submitted is True or has_submitted == "是" or has_submitted == "第一次申請":
                    new_value = "是"
                elif has_submitted is False or has_submitted == "否":
                    new_value = "否"
                elif has_submitted is None or has_submitted == "":
                    new_value = "否"
                else:
                    # 未知格式，預設為"否"
                    print(f"⚠️  警告: 申請 {app_id} 的成員有未知的 has_submitted 值: {has_submitted}")
                    new_value = "否"

                # 檢查是否需要更新
                if original_value != new_value:
                    needs_update = True
                    print(f"  轉換: {original_value} → {new_value}")

                # 更新成員資料
                member["has_submitted"] = new_value
                updated_members.append(member)

            # 如果需要更新，則更新資料庫
            if needs_update:
                try:
                    result = await collection.update_one(
                        {"_id": app_id},
                        {"$set": {"members": updated_members}}
                    )

                    if result.modified_count > 0:
                        migrated_count += 1
                        print(f"✅ 已更新申請 {app_id}")
                    else:
                        error_count += 1
                        print(f"❌ 更新失敗: 申請 {app_id}")

                except Exception as e:
                    error_count += 1
                    print(f"❌ 更新申請 {app_id} 時發生錯誤: {e}")
            else:
                unchanged_count += 1

        # 輸出結果
        print("\n" + "=" * 80)
        print("遷移完成！")
        print("=" * 80)
        print(f"總申請數: {total_applications}")
        print(f"已更新: {migrated_count}")
        print(f"無需更新: {unchanged_count}")
        print(f"錯誤: {error_count}")
        print("=" * 80)

        # 驗證遷移結果
        print("\n正在驗證遷移結果...")
        verification_apps = await collection.find({}).to_list(length=None)

        invalid_count = 0
        for app in verification_apps:
            members = app.get("members", [])
            for member in members:
                has_submitted = member.get("has_submitted")
                if has_submitted not in ["是", "否", None, ""]:
                    invalid_count += 1
                    print(f"⚠️  發現無效值: 申請 {app['_id']}, has_submitted = {has_submitted}")

        if invalid_count == 0:
            print("✅ 驗證透過！所有 has_submitted 欄位都已正確格式化")
        else:
            print(f"⚠️  發現 {invalid_count} 個無效值")

    except Exception as e:
        print(f"❌ 遷移過程中發生錯誤: {e}")
        import traceback
        traceback.print_exc()

    finally:
        client.close()


async def rollback_migration():
    """回滾遷移（如果需要）"""
    print("回滾功能尚未實現")
    print("建議在遷移前備份資料庫")


async def check_data_status():
    """檢查當前資料狀態"""
    print("=" * 80)
    print("檢查當前資料狀態...")
    print("=" * 80)

    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    try:
        total = await collection.count_documents({})
        print(f"\n總申請數: {total}")

        if total == 0:
            print("沒有資料")
            return

        # 統計不同值的數量
        apps = await collection.find({}).to_list(length=None)

        value_counts = {}
        for app in apps:
            members = app.get("members", [])
            for member in members:
                has_submitted = member.get("has_submitted")
                value_type = type(has_submitted).__name__
                value_str = f"{value_type}: {has_submitted}"
                value_counts[value_str] = value_counts.get(value_str, 0) + 1

        print("\nhas_submitted 欄位值分佈:")
        for value, count in sorted(value_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {value}: {count} 次")

        print("=" * 80)

    except Exception as e:
        print(f"❌ 檢查過程中發生錯誤: {e}")

    finally:
        client.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "check":
            asyncio.run(check_data_status())
        elif command == "migrate":
            asyncio.run(migrate_has_submitted())
        elif command == "rollback":
            asyncio.run(rollback_migration())
        else:
            print("未知命令")
            print("用法:")
            print("  python migrate_has_submitted.py check    - 檢查當前資料狀態")
            print("  python migrate_has_submitted.py migrate  - 執行遷移")
            print("  python migrate_has_submitted.py rollback - 回滾遷移（尚未實現）")
    else:
        print("用法:")
        print("  python migrate_has_submitted.py check    - 檢查當前資料狀態")
        print("  python migrate_has_submitted.py migrate  - 執行遷移")
        print("  python migrate_has_submitted.py rollback - 回滾遷移（尚未實現）")
