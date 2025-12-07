#!/bin/bash

# 自主學習計畫申請系統 - 一鍵啟動指令碼

echo "========================================="
echo "  自主學習計畫申請系統 - Docker 部署  "
echo "========================================="
echo ""

# 檢查 Docker 是否執行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 錯誤：Docker 未執行，請先啟動 Docker Desktop"
    exit 1
fi

echo "✅ Docker 正在執行"
echo ""

# 停止並清除舊容器（可選）
read -p "是否清除舊資料並重新部署？ (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  清除舊容器和資料卷..."
    docker-compose down -v
fi

# 構建並啟動服務
echo "🚀 開始構建並啟動服務..."
echo ""
docker-compose up -d --build

# 等待服務啟動
echo ""
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo ""
echo "📊 檢查服務狀態..."
docker-compose ps

echo ""
echo "========================================="
echo "  ✅ 部署完成！"
echo "========================================="
echo ""
echo "📱 訪問地址："
echo "   前端：http://localhost:3000"
echo "   後端 API：http://localhost:8000"
echo "   API 檔案：http://localhost:8000/docs"
echo "   MongoDB：localhost:27017"
echo ""
echo "📝 常用命令："
echo "   檢視日誌：docker-compose logs -f"
echo "   停止服務：docker-compose down"
echo "   重啟服務：docker-compose restart"
echo ""
echo "========================================="
