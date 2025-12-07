#!/usr/bin/env python3
"""
在原始 Word 模板中新增 Jinja2 變數標記
保持所有格式不變
"""
from docx import Document
from pathlib import Path

def add_jinja2_variables():
    # 載入原始檔案
    doc = Document('/Users/zhengyuyou/Desktop/self-learn-system/復興自主學習申請表.docx')

    # 獲取主表格
    table = doc.tables[0]

    print("正在新增 Jinja2 變數...")

    # 行1: 計畫名稱 (第2-9列合併，新增變數到第2列)
    table.rows[1].cells[1].text = '{{title}}'

    # 行3-5: 學生資料
    for i in range(3):  # 學生1-3
        row = table.rows[3 + i]
        # 班級（第2-3列）
        row.cells[1].text = '{% if members[' + str(i) + '] %}{{members[' + str(i) + '].student_class}}{% endif %}'
        # 座號（第4列）
        row.cells[3].text = '{% if members[' + str(i) + '] %}{{members[' + str(i) + '].student_seat}}{% endif %}'
        # 學號（第5-6列）
        row.cells[4].text = '{% if members[' + str(i) + '] %}{{members[' + str(i) + '].student_id}}{% endif %}'
        # 姓名（第7-9列）
        if i == 0:
            row.cells[6].text = '{% if members[0] %}{{members[0].student_name}}\n第一位\n為組長{% endif %}'
        else:
            row.cells[6].text = '{% if members[' + str(i) + '] %}{{members[' + str(i) + '].student_name}}{% endif %}'
        # 是否繳交（第10列）
        row.cells[9].text = '{% if members[' + str(i) + '] %}{{members[' + str(i) + '].has_submitted}}{% endif %}'

    # 行6: 學習動機
    table.rows[6].cells[1].text = '{{motivation}}'

    # 行7: 學習類別
    categories_text = '''{% if learning_categories.get('閱讀計畫') %}☑{% else %}□{% endif %}閱讀計畫 {% if learning_categories.get('志工服務') %}☑{% else %}□{% endif %}志工服務 {% if learning_categories.get('專題研究') %}☑{% else %}□{% endif %}專題研究 {% if learning_categories.get('藝文創作') %}☑{% else %}□{% endif %}藝文創作 {% if learning_categories.get('技藝學習') %}☑{% else %}□{% endif %}技藝學習 {% if learning_categories.get('競賽準備') %}☑{% else %}□{% endif %}競賽準備
{% if learning_categories.get('實作體驗') %}☑{% else %}□{% endif %}實作體驗 {% if learning_categories.get('課程延伸') %}☑{% else %}□{% endif %}課程延伸 □其他：{% if learning_category_other %}{{learning_category_other}}{% else %}_________________{% endif %}'''
    table.rows[7].cells[1].text = categories_text

    # 行8: 學習環境需求
    env_text = '''A. 圖書館場地:
{% if env_needs.get('自習室') %}☑{% else %}□{% endif %}自習室(低噪音，可自備筆電者) {% if env_needs.get('數位閱讀室') %}☑{% else %}□{% endif %}數位閱讀室(需電腦操作者)
{% if env_needs.get('雲端教室') %}☑{% else %}□{% endif %}雲端教室(需小組討論者)       {% if env_needs.get('美力教室') %}☑{% else %}□{% endif %}美力教室 (有實作或大桌面需求者，如服
                                 裝製作、繪畫等)
B. 其他場地： (請寫出) {% if env_other %}{{env_other}}{% else %}_____________________{% endif %}
 (須徵得該場地管理者同意並簽名，如體育專案須獲得體育組長同意並簽名)'''
    table.rows[8].cells[1].text = env_text

    # 行13-21: 學習內容規劃（9個項次）
    for i in range(9):  # 項次1-9
        row_idx = 13 + i
        row = table.rows[row_idx]
        # 項次已經有了（第2列）
        # 日期（第3-4列）
        row.cells[2].text = '{% if plan_items|length > ' + str(i) + ' %}{{plan_items[' + str(i) + '].date}}{% endif %}'
        # 時數（第5列）
        row.cells[4].text = '{% if plan_items|length > ' + str(i) + ' %}{{plan_items[' + str(i) + '].hours}}{% endif %}'
        # 學習內容（第6-7列）
        row.cells[5].text = '{% if plan_items|length > ' + str(i) + ' %}{{plan_items[' + str(i) + '].content}}{% endif %}'
        # 學生自訂檢核指標（第8-10列）
        row.cells[7].text = '{% if plan_items|length > ' + str(i) + ' %}{{plan_items[' + str(i) + '].metric}}{% endif %}'

    # 行24: 成果發表形式
    presentation_text = '''{% if presentation_format == '靜態展 (PPT、書面報告等)' %}☑{% else %}□{% endif %}靜態展(PPT、書面報告、心得、自我省思…等)
{% if presentation_format == '動態展 (直播、影片撥放等)' %}☑{% else %}□{% endif %}動態展 (直播、影片撥放、實際展示、演出…等)
□其他{% if presentation_other %}{{presentation_other}}{% else %}__________{% endif %}'''
    table.rows[24].cells[1].text = presentation_text

    # 行33: 初審（審查意見和狀態）
    review_text = '{% if status %}{{status}}{% else %}□透過  □修正後透過  □不透過{% endif %} \n審查意見：{% if comment %}{{comment}}{% endif %}                          簽章：'
    table.rows[33].cells[4].text = review_text

    # 儲存新模板
    output_path = '/Users/zhengyuyou/Desktop/self-learn-system/backend/附件一 復興自主學習申請表-新版.docx'
    doc.save(output_path)
    print(f'✓ 已儲存新模板: {output_path}')

    return output_path

if __name__ == '__main__':
    add_jinja2_variables()
