# Word 模板變數對映指南

請在「復興自主學習申請表.docx」檔案中，將以下位置替換為對應的Jinja2變數：

## 基本資訊

| 位置 | 替換為 |
|------|--------|
| 計畫名稱 (第2行) | `{{title}}` |

## 學生資料 (第4-6行)

### 組長 (第4行)
- 班級: `{{member1.class_name}}`
- 座號: `{{member1.seat_number}}`
- 學號: `{{member1.student_id}}`
- 是否繳交過: `{% if member1.has_submitted == '是' %}☑{% else %}□{% endif %}是  {% if member1.has_submitted == '第一次申請' %}☑{% else %}□{% endif %}第一次申請 {% if member1.has_submitted == '否' %}☑{% else %}□{% endif %}否`

### 組員2 (第5行)
- 班級: `{{member2.class_name}}`
- 座號: `{{member2.seat_number}}`
- 學號: `{{member2.student_id}}`
- 是否繳交過: `{% if member2.has_submitted == '是' %}☑{% else %}□{% endif %}是  {% if member2.has_submitted == '第一次申請' %}☑{% else %}□{% endif %}第一次申請 {% if member2.has_submitted == '否' %}☑{% else %}□{% endif %}否`

### 組員3 (第6行)
- 班級: `{{member3.class_name}}`
- 座號: `{{member3.seat_number}}`
- 學號: `{{member3.student_id}}`
- 是否繳交過: `{% if member3.has_submitted == '是' %}☑{% else %}□{% endif %}是  {% if member3.has_submitted == '第一次申請' %}☑{% else %}□{% endif %}第一次申請 {% if member3.has_submitted == '否' %}☑{% else %}□{% endif %}否`

## 學習相關 (第7-12行)

| 位置 | 替換為 |
|------|--------|
| 學習動機 (第7行) | `{{motivation}}` |
| 學習類別 (第8行) | `{% if learning_categories.get('閱讀計畫') %}☑{% else %}□{% endif %}閱讀計畫 {% if learning_categories.get('志工服務') %}☑{% else %}□{% endif %}志工服務 {% if learning_categories.get('專題研究') %}☑{% else %}□{% endif %}專題研究 {% if learning_categories.get('藝文創作') %}☑{% else %}□{% endif %}藝文創作 {% if learning_categories.get('技藝學習') %}☑{% else %}□{% endif %}技藝學習 {% if learning_categories.get('競賽準備') %}☑{% else %}□{% endif %}競賽準備 {% if learning_categories.get('實作體驗') %}☑{% else %}□{% endif %}實作體驗 {% if learning_categories.get('課程延伸') %}☑{% else %}□{% endif %}課程延伸 □其他：{{learning_category_other}}` |
| 學習環境需求 (第9行) | `{% if env_needs.get('自習室') %}☑{% else %}□{% endif %}自習室 {% if env_needs.get('數位閱讀室') %}☑{% else %}□{% endif %}數位閱讀室 {% if env_needs.get('雲端教室') %}☑{% else %}□{% endif %}雲端教室 {% if env_needs.get('美力教室') %}☑{% else %}□{% endif %}美力教室 B. 其他場地：{{env_other}}` |
| 學習裝置需求 (第10行) | `{{equipment_needs}}` |
| 學習方法/參考資料 (第11行) | `{% for ref in references %}{{ref.book_title}} / {{ref.author}} / {{ref.publisher}}{% if ref.link %} / {{ref.link}}{% endif %}{% if not loop.last %}\n{% endif %}{% endfor %}` |
| 預期成效 (第12行) | `{{expected_outcome}}` |

## 學習內容規劃 (第14-22行，共9個項次)

每個項次包含：
- 項次 (已預填 1-9)
- 日期: `{% if plan_items|length > 0 %}{{plan_items[0].date}}{% endif %}` (第1項)
- 時數: `{% if plan_items|length > 0 %}{{plan_items[0].hours}}{% endif %}`
- 學習內容: `{% if plan_items|length > 0 %}{{plan_items[0].content}}{% endif %}`
- 檢核指標: `{% if plan_items|length > 0 %}{{plan_items[0].metric}}{% endif %}`

**注意**: 對於第2-9項，將索引 `[0]` 改為 `[1]` 到 `[8]`，並將 `|length > 0` 改為 `|length > 1` 到 `|length > 8`

## 目標與成果 (第23-25行)

| 位置 | 替換為 |
|------|--------|
| 階段中(4周後)目標 (第23行) | `{{midterm_goal}}` |
| 階段末(8周後)目標 (第24行) | `{{final_goal}}` |
| 成果發表形式 (第25行) | `{% if '靜態展' in (presentation_format or '') %}☑{% else %}□{% endif %}靜態展 {% if '動態展' in (presentation_format or '') %}☑{% else %}□{% endif %}動態展 □其他{{presentation_other}}` |

## 手機使用規範 (第26行)

保持原文，不需替換

## 簽名欄 (第27-29行)

暫時保留為空白或使用：
- 學生1-3簽名: `{{student_signature}}`
- 父母或監護人1-3簽名: `{{parent_signature}}`

## 管理人與教師簽章 (第31行)

- 空間裝置管理人簽章: 保留為空白
- 指導教師簽章: 保留為空白
- 導師簽章: 保留為空白

## 審查欄位 (第34-35行)

- 狀態: `{{status}}`
- 審查意見: `{{comment}}`

---

## 後端資料對應說明

後端提供的資料結構 (在 `pdf_service.py` 的 `_prepare_template_data` 方法中):

```python
{
    'title': str,               # 計畫名稱
    'member1': {                # 組長資訊
        'student_id': str,
        'class_name': str,
        'seat_number': str,
        'has_submitted': str,   # '是', '第一次申請', '否'
    },
    'member2': {...},           # 組員2資訊
    'member3': {...},           # 組員3資訊
    'motivation': str,          # 學習動機
    'learning_categories': dict,# {'閱讀計畫': True/False, ...}
    'learning_category_other': str,
    'references': [             # 參考資料列表
        {
            'book_title': str,
            'author': str,
            'publisher': str,
            'link': str or None,
        }
    ],
    'expected_outcome': str,    # 預期成效
    'equipment_needs': str,     # 裝置需求
    'env_needs': dict,          # {'自習室': True/False, ...}
    'env_other': str,
    'plan_items': [             # 學習計畫項次
        {
            'date': str,
            'content': str,
            'hours': str,
            'metric': str,
        }
    ],
    'midterm_goal': str,        # 階段中目標
    'final_goal': str,          # 階段末目標
    'presentation_format': str, # '靜態展', '動態展', 或 ''
    'presentation_other': str,
    'status': str,              # '透過', '未透過', '審核中'
    'comment': str,             # 審查意見
}
```

## 手動編輯步驟

1. 開啟「復興自主學習申請表.docx」
2. 根據上表，在對應位置插入Jinja2變數
3. 儲存為「附件一 復興自主學習申請表-新版.docx」
4. 將檔案複製到專案根目錄
5. 重新構建Docker容器

提示: 在 Word 中編輯時，可以直接在儲存格中輸入Jinja2語法。確保不要破壞原有的表格結構。
