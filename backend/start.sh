#!/bin/bash

# 自主學習計劃申請系統 - 後端啟動指令碼

echo "🚀 啟動自主學習計劃申請系統後端..."

# 檢查 .env 檔案是否存在
if [ ! -f .env ]; then
    echo "📝 建立 .env 配置檔案..."
    cp .env.example .env
    echo "⚠️  請編輯 .env 檔案，修改必要的配置（如 SECRET_KEY）"
    echo "   然後重新執行此指令碼"
    exit 1
fi

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    echo "   下載地址: https://www.docker.com/get-started"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 啟動服務
echo "🐳 啟動 Docker 容器..."
docker-compose up -d

# 檢查容器狀態
echo ""
echo "📊 檢查容器狀態..."
docker-compose ps

echo ""
echo "✅ 後端服務已啟動！"
echo ""
echo "📚 訪問以下地址："
echo "   - API 檔案 (Swagger): http://localhost:8000/docs"
echo "   - API 檔案 (ReDoc):   http://localhost:8000/redoc"
echo "   - 健康檢查:           http://localhost:8000/health"
echo ""
echo "📝 檢視日誌:"
echo "   docker-compose logs -f backend"
echo ""
echo "🛑 停止服務:"
echo "   docker-compose down"
echo ""
