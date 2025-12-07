# 提交失敗問題修正報告
## 日期: 2025-12-06

---

## 問題描述

使用者反饋當按下「完成並儲存」按鈕後，系統顯示錯誤訊息：

```
提交失敗
[object Object]
```

---

## 問題分析

### 1. 錯誤日誌分析

檢查後端日誌發現：
```
INFO: 172.18.0.4:35704 - "POST /applications/ HTTP/1.1" 422 Unprocessable Entity
```

**422錯誤**表示：請求格式不符合後端模型要求

### 2. 根本原因

檢查後端模型 `backend/app/models/application.py` 發現：

- `Application` 模型（第52-117行）**有** `phone_agreement` 欄位
- `ApplicationCreate` 模型（第152-173行）**缺少** `phone_agreement` 欄位
- `ApplicationUpdate` 模型（第176-199行）**缺少** `phone_agreement` 欄位
- `ApplicationResponse` 模型（第202-230行）**缺少** `phone_agreement` 欄位

前端在提交時包含了 `phone_agreement` 欄位，但 `ApplicationCreate` 模型不接受這個欄位，導致422驗證錯誤。

### 3. 為什麼顯示 `[object Object]`？

前端錯誤處理程式碼（ApplicationFormPage.tsx:533）：
```typescript
setSubmitError(error instanceof Error ? error.message : '提交失敗，請重試');
```

由於錯誤物件沒有被正確解析為字串，所以顯示為 `[object Object]`。

---

## 修正內容

### 1. 後端模型修正

#### ApplicationCreate (application.py:172)
```python
class ApplicationCreate(BaseModel):
    # ... 其他欄位 ...
    phone_agreement: Optional[str] = ""  # 新增
    signatures: List[Signature] = []
```

#### ApplicationUpdate (application.py:196)
```python
class ApplicationUpdate(BaseModel):
    # ... 其他欄位 ...
    phone_agreement: Optional[str] = None  # 新增
    signatures: Optional[List[Signature]] = None
```

#### ApplicationResponse (application.py:224)
```python
class ApplicationResponse(BaseModel):
    # ... 其他欄位 ...
    phone_agreement: Optional[str] = ""  # 新增
    signatures: List[Signature]
```

### 2. 前端錯誤處理改進

#### api.ts (services/api.ts:125-134)
```typescript
// 如果請求失敗，丟擲錯誤
if (!response.ok) {
    // 處理422驗證錯誤
    if (response.status === 422 && data.detail) {
        if (Array.isArray(data.detail)) {
            // Pydantic 驗證錯誤格式
            const errorMessages = data.detail.map((err: any) =>
                `${err.loc.join('.')}: ${err.msg}`
            ).join('\n');
            throw new Error(`資料驗證失敗:\n${errorMessages}`);
        }
    }
    throw new Error((data as ApiError).detail || '請求失敗');
}
```

**改進點**:
- 檢測422驗證錯誤
- 解析Pydantic驗證錯誤陣列
- 顯示詳細的欄位錯誤訊息
- 避免顯示 `[object Object]`

---

## 修正後的資料流

### 前端提交資料
```javascript
{
    title: "計畫名稱",
    members: [...],
    motivation: "...",
    // ... 其他欄位 ...
    phone_agreement: "同意",  // ✅ 現在會被接受
    signatures: [...]
}
```

### 後端驗證
1. FastAPI 接收 POST /applications/
2. 使用 `ApplicationCreate` 模型驗證
3. ✅ phone_agreement 欄位現在存在於模型中
4. 驗證透過，建立 Application 檔案
5. 返回 ApplicationResponse

---

## 部署步驟

### 1. 重啟後端
```bash
docker-compose restart backend
```

**結果**: ✅ 後端成功重啟

### 2. 重建前端
```bash
docker-compose build frontend
docker-compose up -d frontend
```

**結果**: ✅ 前端成功重建

---

## 驗證

### 容器狀態
```bash
docker-compose ps
```

| 容器 | 狀態 | 埠 |
|-----|------|------|
| self-learning-frontend | Up | 3000 |
| self-learning-backend | Up | 8000 |
| self-learning-mongodb | Up | 27017 |

### 後端日誌
```
✅ 自主學習計劃申請系統 API v1.0.0 已啟動
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 前端構建
```
✓ 38 modules transformed.
✓ built in 479ms
```

---

## 測試指南

### 測試步驟

1. **登入系統**
   - 使用學生帳號登入

2. **填寫申請表**
   - 填寫計畫名稱
   - 輸入學號（會自動填入姓名、班級、座號）
   - 勾選「是否繳交過」checkbox
   - 填寫學習動機
   - 選擇學習類別
   - 填寫參考資料
   - 填寫預期成效
   - 填寫裝置需求
   - 選擇環境需求
   - 填寫學習計畫（至少一項）
   - 填寫階段中/末目標
   - 選擇成果發表形式
   - **選擇手機使用規範「同意」或「不同意」** ⚠️ 重要
   - 簽名

3. **提交申請**
   - 點選「完成並儲存」
   - 應該顯示：「計畫已成功送出！請到歷史紀錄檢視」
   - ✅ 不再顯示 `[object Object]` 錯誤

4. **檢查歷史記錄**
   - 導航到「歷史紀錄」頁面
   - 確認新申請已建立
   - 點選「檢視詳情」
   - 確認所有欄位（包括phone_agreement）都正確儲存

5. **匯出PDF**
   - 在申請詳情頁面點選「匯出PDF」
   - 確認PDF包含所有資料
   - 確認手機使用規範欄位顯示正確的checkbox狀態

---

## 可能遇到的問題

### 問題1: 仍然顯示422錯誤

**原因**: 其他必填欄位未填寫

**解決方法**:
- 檢查前端表單驗證
- 檢視瀏覽器Console的詳細錯誤訊息（現在會顯示具體哪個欄位有問題）

### 問題2: 前端修改未生效

**原因**: 瀏覽器快取

**解決方法**:
```bash
# 清除瀏覽器快取
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# 或強制重建前端
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### 問題3: 後端修改未生效

**原因**: 容器未重啟

**解決方法**:
```bash
docker-compose restart backend
# 或
docker-compose down
docker-compose up -d
```

---

## 技術細節

### Pydantic 驗證錯誤格式

FastAPI使用Pydantic進行資料驗證。當驗證失敗時，返回422錯誤：

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "phone_agreement"],
      "msg": "Field required",
      "input": {...}
    }
  ]
}
```

**錯誤結構**:
- `type`: 錯誤型別（missing, type_error等）
- `loc`: 錯誤位置（如：body.phone_agreement）
- `msg`: 錯誤訊息
- `input`: 輸入的資料

### 修正後的錯誤處理

現在前端會將這個陣列轉換為可讀的訊息：
```
資料驗證失敗:
body.phone_agreement: Field required
```

而不是顯示無意義的 `[object Object]`。

---

## 相關欄位說明

### phone_agreement (手機使用規範)

**型別**: `Optional[str]`

**可能的值**:
- `"同意"` - 學生同意手機使用規範
- `"不同意"` - 學生不同意（會顯示警告：本次申請將改列彈性學習）
- `""` - 空值（預設）

**在各模型中的定義**:
- `Application`: `Optional[str] = Field(default="", ...)`
- `ApplicationCreate`: `Optional[str] = ""`
- `ApplicationUpdate`: `Optional[str] = None`
- `ApplicationResponse`: `Optional[str] = ""`

**前端實現**:
- 使用RadioGroup元件
- 兩個選項：同意/不同意
- 必填欄位
- 選擇「不同意」時顯示警告

**Word模板**:
```jinja2
{% if phone_agreement == '同意' %}☑{% else %}□{% endif %}同意
{% if phone_agreement == '不同意' %}☑{% else %}□{% endif %}不同意
(勾選不同意者本次申請將改列彈性學習)
```

---

## 修正的檔案清單

### 後端
1. `backend/app/models/application.py` (3處修改)
   - ApplicationCreate: 新增 phone_agreement
   - ApplicationUpdate: 新增 phone_agreement
   - ApplicationResponse: 新增 phone_agreement

### 前端
1. `services/api.ts` (1處修改)
   - 改進422錯誤處理邏輯

---

## 總結

### 問題根源
後端模型定義不完整，缺少 `phone_agreement` 欄位在 Create/Update/Response 模型中。

### 解決方案
1. ✅ 在所有相關模型中新增 `phone_agreement` 欄位
2. ✅ 改進前端錯誤處理，顯示詳細驗證錯誤
3. ✅ 重啟後端和重建前端

### 測試狀態
- ✅ 後端模型修正
- ✅ 前端錯誤處理改進
- ✅ 容器重建和重啟
- ⏳ 等待使用者測試確認

### 預期結果
使用者現在可以成功提交申請表，不會再看到 `[object Object]` 錯誤訊息。如果有任何驗證錯誤，會看到清晰的錯誤提示，指出具體哪個欄位有問題。

---

## 附錄: 快速參考

### 快速重啟命令
```bash
# 重啟後端
docker-compose restart backend

# 重建前端
docker-compose build frontend && docker-compose up -d frontend

# 重啟所有服務
docker-compose restart

# 檢視日誌
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 測試API
```bash
# 健康檢查
curl http://localhost:8000/health

# 學生查詢
curl http://localhost:8000/students/11430001

# 檢視所有容器
docker-compose ps
```
