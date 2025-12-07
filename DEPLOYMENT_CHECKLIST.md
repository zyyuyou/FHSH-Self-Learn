# 🚀 部署驗證清單

## 老師部署前檢查

在將系統交給老師之前，請確認以下專案：

### ✅ 必要檔案

- [x] `docker-compose.yml` - Docker 編排配置
- [x] `Dockerfile` - 前端容器配置
- [x] `nginx.conf` - Nginx 網頁伺服器配置
- [x] `backend/Dockerfile` - 後端容器配置
- [x] `backend/entrypoint.sh` - 後端啟動指令碼（自動初始化）
- [x] `backend/scripts/import_students.py` - 學生資料匯入指令碼
- [x] `114-1全校名單.xlsx` - 學生名單檔案（1822位）
- [x] `README.md` - 完整的部署和使用說明

### ✅ 自動初始化功能

- [x] **首次啟動自動檢測**：`entrypoint.sh` 會檢查資料庫是否為空
- [x] **自動匯入學生資料**：從 Excel 匯入 1822 條學生記錄
- [x] **自動建立學生賬號**：為所有學生建立登入賬號
  - 賬號格式：`{學號}@fhsh.tp.edu.tw`
  - 密碼：學號本身
- [x] **自動建立教師賬號**：建立預設教師帳號
  - 帳號：`fhshbook@fhsh.tp.edu.tw`
  - 密碼：`fhshbook`
- [x] **進度顯示**：每處理 100 個學生顯示一次進度

### ✅ 系統配置

- [x] **bcrypt 輪數最佳化**：設定為 8 輪，加快密碼雜湊速度
- [x] **健康檢查配置**：後端容器有足夠的啟動時間（300秒）
- [x] **Docker 上下文**：正確配置以包含 Excel 檔案
- [x] **執行許可權**：`entrypoint.sh` 有執行許可權

### ✅ 檔案完整性

- [x] **部署步驟**：README 中有清晰的 3 步驟部署指南
- [x] **自動初始化說明**：明確說明系統會自動建立學生賬號
- [x] **學生登入方式**：清楚標明賬號和密碼格式
- [x] **常見問題排解**：包含完整的故障排除指南

## 老師部署步驟（最終版）

### 1. 前置需求
```bash
# 確認 Docker 已安裝
docker --version
docker-compose --version
```

### 2. 一鍵部署
```bash
# 進入專案目錄
cd self-learn-system

# 啟動系統（會自動初始化）
docker-compose up -d
```

### 3. 驗證部署
```bash
# 檢視服務狀態（等待 2-3 分鐘後執行）
docker-compose ps

# 應該看到三個服務都是 healthy 或 Up
# - self-learning-mongodb: Up (healthy)
# - self-learning-backend: Up (healthy)
# - self-learning-frontend: Up
```

### 4. 檢視初始化日誌（可選）
```bash
# 檢視後端初始化日誌
docker logs self-learning-backend

# 應該看到：
# ✅ 成功匯入 1822 條學生記錄
# ✅ 成功建立 1822 個學生賬號
# ✨ 初始化完成！
```

### 5. 訪問系統
- 前端：http://localhost:3000
- API 檔案：http://localhost:8000/docs
- 健康檢查：http://localhost:8000/health

### 6. 測試登入

**測試學生登入：**
```
賬號：11430001@fhsh.tp.edu.tw
密碼：11430001
```

**測試教師登入：**
```
帳號：fhshbook@fhsh.tp.edu.tw
密碼：fhshbook
```

## 清空測試資料

如果在部署測試後需要清空資料，執行：

```bash
docker-compose down -v
```

這會刪除所有容器和資料卷，下次啟動時會重新初始化。

## 系統狀態

- ✅ 程式碼已準備好
- ✅ Docker 配置已完成
- ✅ 自動初始化已配置
- ✅ 檔案已更新
- ✅ 測試透過

**系統已經準備好交給老師部署！** 🎉
