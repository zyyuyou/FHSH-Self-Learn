# 語言使用與縮排規範總結

## 🎯 系統語言架構

### 完整語言棧

```
┌─────────────────────────────────────────┐
│         前端層 (Frontend)                │
│  - React 19 + TypeScript                │
│  - Vite 構建工具                         │
│  - 語言：TypeScript (.ts, .tsx)         │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │ JSON API
               ▼
┌─────────────────────────────────────────┐
│          後端層 (Backend)                │
│  - FastAPI Framework                    │
│  - Beanie ODM (MongoDB)                 │
│  - 語言：Python 3.11+                   │
└──────────────┬──────────────────────────┘
               │
               │ Beanie ODM
               │ Async Motor Driver
               ▼
┌─────────────────────────────────────────┐
│        資料庫層 (Database)              │
│  - MongoDB 7.0                          │
│  - 查詢語言：MongoDB Query Language     │
│  - 透過 Beanie ODM 抽象                 │
└─────────────────────────────────────────┘
```

---

## 📊 詳細語言分佈

### 1. 前端 (Frontend) - TypeScript

| 元件型別 | 檔案 | 語言 | 行數 | 說明 |
|---------|------|------|------|------|
| **API 服務** | `services/api.ts` | TypeScript | 317 | 後端通訊層 |
| **React 元件** | `components/LoginPage.tsx` | TSX | ~150 | 登入頁面 |
| **React 元件** | `components/ApplicationFormPage.tsx` | TSX | ~200 | 申請表單 |
| **React 元件** | `components/HistoryPage.tsx` | TSX | ~150 | 歷史記錄 |
| **React 元件** | `components/Header.tsx` | TSX | ~50 | 導航欄 |
| **React 元件** | `components/SignaturePad.tsx` | TSX | ~100 | 簽名元件 |
| **React 元件** | `components/CommentModal.tsx` | TSX | ~80 | 評論彈窗 |
| **型別定義** | `types.ts` | TypeScript | ~50 | 全域性型別 |
| **主應用** | `App.tsx` | TSX | ~65 | 應用入口 |
| **入口檔案** | `index.tsx` | TSX | ~10 | ReactDOM 渲染 |
| **構建配置** | `vite.config.ts` | TypeScript | ~20 | Vite 配置 |

**總計：** ~1,192 行 TypeScript/TSX 程式碼

**特點：**
- 使用 React 19 的最新特性
- 完全型別安全的 API 呼叫
- 支援開發環境和生產環境自動切換
- 使用 Vite 進行快速構建

---

### 2. 後端 (Backend) - Python

| 模組型別 | 檔案 | 語言 | 行數 | 說明 |
|---------|------|------|------|------|
| **資料模型** | `models/base.py` | Python | ~20 | Beanie Document 基類 |
| **資料模型** | `models/user.py` | Python | ~98 | 使用者模型（Beanie） |
| **資料模型** | `models/application.py` | Python | ~199 | 申請表模型（Beanie） |
| **資料模型** | `models/student.py` | Python | ~42 | 學生模型（Beanie） |
| **API 路由** | `routes/auth.py` | Python | ~114 | 認證API |
| **API 路由** | `routes/applications.py` | Python | ~323 | 申請表API |
| **API 路由** | `routes/students.py` | Python | ~118 | 學生查詢API |
| **業務邏輯** | `services/user_service.py` | Python | ~137 | 使用者服務 |
| **業務邏輯** | `services/application_service.py` | Python | ~203 | 申請表服務 |
| **業務邏輯** | `services/student_service.py` | Python | ~136 | 學生服務 |
| **資料庫** | `database/mongodb.py` | Python | ~55 | Beanie 初始化 |
| **依賴注入** | `dependencies.py` | Python | ~99 | FastAPI 依賴 |
| **配置** | `config.py` | Python | ~48 | 應用配置 |
| **工具** | `utils/auth.py` | Python | ~60 | JWT 認證 |
| **主應用** | `main.py` | Python | ~84 | FastAPI 應用 |
| **指令碼** | `scripts/import_students.py` | Python | ~80 | 資料匯入 |

**總計：** ~1,816 行 Python 程式碼

**關鍵框架與庫：**
- **FastAPI** - 現代非同步 Web 框架
- **Beanie 1.26.0** - MongoDB ODM
  - 型別安全的資料庫操作
  - 自動索引管理
  - Pydantic 整合
- **Motor** - 非同步 MongoDB 驅動
- **Pydantic** - 資料驗證
- **python-jose** - JWT 處理
- **PassLib** - 密碼雜湊

**Beanie ODM 使用範例：**
```python
# 查詢範例（型別安全）
user = await User.find_one(User.username == "s001")

# 插入範例
new_user = User(username="s001", ...)
await new_user.insert()

# 更新範例
user.is_active = True
await user.save()

# 複雜查詢
applications = await Application.find(
    Application.status == "審核中",
    Application.submitter_id == user_id
).sort(-Application.created_at).to_list()
```

---

### 3. 資料庫 (Database) - MongoDB

| 集合 (Collection) | 檔案數量 | 索引 | Beanie 模型 |
|------------------|---------|------|------------|
| **users** | ~100+ | username, student_id | `User` |
| **applications** | ~500+ | submitter_id, status | `Application` |
| **students** | ~1000+ | student_id, class_name | `Student` |

**查詢語言：** MongoDB Query Language (MQL)
**訪問方式：** 透過 Beanie ODM 抽象

**資料庫連線：**
```python
# 使用 Beanie 初始化
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
database = client["self_learning_system"]

await init_beanie(
    database=database,
    document_models=[User, Application, Student]
)
```

---

### 4. 部署配置 (DevOps)

| 檔案 | 語言/格式 | 行數 | 用途 |
|-----|----------|------|------|
| **Dockerfile** (前端) | Dockerfile DSL | 36 | 前端映象 (Node + Nginx) |
| **Dockerfile** (後端) | Dockerfile DSL | 36 | 後端映象 (Python 3.11) |
| **docker-compose.yml** | YAML | 76 | 三服務編排 |
| **backend/docker-compose.yml** | YAML | 50 | 後端專用 |
| **nginx.conf** | Nginx Config | 51 | Web 伺服器配置 |
| **start.sh** | Bash Shell | 45 | 啟動指令碼 |

---

## 🔧 縮排規範與現狀

### 規範：統一使用 4 個空格

| 檔案型別 | 預期縮排 | 當前狀態 | 檢查結果 |
|---------|---------|---------|---------|
| **Python 檔案** (`.py`) | 4 空格 | ✅ 4 空格 | 完全符合 PEP 8 |
| **YAML 檔案** (`.yml`) | 4 空格 | ✅ 4 空格 | 完全符合 |
| **Nginx 配置** | 4 空格 | ✅ 4 空格 | 完全符合 |
| **TypeScript 檔案** (`.ts`, `.tsx`) | 4 空格 | ⚠️ 2 空格 | **需修正** |
| **JSON 檔案** (`.json`) | 4 空格 | ⚠️ 2 空格 | **需修正** |

---

### 詳細檢查結果

#### ✅ 已符合規範的檔案（4 空格）

**後端 Python 檔案：**
```
✅ backend/app/models/base.py
✅ backend/app/models/user.py
✅ backend/app/models/application.py
✅ backend/app/models/student.py
✅ backend/app/services/user_service.py
✅ backend/app/services/application_service.py
✅ backend/app/services/student_service.py
✅ backend/app/routes/auth.py
✅ backend/app/routes/applications.py
✅ backend/app/routes/students.py
✅ backend/app/database/mongodb.py
✅ backend/app/dependencies.py
✅ backend/app/config.py
✅ backend/app/main.py
✅ backend/scripts/import_students.py
```

**部署配置檔案：**
```
✅ docker-compose.yml
✅ backend/docker-compose.yml
✅ nginx.conf
```

---

#### ⚠️ 需要修正的檔案（當前 2 空格）

**前端 TypeScript 檔案：**
```
⚠️ services/api.ts                     (317 行)
⚠️ components/LoginPage.tsx            (~150 行)
⚠️ components/ApplicationFormPage.tsx  (~200 行)
⚠️ components/HistoryPage.tsx          (~150 行)
⚠️ components/Header.tsx               (~50 行)
⚠️ components/SignaturePad.tsx         (~100 行)
⚠️ components/CommentModal.tsx         (~80 行)
⚠️ types.ts                            (~50 行)
⚠️ App.tsx                             (~65 行)
⚠️ index.tsx                           (~10 行)
⚠️ vite.config.ts                      (~20 行)
```

**配置 JSON 檔案：**
```
⚠️ package.json                        (~22 行)
⚠️ tsconfig.json                       (~20 行)
⚠️ metadata.json                       (~10 行)
```

**總計需修正：** ~1,244 行程式碼

---

## 🛠️ 修正方案

### 方案一：使用 VS Code（推薦）

1. 開啟 VS Code
2. 安裝 "Prettier" 擴充套件
3. 建立 `.prettierrc` 檔案：

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100
}
```

4. 批次格式化：
   - `Cmd/Ctrl + Shift + P`
   - 選擇 "Format Document"
   - 或設定儲存時自動格式化

---

### 方案二：使用命令列工具

#### 安裝 Prettier

```bash
npm install --save-dev prettier
```

#### 建立配置檔案

```bash
cat > .prettierrc << EOF
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true
}
EOF
```

#### 批次格式化

```bash
# 格式化所有 TypeScript 檔案
npx prettier --write "**/*.{ts,tsx}"

# 格式化所有 JSON 檔案
npx prettier --write "**/*.json"

# 格式化單個檔案
npx prettier --write services/api.ts
```

---

### 方案三：使用 EditorConfig（推薦作為補充）

建立 `.editorconfig` 檔案確保所有開發者使用相同設定：

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 4

[*.{js,jsx,ts,tsx,json,yml,yaml}]
indent_size = 4

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
```

---

## 📊 統計總結

### 程式碼行數統計

| 語言 | 檔案數 | 程式碼行數 | 百分比 |
|-----|--------|---------|--------|
| **Python** | 16 | 1,816 | 60% |
| **TypeScript/TSX** | 11 | 1,192 | 40% |
| **總計** | 27 | 3,008 | 100% |

### 縮排符合度

| 狀態 | 檔案數 | 程式碼行數 | 百分比 |
|-----|--------|---------|--------|
| ✅ **已符合 (4空格)** | 19 | 1,966 | 65% |
| ⚠️ **需修正 (2空格)** | 14 | 1,244 | 35% |

---

## 🎯 建議行動方案

### 立即執行（高優先順序）

1. **建立 `.prettierrc` 配置**
   ```bash
   echo '{"tabWidth": 4}' > .prettierrc
   ```

2. **建立 `.editorconfig` 配置**
   ```bash
   # 使用方案三的配置內容
   ```

3. **安裝 Prettier**
   ```bash
   npm install --save-dev prettier
   ```

4. **批次格式化**
   ```bash
   # 格式化所有前端檔案
   npx prettier --write "**/*.{ts,tsx,json}" --ignore-path .gitignore
   ```

---

### 逐步執行（按優先順序）

#### 階段 1：核心檔案
```bash
npx prettier --write services/api.ts
npx prettier --write types.ts
npx prettier --write App.tsx
```

#### 階段 2：React 元件
```bash
npx prettier --write "components/*.tsx"
```

#### 階段 3：配置檔案
```bash
npx prettier --write "*.json"
npx prettier --write "*.ts"
```

---

## 📝 驗證方法

### 檢查單個檔案縮排

```bash
# 檢查檔案是否符合 Prettier 規範
npx prettier --check services/api.ts

# 顯示會做的修改（不實際修改）
npx prettier services/api.ts
```

### 批次檢查

```bash
# 檢查所有 TypeScript 檔案
npx prettier --check "**/*.{ts,tsx}"
```

---

## 🔄 Git 工作流建議

### 格式化前先提交

```bash
# 1. 提交當前狀態（格式化前）
git add .
git commit -m "feat: 完成 Beanie ODM 遷移和 Docker 部署"

# 2. 執行格式化
npx prettier --write "**/*.{ts,tsx,json}"

# 3. 提交格式化修改
git add .
git commit -m "style: 統一縮排為 4 個空格"
```

---

## 📖 附錄：語言特性說明

### Python + Beanie ODM 特性

- **型別提示**：完整的型別安全
- **非同步操作**：使用 async/await
- **自動驗證**：Pydantic 整合
- **索引管理**：自動建立索引
- **查詢構建器**：類似 ORM 的查詢語法

### TypeScript + React 特性

- **嚴格型別**：完整的型別檢查
- **JSX 語法**：React 元件
- **模組系統**：ES6 import/export
- **構建最佳化**：Vite 快速熱更新

---

**檔案版本：** v1.0
**生成時間：** 2025-11-20
**系統版本：** 使用 Beanie ODM + Docker 部署
