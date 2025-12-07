# 自主學習計畫申請系統

臺北市立復興高階中學 - 自主學習計畫申請系統

![系統架構](https://img.shields.io/badge/Docker-部署-blue) ![前端](https://img.shields.io/badge/React-19-61dafb) ![後端](https://img.shields.io/badge/FastAPI-Python-green) ![資料庫](https://img.shields.io/badge/MongoDB-7.0-47A248)

## 📋 系統簡介

本系統用於學生申請自主學習計畫，提供完整的線上申請、審核流程。**系統已完成 Docker 容器化，老師只需一個指令即可啟動，全校師生即可透過瀏覽器使用**。

### ✨ 功能特色

#### 🎓 學生功能
- 線上填寫自主學習計畫申請表
- 檢視申請歷史和審核狀態
- 電子簽名功能
- 即時檢視審核意見

#### 👨‍🏫 教師功能
- 審核學生申請
- 填寫評語和意見
- 篩選和管理申請表
- 批次處理申請

#### 🔐 系統功能
- JWT 身份認證
- 角色許可權管理（學生/教師）
- 完整的學生名單（1822位學生已預載）
- 資料持久化儲存

## 🏗️ 技術架構

```
┌─────────────────────────────────────────┐
│    前端 (React 19 + Vite)                │
│    Port: 3000                            │
│    - 使用者介面                          │
│    - 申請表單與審核                      │
└─────────────┬───────────────────────────┘
              │ HTTP/JSON API
              ▼
┌─────────────────────────────────────────┐
│    後端 (FastAPI + Beanie ODM)           │
│    Port: 8000                            │
│    - RESTful API                         │
│    - JWT 認證                            │
│    - 業務邏輯處理                        │
└─────────────┬───────────────────────────┘
              │ Beanie ODM
              ▼
┌─────────────────────────────────────────┐
│    資料庫 (MongoDB 7.0)                  │
│    Port: 27017                           │
│    - 使用者資料                          │
│    - 申請表資料                          │
│    - 學生名單 (1822位)                   │
└─────────────────────────────────────────┘
```

**技術棧：**
- **前端**: React 19 + TypeScript + Vite + Nginx
- **後端**: FastAPI + Python 3.11 + Beanie ODM
- **資料庫**: MongoDB 7.0
- **部署**: Docker + Docker Compose

## 🚀 一鍵部署指南（老師必讀）

### 📋 前置需求

1. **安裝 Docker Desktop**
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **確認 Docker 執行**
   ```bash
   docker --version
   docker-compose --version
   ```

   應該顯示類似：
   ```
   Docker version 24.0.0
   Docker Compose version v2.20.0
   ```

### 🎯 部署步驟（3 步驟完成）

#### 步驟 1: 取得專案檔案

將專案資料夾複製到您的電腦，或使用 Git：

```bash
git clone <repository-url>
cd self-learn-system
```

#### 步驟 2: 啟動系統（一鍵部署）

在專案根目錄執行：

```bash
docker-compose up -d
```

系統會自動：
1. 下載並建置所需的 Docker 映像檔
2. 啟動 MongoDB 資料庫
3. 啟動後端 API 服務
4. **自動匯入 1822 位學生資料**
5. **自動為所有學生建立登入賬號**
6. 啟動前端網頁服務

**首次啟動需要 3-5 分鐘下載映像檔和初始化資料，請耐心等待。**

**自動建立的帳號：**
- **學生賬號**：1822 個
  - 賬號格式：`{學號}@fhsh.tp.edu.tw`（例如：`11430001@fhsh.tp.edu.tw`）
  - 初始密碼：學號本身（例如：`11430001`）
- **教師賬號**：1 個預設帳號
  - 帳號：`fhshbook@fhsh.tp.edu.tw`
  - 密碼：`fhshbook`

#### 步驟 3: 驗證部署成功

執行以下指令檢查服務狀態：

```bash
docker-compose ps
```

應該看到三個服務都在執行：

```
NAME                     STATUS
self-learning-mongodb    Up (healthy)
self-learning-backend    Up (healthy)
self-learning-frontend   Up
```

## 🌐 訪問系統

### 📱 給全校師生的訪問地址

#### 在同一臺電腦上（本機訪問）

- **學生/教師入口**: http://localhost:3000
- **API 檔案**: http://localhost:8000/docs

#### 在校內網路上（讓其他電腦訪問）

1. **查詢部署電腦的 IP 位址**：

   **macOS/Linux**:
   ```bash
   ifconfig | grep "inet "
   ```

   **Windows**:
   ```cmd
   ipconfig
   ```

   例如查到 IP 是 `192.168.1.100`

2. **讓全校師生訪問**：
   - **學生/教師入口**: http://192.168.1.100:3000
   - **API 檔案**: http://192.168.1.100:8000/docs

3. **重要提醒**：
   - 確保防火牆允許 3000 和 8000 埠訪問
   - 確保部署的電腦保持開機狀態
   - 建議使用有線網路連線以確保穩定性

### 🔍 系統健康檢查

訪問 http://localhost:8000/health 應該看到：

```json
{
    "status": "healthy",
    "database": "connected"
}
```

## 📊 系統資料說明

### 自動初始化資料

**首次啟動時，系統會自動完成以下初始化：**

✅ **自動匯入 1822 位學生資料** (來自 `114-1全校名單.xlsx`)
  - 包含學號、班級、座號、姓名
  - 儲存至 MongoDB 的 `students` 集合

✅ **自動建立 1822 個學生賬號**
  - 賬號格式：`{學號}@fhsh.tp.edu.tw`
  - 密碼：學號本身
  - 儲存至 MongoDB 的 `users` 集合
  - 學生可直接使用這些賬號登入系統

✅ **自動建立 1 個預設教師賬號**
  - 帳號：`fhshbook@fhsh.tp.edu.tw`
  - 密碼：`fhshbook`
  - 角色：教師（可審核學生申請）

### 學生登入方式

**所有學生都已經有賬號，無需註冊！**

學生可直接使用以下方式登入：
- **賬號**：`學號@fhsh.tp.edu.tw`（例如：`11430001@fhsh.tp.edu.tw`）
- **密碼**：學號（例如：`11430001`）

**範例：**
```
賬號：11430001@fhsh.tp.edu.tw
密碼：11430001
```

### 教師登入方式

**系統已預設一個教師帳號，可直接登入！**

- **帳號**：`fhshbook@fhsh.tp.edu.tw`
- **密碼**：`fhshbook`
- **用途**：圖書館預設帳號，用於審核學生申請

**範例：**
```
帳號：fhshbook@fhsh.tp.edu.tw
密碼：fhshbook
```

**其他教師帳號建立：**

如需建立更多教師帳號，可訪問 http://localhost:8000/docs 使用 Swagger UI 介面。

## 🛠️ 日常維護指令

### 檢視系統狀態

```bash
docker-compose ps
```

### 檢視系統日誌

```bash
# 檢視所有服務日誌
docker-compose logs -f

# 只檢視後端日誌
docker-compose logs -f backend

# 只檢視前端日誌
docker-compose logs -f frontend
```

### 停止系統

```bash
docker-compose down
```

**注意：停止後資料不會遺失，再次啟動時資料仍在。**

### 重啟系統

```bash
docker-compose restart
```

### 完全重置系統（清空所有資料）

```bash
# ⚠️ 警告：這會刪除所有申請表和帳號！
docker-compose down -v

# 重新啟動
docker-compose up -d
```

### 更新系統程式碼

```bash
# 1. 停止服務
docker-compose down

# 2. 取得最新程式碼
git pull

# 3. 重新建置並啟動
docker-compose up -d --build
```

## 📁 專案結構

```
self-learn-system/
├── docker-compose.yml          # Docker 編排配置（主要部署檔案）
├── Dockerfile                  # 前端 Docker 映像檔配置
├── nginx.conf                  # Nginx 網頁伺服器配置
├── .dockerignore              # Docker 忽略檔案
│
├── components/                 # React 前端元件
│   ├── LoginPage.tsx          # 登入頁面
│   ├── ApplicationFormPage.tsx # 申請表單頁面
│   ├── HistoryPage.tsx        # 歷史記錄頁面
│   ├── Header.tsx             # 導航欄
│   ├── SignaturePad.tsx       # 簽名板元件
│   └── CommentModal.tsx       # 評論彈窗
│
├── services/                   # 前端服務
│   └── api.ts                 # API 通訊服務
│
├── backend/                    # 後端專案
│   ├── app/                   # 應用程式碼
│   │   ├── models/            # 資料模型 (Beanie ODM)
│   │   ├── routes/            # API 路由
│   │   ├── services/          # 業務邏輯
│   │   ├── database/          # 資料庫連線
│   │   └── main.py            # 主應用程式
│   │
│   ├── scripts/               # 工具指令碼
│   │   └── import_students.py # 學生名單匯入
│   │
│   ├── Dockerfile             # 後端 Docker 映像檔配置
│   └── requirements.txt       # Python 套件依賴
│
├── 114-1全校名單.xlsx         # 學生名單資料（已匯入）
├── package.json               # 前端套件配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 建置配置
└── README.md                  # 本檔案
```

## 🐛 常見問題排解

### Q1: 執行 `docker-compose up -d` 時出現錯誤？

**可能原因 1：埠被佔用**

檢查 3000、8000、27017 埠是否被佔用：

```bash
# macOS/Linux
lsof -i :3000
lsof -i :8000
lsof -i :27017

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :27017
```

解決方法：關閉佔用埠的程式，或修改 `docker-compose.yml` 中的埠配置。

**可能原因 2：Docker 未啟動**

確認 Docker Desktop 正在執行。

**可能原因 3：磁碟空間不足**

檢查磁碟空間，至少需要 5GB 可用空間。

### Q2: 前端頁面無法載入？

1. 確認前端容器正在執行：
   ```bash
   docker-compose ps
   ```

2. 檢視前端日誌：
   ```bash
   docker-compose logs frontend
   ```

3. 確認訪問的地址正確：http://localhost:3000

### Q3: 後端 API 無法連線？

1. 確認後端容器健康：
   ```bash
   docker-compose ps
   ```

   應該顯示 `Up (healthy)`

2. 檢視後端日誌：
   ```bash
   docker-compose logs backend
   ```

3. 測試健康檢查端點：
   ```bash
   curl http://localhost:8000/health
   ```

### Q4: 無法登入或註冊？

1. 檢查 MongoDB 是否正常執行：
   ```bash
   docker-compose logs mongodb
   ```

2. 學生註冊時確認：
   - 學號、班級、座號、姓名是否正確
   - 是否在學生名單中

3. 檢查瀏覽器控制檯是否有錯誤訊息（按 F12）

### Q5: 如何檢視資料庫內容？

```bash
# 進入 MongoDB 容器
docker exec -it self-learning-mongodb mongosh

# 在 mongosh 中執行：
use self_learning_system

# 檢視所有集合
show collections

# 查詢使用者
db.users.find().pretty()

# 查詢申請表
db.applications.find().pretty()

# 查詢學生名單
db.students.find().limit(5).pretty()

# 退出
exit
```

### Q6: 如何備份資料？

```bash
# 建立備份目錄
mkdir -p backups

# 備份整個資料庫
docker exec self-learning-mongodb mongodump \
  --db=self_learning_system \
  --out=/tmp/backup

# 複製備份到本機
docker cp self-learning-mongodb:/tmp/backup ./backups/backup-$(date +%Y%m%d)
```

### Q7: 如何還原備份？

```bash
# 複製備份到容器
docker cp ./backups/backup-YYYYMMDD self-learning-mongodb:/tmp/restore

# 還原資料庫
docker exec self-learning-mongodb mongorestore \
  --db=self_learning_system \
  /tmp/restore/self_learning_system
```

### Q8: 系統執行緩慢？

1. 檢查 Docker 資源配置（Docker Desktop → Settings → Resources）
   - 建議至少分配：
     - CPU: 2 核心
     - 記憶體: 4GB
     - 磁碟空間: 10GB

2. 重啟 Docker Desktop

3. 清理未使用的 Docker 資源：
   ```bash
   docker system prune -a
   ```

## 🔒 安全性建議

### 正式部署前必須修改

在正式環境使用前，**務必**修改以下安全設定：

1. **修改 JWT 金鑰**

   編輯 `backend/.env`：
   ```env
   SECRET_KEY=your-very-secret-key-change-this-in-production
   ```

2. **限制 CORS 來源**

   編輯 `backend/.env`：
   ```env
   CORS_ORIGINS=["http://your-school-domain.edu.tw"]
   ```

3. **更改預設密碼**

   建議首次部署後立即要求所有使用者修改密碼。

4. **啟用 HTTPS**

   正式環境建議配置 SSL 憑證，使用 HTTPS 協定。

## 📞 技術支援

### 系統資訊

- **系統版本**: 1.0.0
- **最後更新**: 2025-11-20
- **Python 版本**: 3.11
- **Node.js 版本**: 20
- **MongoDB 版本**: 7.0

### 回報問題

如遇到技術問題，請提供以下資訊：

1. 錯誤訊息截圖
2. 系統日誌：
   ```bash
   docker-compose logs > logs.txt
   ```
3. 系統環境：作業系統版本、Docker 版本

## 📚 相關檔案

- [專案總覽](PROJECT_OVERVIEW.md) - 完整的系統設計檔案
- [後端檔案](backend/README.md) - 後端 API 詳細說明
- [API 檔案](http://localhost:8000/docs) - 互動式 API 檔案（需啟動服務後訪問）

## 📝 更新日誌

### v1.0.0 (2025-11-20)

#### 新增功能
- ✅ 完整的 Docker 一鍵部署
- ✅ **自動初始化：匯入學生資料並建立賬號**
- ✅ 前端 React 19 介面
- ✅ 後端 FastAPI + Beanie ODM
- ✅ MongoDB 7.0 資料庫
- ✅ 學生名單預載（1822位）
- ✅ **1822 個學生賬號自動建立**
- ✅ **1 個預設教師賬號自動建立**
- ✅ JWT 身份認證
- ✅ 學生申請表功能
- ✅ 教師審核功能
- ✅ 歷史記錄查詢
- ✅ 健康檢查端點

#### 技術改進
- ✅ 統一 4 空格縮排
- ✅ 型別安全的資料庫操作（Beanie ODM）
- ✅ 自動健康檢查
- ✅ 服務依賴管理
- ✅ 日誌記錄

---

## 🎓 快速上手總結

**給老師的最簡指南：**

1. **安裝 Docker Desktop**
2. **開啟終端機，進入專案目錄**
3. **執行：`docker-compose up -d`**
4. **等待 3-5 分鐘（系統會自動初始化）**
   - 自動匯入 1822 位學生資料
   - 自動為所有學生建立登入賬號
5. **開啟瀏覽器訪問：http://localhost:3000**
6. **✅ 完成！全校師生可以開始使用**

**登入方式：**

學生：
- 賬號：`學號@fhsh.tp.edu.tw`（例如：`11430001@fhsh.tp.edu.tw`）
- 密碼：學號（例如：`11430001`）

教師：
- 賬號：`fhshbook@fhsh.tp.edu.tw`
- 密碼：`fhshbook`

如需停止系統：`docker-compose down`

---

**© 2025 臺北市立復興高階中學 - 自主學習計畫申請系統**

**本系統僅供校內使用。**
