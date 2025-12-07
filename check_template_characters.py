#!/usr/bin/env python3
"""
檢查Word模板中的特殊字元和格式問題
"""
from docx import Document
import re

template_path = "./附件一 復興自主學習申請表-新版.docx"

print("=" * 80)
print("檢查 Word 模板...")
print("=" * 80)

doc = Document(template_path)
table = doc.tables[0]

issues_found = []

# 檢查每個單元格
for row_idx, row in enumerate(table.rows):
    for cell_idx, cell in enumerate(row.cells):
        text = cell.text

        # 跳過空單元格
        if not text.strip():
            continue

        # 檢查1: 是否包含 Jinja2 語法
        if '{%' in text or '{{' in text:
            # 檢查是否有多行
            lines = text.split('\n')
            if len(lines) > 1:
                print(f"\n第{row_idx}行 第{cell_idx}列 ({len(lines)}行):")
                for i, line in enumerate(lines, 1):
                    display = line if len(line) < 60 else line[:57] + "..."
                    print(f"  L{i}: {repr(display)}")

                # 檢查是否有結尾的換行
                if text.endswith('\n'):
                    issues_found.append({
                        'row': row_idx,
                        'cell': cell_idx,
                        'issue': '結尾有換行符',
                        'text': text
                    })
                    print(f"  ⚠️  結尾有換行符")

        # 檢查2: 是否包含不可見字元（除了正常的空格和換行）
        invisible_chars = []
        for char in text:
            # 檢查不可見字元（除了空格、換行、tab）
            if ord(char) < 32 and char not in [' ', '\n', '\t', '\r']:
                invisible_chars.append((char, ord(char)))

        if invisible_chars:
            print(f"\n第{row_idx}行 第{cell_idx}列:")
            print(f"  發現不可見字元:")
            for char, code in invisible_chars:
                print(f"    {repr(char)} (U+{code:04X})")
            issues_found.append({
                'row': row_idx,
                'cell': cell_idx,
                'issue': '不可見字元',
                'chars': invisible_chars
            })

print("\n" + "=" * 80)
print(f"總計發現 {len(issues_found)} 個問題")
print("=" * 80)

if issues_found:
    print("\n問題摘要:")
    for idx, issue in enumerate(issues_found, 1):
        print(f"{idx}. 第{issue['row']}行 第{issue['cell']}列: {issue['issue']}")

# 特別檢查「是否繳交過」欄位（第3-5行，第9列）
print("\n" + "=" * 80)
print("特別檢查「是否繳交過」欄位...")
print("=" * 80)

for row_idx in [3, 4, 5]:
    if row_idx < len(table.rows):
        row = table.rows[row_idx]
        if len(row.cells) > 9:
            cell = row.cells[9]
            text = cell.text
            print(f"\n第{row_idx}行:")
            print(f"  原始內容: {repr(text)}")
            print(f"  顯示內容:\n{text}")

            # 檢查是否有問題的換行
            if '\n' in text:
                lines = text.split('\n')
                print(f"  包含 {len(lines)} 行")
                # 檢查是否有空行
                for i, line in enumerate(lines):
                    if not line.strip():
                        print(f"  ⚠️  第{i+1}行是空行")
                # 檢查最後是否有多餘換行
                if text.endswith('\n'):
                    print(f"  ⚠️  結尾有換行符")
