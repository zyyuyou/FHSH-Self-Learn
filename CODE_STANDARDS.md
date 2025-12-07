# 程式碼規範 - 自主學習計畫申請系統

## 📋 語言使用說明

### 1. 前端 (Frontend)

#### 主要語言：**TypeScript / TSX**

| 檔案型別 | 語言 | 用途 | 範例 |
|---------|------|------|------|
| React 元件 | TypeScript + JSX | UI 元件 | `LoginPage.tsx`, `ApplicationFormPage.tsx` |
| 型別定義 | TypeScript | 型別宣告 | `types.ts` |
| API 服務 | TypeScript | 後端通訊 | `services/api.ts` |
| 配置檔案 | TypeScript | 構建配置 | `vite.config.ts` |

**相關檔案：**
```
components/
├── LoginPage.tsx          # 登入頁面元件
├── ApplicationFormPage.tsx  # 申請表單元件
├── HistoryPage.tsx        # 歷史記錄元件
├── CommentModal.tsx       # 評論彈窗元件
├── SignaturePad.tsx       # 簽名元件
└── Header.tsx             # 頁首元件

services/
└── api.ts                 # API 服務層（與後端通訊）

types.ts                   # 全域性型別定義
App.tsx                    # 主應用元件
index.tsx                  # 應用入口
```

---

### 2. 後端 (Backend)

#### 主要語言：**Python 3.11+**

| 檔案型別 | 語言/框架 | 用途 | 範例 |
|---------|----------|------|------|
| API 路由 | Python + FastAPI | RESTful API 端點 | `routes/auth.py`, `routes/applications.py` |
| 資料模型 | Python + Beanie ODM | MongoDB 檔案模型 | `models/user.py`, `models/application.py` |
| 業務邏輯 | Python | 服務層 | `services/user_service.py` |
| 資料庫 | Python + Beanie + Motor | 非同步 MongoDB 操作 | `database/mongodb.py` |
| 工具指令碼 | Python | 資料匯入等工具 | `scripts/import_students.py` |

**相關檔案：**
```
backend/app/
├── models/                 # 資料模型（Beanie Document）
│   ├── base.py            # 基礎模型類
│   ├── user.py            # 使用者模型
│   ├── application.py     # 申請表模型
│   └── student.py         # 學生模型
│
├── routes/                # API 路由
│   ├── auth.py            # 認證路由（登入/註冊）
│   ├── applications.py    # 申請表路由（CRUD）
│   └── students.py        # 學生查詢路由
│
├── services/              # 業務邏輯層
│   ├── user_service.py    # 使用者服務
│   ├── application_service.py  # 申請表服務
│   └── student_service.py # 學生服務
│
├── database/              # 資料庫連線
│   └── mongodb.py         # Beanie 初始化
│
├── utils/                 # 工具函式
│   └── auth.py            # JWT 認證工具
│
├── dependencies.py        # FastAPI 依賴注入
├── config.py              # 應用配置
└── main.py                # 應用入口

backend/scripts/
└── import_students.py     # 學生名單匯入指令碼
```

**關鍵依賴：**
- **FastAPI** - 現代化的非同步 Web 框架
- **Beanie 1.26.0** - MongoDB ODM（物件檔案對映）
- **Motor** - 非同步 MongoDB 驅動（Beanie 內部使用）
- **Pydantic** - 資料驗證和設定管理
- **python-jose** - JWT 令牌處理

---

### 3. 資料庫 (Database)

#### **MongoDB 7.0** (NoSQL 檔案資料庫)

| 集合 (Collection) | 用途 | 模型檔案 |
|------------------|------|---------|
| `users` | 使用者賬號（學生/教師） | `models/user.py` |
| `applications` | 自主學習申請表 | `models/application.py` |
| `students` | 全校學生名單 | `models/student.py` |

**查詢語言：** MongoDB Query Language (透過 Beanie ODM 抽象)

**範例：**
```python
# Beanie ODM 查詢（型別安全）
user = await User.find_one(User.username == "s001")
applications = await Application.find(
    Application.status == "審核中"
).to_list()
```

---

### 4. 部署與配置 (DevOps)

| 檔案型別 | 語言/格式 | 用途 | 範例 |
|---------|----------|------|------|
| 容器定義 | Dockerfile | Docker 映象構建 | `Dockerfile`, `backend/Dockerfile` |
| 容器編排 | YAML | 多容器編排 | `docker-compose.yml` |
| Web 伺服器 | Nginx 配置 | 反向代理 + 靜態檔案 | `nginx.conf` |
| 啟動指令碼 | Bash Shell | 一鍵部署 | `start.sh` |

**相關檔案：**
```
Dockerfile              # 前端 Docker 映象（Node.js + Nginx）
backend/Dockerfile      # 後端 Docker 映象（Python 3.11）
docker-compose.yml      # 三服務編排（前端+後端+MongoDB）
nginx.conf              # Nginx 配置（SPA + API 反向代理）
start.sh                # Bash 一鍵啟動指令碼
```

---

### 5. 配置檔案 (Configuration)

| 檔案 | 格式 | 用途 |
|-----|------|------|
| `package.json` | JSON | Node.js 依賴管理 |
| `requirements.txt` | Text | Python 依賴列表 |
| `tsconfig.json` | JSON | TypeScript 編譯器配置 |
| `vite.config.ts` | TypeScript | Vite 構建工具配置 |
| `.env` / `.env.example` | Text | 環境變數 |

---

## 🔧 縮排規範

### ⚠️ 當前狀態

| 檔案型別 | 當前縮排 | 應使用縮排 | 狀態 |
|---------|---------|-----------|------|
| **Python 檔案** (`.py`) | ✅ 4 空格 | 4 空格 | ✅ 正確 |
| **YAML 檔案** (`.yml`) | ✅ 4 空格 | 4 空格 | ✅ 正確 |
| **TypeScript 檔案** (`.ts`, `.tsx`) | ❌ 2 空格 | 4 空格 | ⚠️ 需修正 |
| **JSON 檔案** (`.json`) | ❌ 2 空格 | 4 空格 | ⚠️ 需修正 |
| **Nginx 配置** | ✅ 4 空格 | 4 空格 | ✅ 正確 |
| **Dockerfile** | N/A | N/A | ✅ 正確 |

---

### 統一規範：**所有檔案使用 4 個空格縮排**

#### 1. Python 檔案 (`.py`) - ✅ 已符合

**規範：** PEP 8 標準，4 個空格縮排

```python
# ✅ 正確
class UserService:
    async def create_user(self, user_data: UserCreate) -> User:
        if existing_user:
            raise ValueError("使用者名稱已存在")

        user = User(
            username=user_data.username,
            hashed_password=hashed_password,
        )

        await user.insert()
        return user
```

**狀態：** 所有後端 Python 檔案已使用 4 個空格 ✅

---

#### 2. TypeScript/TSX 檔案 (`.ts`, `.tsx`) - ⚠️ 需修正

**當前：** 2 個空格
**應為：** 4 個空格

**需修正的檔案：**
```
services/api.ts          # API 服務層
components/*.tsx         # 所有 React 元件
types.ts                 # 型別定義
vite.config.ts          # Vite 配置
```

**修正前（2 空格）：**
```typescript
// ❌ 當前使用 2 空格
interface LoginRequest {
  username: string;
  password: string;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  return data as LoginResponse;
};
```

**修正後（4 空格）：**
```typescript
// ✅ 應使用 4 空格
interface LoginRequest {
    username: string;
    password: string;
}

export const login = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    return data as LoginResponse;
};
```

---

#### 3. JSON 檔案 (`.json`) - ⚠️ 需修正

**當前：** 2 個空格
**應為：** 4 個空格

**需修正的檔案：**
```
package.json           # Node.js 依賴
tsconfig.json          # TypeScript 配置
metadata.json          # 後設資料
```

**修正前（2 空格）：**
```json
{
  "name": "自主學習計畫申請系統",
  "version": "0.0.0",
  "dependencies": {
    "react": "^19.2.0"
  }
}
```

**修正後（4 空格）：**
```json
{
    "name": "自主學習計畫申請系統",
    "version": "0.0.0",
    "dependencies": {
        "react": "^19.2.0"
    }
}
```

---

#### 4. YAML 檔案 (`.yml`, `.yaml`) - ✅ 已符合

**規範：** 4 個空格縮排

```yaml
# ✅ 正確
services:
    mongodb:
        image: mongo:7.0
        ports:
            - "27017:27017"
        environment:
            MONGO_INITDB_DATABASE: self_learning_system
```

**狀態：** 所有 YAML 檔案已使用 4 個空格 ✅

---

## 🛠️ 修正方案

### 方案一：手動修正（推薦用於關鍵檔案）

適用於小型檔案或需要仔細檢查的程式碼。

### 方案二：使用編輯器批次替換

#### Visual Studio Code
1. 開啟檔案
2. 按 `Cmd/Ctrl + Shift + P`
3. 選擇 "Convert Indentation to Spaces"
4. 設定為 4

#### 批次轉換指令碼（謹慎使用）
```bash
# 僅供參考，使用前請備份
# 將 2 空格轉換為 4 空格（僅限行首）
for file in services/*.ts components/*.tsx; do
    sed -i.bak 's/^  /    /g' "$file"
done
```

⚠️ **警告：** 自動化指令碼可能會誤改字串內容，建議逐檔案檢查。

---

## 📊 檔案統計

| 類別 | 語言 | 檔案數 | 縮排狀態 |
|-----|------|--------|---------|
| 前端 | TypeScript/TSX | ~10 | ⚠️ 需改為 4 空格 |
| 後端 | Python | ~15 | ✅ 已為 4 空格 |
| 配置 | YAML | 2 | ✅ 已為 4 空格 |
| 配置 | JSON | 3 | ⚠️ 需改為 4 空格 |
| 配置 | Nginx | 1 | ✅ 已為 4 空格 |

---

## 🎯 優先順序

1. **高優先順序**（影響開發體驗）
   - `services/api.ts` - API 服務層
   - `components/*.tsx` - React 元件

2. **中優先順序**（配置檔案）
   - `package.json` - Node 依賴
   - `tsconfig.json` - TS 配置

3. **低優先順序**（自動生成）
   - `package-lock.json` - 自動生成，不建議手動修改

---

## 📝 建議

1. **立即修正：** `services/api.ts`（我們剛修改過，最重要）
2. **逐步修正：** 其他 TypeScript 元件
3. **保持一致：** 新檔案統一使用 4 空格
4. **配置編輯器：**
   ```json
   // .editorconfig
   root = true

   [*]
   indent_style = space
   indent_size = 4
   ```

---

**檔案版本：** v1.0
**最後更新：** 2025-11-20
