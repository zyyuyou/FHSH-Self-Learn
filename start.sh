#!/bin/bash
echo "========================================"
echo "  自主學習系統 - 一鍵部署"
echo "========================================"
echo ""
echo "正在建置並啟動服務..."
echo "（首次執行需要較長時間，請耐心等候）"
echo ""
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo ""
echo "========================================"
echo "  部署完成！"
echo "  前端網址: http://localhost:3000"
echo "  後端 API: http://localhost:8000"
echo "========================================"
