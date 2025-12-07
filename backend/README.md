# 自主學習計劃申請系統 - 後端 API

臺北市立復興高階中學 自主學習計劃申請系統的 FastAPI 後端服務。

## 📋 專案概述

本系統使用 FastAPI 框架開發，提供完整的 RESTful API，支援：

- 🔐 學生和教師身份認證
- 📝 自主學習計劃申請表的 CRUD 操作
- 👨‍🎓 學生名單管理
- 👨‍🏫 教師稽覈功能
- 🗄️ MongoDB 資料持久化

## 🏗️ 技術棧

- **框架**: FastAPI 0.115.6
- **資料庫**: MongoDB 7.0
- **認證**: JWT (python-jose)
- **密碼加密**: bcrypt (passlib)
- **資料驗證**: Pydantic v2
- **非同步驅動**: Motor (MongoDB 非同步驅動)

## 📁 專案結構

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 主應用
│   ├── config.py               # 配置檔案
│   ├── dependencies.py         # 依賴注入
│   ├── database/               # 資料庫連線
│   │   ├── __init__.py
│   │   └── mongodb.py          # MongoDB 連線（預留老師 SDK 介面）
│   ├── models/                 # 資料模型
│   │   ├── __init__.py
│   │   ├── base.py             # 基礎模型
│   │   ├── user.py             # 使用者模型
│   │   ├── student.py          # 學生模型
│   │   └── application.py      # 申請表模型
│   ├── routes/                 # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py             # 認證路由
│   │   ├── applications.py     # 申請表路由
│   │   └── students.py         # 學生路由
│   ├── services/               # 業務邏輯層
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── application_service.py
│   │   └── student_service.py
│   └── utils/                  # 工具函式
│       ├── __init__.py
│       └── auth.py             # 認證工具
├── scripts/
│   └── import_students.py      # 匯入學生資料指令碼
├── requirements.txt            # Python 依賴
├── Dockerfile                  # Docker 映象配置
├── docker-compose.yml          # Docker Compose 配置
├── .env.example                # 環境變數示例
└── README.md                   # 專案檔案
```

## 🚀 快速開始

### 方式一：使用 Docker（推薦）

#### 1. 複製環境變數檔案

```bash
cd backend
cp .env.example .env
```

#### 2. 啟動服務

```bash
docker-compose up -d
```

這將啟動：
- MongoDB 資料庫（埠 27017）
- FastAPI 後端服務（埠 8000）

#### 3. 檢視日誌

```bash
docker-compose logs -f backend
```

#### 4. 停止服務

```bash
docker-compose down
```

### 方式二：本地開發

#### 1. 安裝依賴

```bash
cd backend
pip install -r requirements.txt
```

#### 2. 啟動 MongoDB

確保本地 MongoDB 服務執行在 `localhost:27017`

#### 3. 配置環境變數

```bash
cp .env.example .env
# 編輯 .env 檔案，修改配置
```

#### 4. 啟動服務

```bash
# 使用 uvicorn 直接啟動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或使用 Python 啟動
python -m app.main
```

## 📊 匯入學生資料

使用提供的指令碼匯入全校學生名單：

```bash
python scripts/import_students.py ../114-1全校名單.xlsx
```

## 📚 API 檔案

啟動服務後，訪問以下地址檢視 API 檔案：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要 API 端點

#### 認證相關
- `POST /auth/login` - 使用者登入
- `POST /auth/register` - 使用者註冊（僅開發測試）

#### 申請表相關
- `POST /applications/` - 建立申請表
- `GET /applications/` - 獲取申請表列表
- `GET /applications/{id}` - 獲取申請表詳情
- `PUT /applications/{id}` - 更新申請表
- `PATCH /applications/{id}/review` - 稽覈申請表（教師）
- `DELETE /applications/{id}` - 刪除申請表

#### 學生相關
- `GET /students/` - 獲取學生列表
- `GET /students/search?keyword=xxx` - 搜尋學生
- `GET /students/{student_id}` - 獲取學生詳情
- `GET /students/class/{class_name}` - 獲取班級學生

## 🔐 認證流程

1. 使用 `POST /auth/login` 登入，獲取 JWT token
2. 在後續請求的 Header 中新增：`Authorization: Bearer <token>`
3. Token 有效期為 24 小時（可在 .env 中配置）

### 測試賬號建立

```bash
# 使用 /auth/register 端點建立測試賬號
curl -X POST "http://localhost:8000/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "11430001",
        "password": "password123",
        "role": "student",
        "student_id": "11430001",
        "student_name": "張三",
        "class_name": "101",
        "seat_number": 1
    }'
```

## 🔧 老師 MongoDB SDK 整合說明

**重要**: 當前使用的是標準 PyMongo/Motor 驅動，老師提供 SDK 後需要替換。

### 需要修改的檔案

1. `app/database/mongodb.py`
    - 替換 `MongoDBClient` 類的實現
    - 參考檔案中的整合示例程式碼

2. 更新 `requirements.txt`
    - 新增老師的 SDK 依賴

### 整合步驟

詳見 `app/database/mongodb.py` 檔案中的註釋說明。

## 🗄️ 資料庫集合

- `users` - 使用者集合（學生和教師）
- `students` - 學生名單集合
- `applications` - 申請表集合

## 🛠️ 開發工具

### 執行測試

```bash
# TODO: 新增測試
pytest
```

### 程式碼格式化

```bash
# 使用 black 格式化程式碼
black app/

# 使用 isort 整理匯入
isort app/
```

## 📦 環境變數說明

| 變數名 | 說明 | 預設值 |
|--------|------|--------|
| `APP_NAME` | 應用名稱 | 自主學習計劃申請系統 API |
| `DEBUG` | 除錯模式 | True |
| `MONGODB_URL` | MongoDB 連線字串 | mongodb://localhost:27017 |
| `MONGODB_DB_NAME` | 資料庫名稱 | self_learning_system |
| `SECRET_KEY` | JWT 金鑰 | - |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 過期時間（分鐘） | 1440 |
| `CORS_ORIGINS` | 允許的前端域名 | - |

## 🐛 常見問題

### Q: MongoDB 連線失敗？
A: 檢查 MongoDB 服務是否啟動，確認 `MONGODB_URL` 配置正確。

### Q: Token 認證失敗？
A: 確認請求 Header 中包含正確的 `Authorization: Bearer <token>`。

### Q: CORS 錯誤？
A: 在 `.env` 檔案中新增前端地址到 `CORS_ORIGINS`。

## 📝 TODO

- [ ] 新增單元測試
- [ ] 新增 API 限流
- [ ] 新增日誌系統
- [ ] 整合老師的 MongoDB SDK
- [ ] 新增檔案上傳功能（簽章圖片）
- [ ] 新增 PDF 匯出功能

## 📄 License

本專案僅供臺北市立復興高階中學內部使用。

## 👥 聯絡方式

如有問題，請聯絡系統管理員。

---

**注意**: 所有縮排使用四個空格，符合 Python PEP 8 規範。
