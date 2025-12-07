#!/bin/bash
set -e

echo "🚀 啟動後端服務..."

# 等待 MongoDB 就緒
echo "⏳ 等待 MongoDB 啟動..."
until curl -s http://mongodb:27017/ > /dev/null 2>&1; do
    echo "   MongoDB 尚未就緒，等待 2 秒..."
    sleep 2
done
echo "✅ MongoDB 已就緒"

# 檢查是否需要匯入學生資料
echo "🔍 檢查是否需要初始化資料..."

# 暫時關閉 set -e 以捕獲退出碼
set +e
python3 << 'PYTHON_SCRIPT'
import asyncio
import sys
sys.path.insert(0, '/app')

from app.database import mongodb_client
from app.models import Student

async def check_and_init():
    await mongodb_client.connect_db()
    count = await Student.count()
    await mongodb_client.close_db()

    if count == 0:
        print("📦 資料庫為空，需要匯入學生資料")
        sys.exit(1)  # 返回 1 表示需要匯入
    else:
        print(f"✅ 資料庫已有 {count} 條學生記錄，跳過匯入")
        sys.exit(0)  # 返回 0 表示不需要匯入

asyncio.run(check_and_init())
PYTHON_SCRIPT

# 儲存退出碼
NEED_IMPORT=$?
# 重新啟用 set -e
set -e

# 根據檢查結果決定是否匯入
if [ $NEED_IMPORT -eq 1 ]; then
    echo "📚 開始匯入學生資料和建立賬號..."
    python3 scripts/import_students.py /114-1全校名單.xlsx
    echo "✨ 初始化完成！"
else
    echo "⏭️  跳過資料匯入"
fi

# 啟動 FastAPI 應用
echo "🌐 啟動 FastAPI 服務..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
