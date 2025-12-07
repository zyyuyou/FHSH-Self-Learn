# 自主學習計畫申請系統 - Docker 部署指南

## 🎯 系統簡介

臺北市立復興高階中學 - 自主學習計畫申請系統
使用 Docker 一鍵部署，包含前端、後端和資料庫。

### 技術棧

- **前端**: React 19 + TypeScript + Vite + Nginx
- **後端**: FastAPI + Python 3.11 + Beanie ODM
- **資料庫**: MongoDB 7.0
- **部署**: Docker + Docker Compose

---

## 📋 前置要求

1. **Docker Desktop** (macOS/Windows) 或 **Docker Engine** (Linux)
   - [下載 Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - 確保 Docker 正在執行

2. **Git** (用於克隆專案)

---

## 🚀 快速開始

### 方法一：使用啟動指令碼（推薦）

```bash
# 1. 進入專案目錄
cd self-learn-system

# 2. 執行啟動指令碼
./start.sh
```

### 方法二：手動啟動

```bash
# 1. 進入專案目錄
cd self-learn-system

# 2. 啟動所有服務
docker-compose up -d --build

# 3. 檢視服務狀態
docker-compose ps
```

---

## 🌐 訪問系統

服務啟動後，可透過以下地址訪問：

| 服務 | 地址 | 說明 |
|------|------|------|
| **前端** | http://localhost:3000 | React 應用介面 |
| **後端 API** | http://localhost:8000 | FastAPI 服務 |
| **API 檔案** | http://localhost:8000/docs | Swagger UI |
| **API 檔案** | http://localhost:8000/redoc | ReDoc |
| **MongoDB** | localhost:27017 | 資料庫連線 |

---

## 📝 建立測試賬號

訪問 API 檔案 (http://localhost:8000/docs)，使用 `POST /auth/register` 建立賬號：

### 學生賬號

```json
{
  "username": "s001",
  "password": "pass123",
  "role": "student",
  "student_id": "11430001",
  "student_name": "張三",
  "class_name": "101",
  "seat_number": 1
}
```

### 教師賬號

```json
{
  "username": "t001",
  "password": "pass123",
  "role": "teacher",
  "teacher_name": "李老師"
}
```

---

## 🔧 常用命令

### 檢視日誌

```bash
# 檢視所有服務日誌
docker-compose logs -f

# 檢視特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 重啟服務

```bash
# 重啟所有服務
docker-compose restart

# 重啟特定服務
docker-compose restart backend
```

### 停止服務

```bash
# 停止所有服務（保留資料）
docker-compose down

# 停止並刪除所有資料
docker-compose down -v
```

### 重新構建

```bash
# 重新構建並啟動
docker-compose up -d --build

# 只重新構建不啟動
docker-compose build
```

---

## 🗄️ 資料管理

### 匯入學生名單

```bash
# 1. 確保後端容器正在執行
docker-compose ps

# 2. 進入後端容器
docker exec -it self-learning-backend bash

# 3. 執行匯入指令碼
python scripts/import_students.py ../114-1全校名單.xlsx

# 4. 退出容器
exit
```

### 訪問 MongoDB

```bash
# 方法一：使用 mongosh
docker exec -it self-learning-mongodb mongosh

# 在 mongosh 中
use self_learning_system
show collections
db.users.find()

# 方法二：使用 MongoDB Compass
# 連線字串：mongodb://localhost:27017/self_learning_system
```

### 備份資料庫

```bash
# 備份
docker exec self-learning-mongodb mongodump --out /data/backup

# 複製備份到本地
docker cp self-learning-mongodb:/data/backup ./backup

# 恢復備份
docker exec self-learning-mongodb mongorestore /data/backup
```

---

## 🐛 故障排除

### 問題 1：埠被佔用

**錯誤資訊**：`port is already allocated`

**解決方法**：
```bash
# 檢視埠佔用
lsof -i :3000
lsof -i :8000
lsof -i :27017

# 修改 docker-compose.yml 中的埠對映
# 例如：將 "3000:3000" 改為 "3001:3000"
```

### 問題 2：容器無法啟動

**解決方法**：
```bash
# 檢視詳細錯誤日誌
docker-compose logs

# 清除舊容器和映象
docker-compose down -v
docker system prune -a

# 重新構建
docker-compose up -d --build
```

### 問題 3：前端無法連線後端

**檢查項**：
1. 確認所有容器都在執行：`docker-compose ps`
2. 檢查後端健康狀態：`curl http://localhost:8000/health`
3. 檢查 Nginx 配置：`docker exec self-learning-frontend cat /etc/nginx/conf.d/default.conf`

### 問題 4：資料庫連線失敗

**解決方法**：
```bash
# 檢查 MongoDB 是否健康
docker exec self-learning-mongodb mongosh --eval "db.adminCommand('ping')"

# 檢視 MongoDB 日誌
docker-compose logs mongodb

# 重啟 MongoDB
docker-compose restart mongodb
```

---

## 🔐 安全建議

### 生產環境部署前務必修改

1. **修改 JWT 金鑰**
   - 編輯 `docker-compose.yml`
   - 將 `SECRET_KEY` 改為隨機字串

2. **設定 MongoDB 密碼**
   ```yaml
   mongodb:
     environment:
       MONGO_INITDB_ROOT_USERNAME: admin
       MONGO_INITDB_ROOT_PASSWORD: your-strong-password
   ```

3. **禁用 DEBUG 模式**
   ```yaml
   backend:
     environment:
       DEBUG: "False"
   ```

4. **配置 HTTPS**
   - 使用 Let's Encrypt 或其他 SSL 證書
   - 更新 Nginx 配置

---

## 📦 系統架構

```
┌─────────────────┐
│   瀏覽器         │
│   (使用者端)       │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Frontend      │
│   (Nginx:3000)  │
│   React + Vite  │
└────────┬────────┘
         │ /api/*
         ▼
┌─────────────────┐
│   Backend       │
│   (FastAPI:8000)│
│   Beanie ODM    │
└────────┬────────┘
         │ MongoDB
         ▼
┌─────────────────┐
│   MongoDB       │
│   (27017)       │
└─────────────────┘
```

---

## 📄 檔案結構

```
self-learn-system/
├── docker-compose.yml      # 統一部署配置
├── Dockerfile              # 前端 Docker 映象
├── nginx.conf              # Nginx 配置
├── start.sh                # 一鍵啟動指令碼
│
├── backend/
│   ├── Dockerfile          # 後端 Docker 映象
│   ├── requirements.txt    # Python 依賴 (含 Beanie)
│   └── app/
│       ├── models/         # Beanie Document 模型
│       ├── services/       # 業務邏輯 (使用 Beanie API)
│       ├── routes/         # API 路由
│       └── database/       # Beanie 初始化
│
└── services/
    └── api.ts              # 前端 API 配置 (支援反向代理)
```

---

## 🎓 開發說明

### 本地開發模式

如需在開發時實時檢視程式碼更改：

```yaml
# 在 docker-compose.yml 中取消註釋
backend:
  volumes:
    - ./backend/app:/app/app  # 熱過載
```

### 前端開發

```bash
# 本地執行前端開發伺服器
npm install
npm run dev

# 前端會自動連線到 http://localhost:8000 後端
```

---

## 📞 技術支援

如遇問題，請提供以下資訊：
1. 錯誤日誌：`docker-compose logs`
2. 容器狀態：`docker-compose ps`
3. 系統資訊：`docker info`

---

**版本**: v1.0.0 (使用 Beanie ODM)
**最後更新**: 2025-11-20
**系統要求**: Docker 20.10+, Docker Compose 2.0+
