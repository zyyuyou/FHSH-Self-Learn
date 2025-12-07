# student_seat 型別錯誤修正
## 日期: 2025-12-06

---

## 問題描述

使用者填寫申請表後提交，收到錯誤訊息：

```
提交失敗

資料驗證失敗:
body.members.0.student_seat: Input should be a valid string
body.members.1.student_seat: Input should be a valid string
```

### 請求資料
```json
{
  "members": [
    {
      "student_id": "11330031",
      "student_class": "206",
      "student_seat": 32,  // ❌ 數字型別
      "student_name": "鄭宇佑",
      "has_submitted": "是"
    },
    {
      "student_id": "11335227",
      "student_class": "207",
      "student_seat": 8,  // ❌ 數字型別
      "student_name": "鍾雨岑",
      "has_submitted": "是"
    }
  ]
}
```

### 後端響應
```json
{
  "detail": [
    {
      "type": "string_type",
      "loc": ["body", "members", 0, "student_seat"],
      "msg": "Input should be a valid string",
      "input": 32
    },
    {
      "type": "string_type",
      "loc": ["body", "members", 1, "student_seat"],
      "msg": "Input should be a valid string",
      "input": 8
    }
  ]
}
```

---

## 問題分析

### 資料流追蹤

1. **API返回資料** (`/students/11330031`)
   ```json
   {
     "student_id": "11330031",
     "class_name": "206",
     "seat_number": 32,  // ← 數字型別 (int)
     "name": "鄭宇佑"
   }
   ```

2. **前端接收並賦值** (ApplicationFormPage.tsx:253)
   ```typescript
   studentSeat: studentData.seat_number || '',
   ```

   **問題**：`studentData.seat_number` 是數字 32，直接賦值給 `studentSeat`

3. **提交時** (ApplicationFormPage.tsx:481-486)
   ```typescript
   members: members
       .map((m) => ({
           student_seat: m.studentSeat,  // ← 仍然是數字 32
       }))
   ```

4. **後端驗證**
   - Member模型要求 `student_seat: str`
   - 收到數字 32
   - ❌ 驗證失敗：422 Unprocessable Entity

### 根本原因

**後端API返回的 `seat_number` 是整數型別，但後端模型要求字串型別**

- 學生API (`/students/{student_id}`) 返回：`seat_number: int`
- 申請表模型 (`Member`) 要求：`student_seat: str`

**型別不匹配導致422驗證錯誤**

---

## 修正方案

### 方案1: 前端轉換（已採用）✅

在前端接收API資料時，將 `seat_number` 轉換為字串。

**優點**:
- 快速修正
- 不影響其他功能
- 前端完全控制資料格式

**缺點**:
- 需要記得每次都轉換
- 如果有其他地方呼叫API，也需要轉換

### 方案2: 後端統一型別（備選）

修改後端學生模型，讓所有地方的 `seat_number` 都是字串。

**優點**:
- 型別統一，不會再出現這個問題
- 座號本質上是識別符號，應該用字串

**缺點**:
- 需要修改資料庫資料
- 影響範圍較大

---

## 實施的修正

### 前端修改 (ApplicationFormPage.tsx:253)

**修改前**:
```typescript
studentSeat: studentData.seat_number || '',
```

**修改後**:
```typescript
studentSeat: String(studentData.seat_number || ''),
```

**說明**:
- 使用 `String()` 確保轉換為字串
- 處理 `null`/`undefined` 情況（轉為空字串）

---

## 部署步驟

### 1. 修改程式碼
```bash
# 已完成
vim components/ApplicationFormPage.tsx
```

### 2. 重建前端
```bash
docker-compose build frontend
docker-compose up -d frontend
```

**結果**:
```
✓ 38 modules transformed.
✓ built in 490ms
Container self-learning-frontend Started
```

---

## 驗證

### 測試資料格式

**修正後的提交資料**:
```json
{
  "members": [
    {
      "student_id": "11330031",
      "student_class": "206",
      "student_seat": "32",  // ✅ 字串型別
      "student_name": "鄭宇佑",
      "has_submitted": "是"
    },
    {
      "student_id": "11335227",
      "student_class": "207",
      "student_seat": "8",  // ✅ 字串型別
      "student_name": "鍾雨岑",
      "has_submitted": "是"
    }
  ]
}
```

### 預期結果
- ✅ 提交成功
- ✅ 返回 200 OK
- ✅ 申請表已建立
- ✅ 資料正確儲存

---

## 測試步驟

1. **清除瀏覽器快取**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **重新登入**

3. **填寫申請表**
   - 填寫計畫名稱
   - 輸入學號（如：11330031）
   - 確認座號自動填入為字串
   - 完成其他必填欄位

4. **檢查開發者工具**
   - 開啟 Network 標籤
   - 點選「完成並儲存」
   - 檢視 POST /applications/ 請求
   - **確認** `student_seat` 是字串（帶引號）

5. **驗證提交結果**
   - 應該顯示：「計畫已成功送出！請到歷史紀錄檢視」
   - 導航到歷史記錄
   - 確認申請已建立

---

## 相關模型定義

### 後端 Member 模型
```python
class Member(BaseModel):
    student_id: str = Field(..., description="學號")
    student_class: str = Field(..., description="班級")
    student_seat: str = Field(..., description="座號")  # ← 字串型別
    student_name: Optional[str] = Field(default=None, description="姓名")
    has_submitted: Optional[str] = Field(default=None, description="是否繳交過")
```

### 學生API響應
```python
class StudentResponse(BaseModel):
    id: str
    student_id: str
    class_name: str
    seat_number: int  # ← 整數型別（這裡是資料來源）
    name: str
```

### 型別不匹配
```
API返回:  seat_number: int (32)
          ↓
前端接收:  studentSeat: number (32)
          ↓
提交API:   student_seat: number (32)  ❌ 型別錯誤
          ↓
後端驗證:  student_seat: str  ← 期望字串

修正後:
API返回:  seat_number: int (32)
          ↓
前端轉換:  studentSeat: string ("32")  ← String()轉換
          ↓
提交API:   student_seat: string ("32")  ✅ 型別正確
          ↓
後端驗證:  student_seat: str  ← 期望字串
```

---

## 其他可能需要轉換的欄位

檢查是否有其他數字欄位需要轉換為字串：

### 已確認需要字串的欄位
- ✅ `student_seat` - 已修正
- ✅ `hours` (學習時數) - 前端使用字串
- ✅ `date` (日期) - 前端使用字串

### 目前沒有問題的欄位
- `class_name` - API返回字串
- `student_id` - API返回字串
- `name` - API返回字串

---

## 改進建議

### 短期（立即）
1. ✅ 前端將 `seat_number` 轉為字串
2. 測試提交功能

### 中期（下次迭代）
1. 考慮在後端統一 `seat_number` 為字串型別
2. 新增前端 TypeScript 型別定義，避免型別錯誤
3. 新增單元測試，確保型別轉換正確

### 長期（架構最佳化）
1. 建立統一的資料轉換層
2. 使用 Zod 或類似工具進行執行時型別驗證
3. 檔案化所有API的資料型別

---

## 總結

### 問題
後端API返回整數 `seat_number`，但申請表模型要求字串 `student_seat`，導致422驗證錯誤。

### 解決方案
在前端接收API資料時使用 `String()` 轉換座號為字串。

### 修改檔案
- `components/ApplicationFormPage.tsx` (1處)

### 部署狀態
- ✅ 程式碼已修改
- ✅ 前端已重建
- ✅ 容器已重啟
- ⏳ 等待使用者測試

### 預期結果
使用者現在可以成功提交申請表，不會再看到 `student_seat` 型別錯誤。

---

## 附錄: 錯誤處理改進效果

### 修正前的錯誤訊息
```
提交失敗
[object Object]
```
❌ 無法知道具體問題

### 修正後的錯誤訊息
```
提交失敗

資料驗證失敗:
body.members.0.student_seat: Input should be a valid string
body.members.1.student_seat: Input should be a valid string
```
✅ 清楚指出哪個欄位有問題

這次的錯誤訊息改進（在上一次修正中完成）幫助我們快速定位到 `student_seat` 型別問題！
