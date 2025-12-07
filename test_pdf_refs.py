#!/usr/bin/env python3
"""
測試PDF中的參考資料渲染
"""
from docxtpl import DocxTemplate
from jinja2 import Environment, Undefined

class SilentUndefined(Undefined):
    """靜默處理未定義變數"""
    def _fail_with_undefined_error(self, *args, **kwargs):
        return ''
    __add__ = __radd__ = __mul__ = __rmul__ = __div__ = __rdiv__ = \
    __truediv__ = __rtruediv__ = __floordiv__ = __rfloordiv__ = \
    __mod__ = __rmod__ = __pos__ = __neg__ = \
    lambda self, other: self._fail_with_undefined_error()
    __lt__ = __le__ = __gt__ = __ge__ = __eq__ = __ne__ = \
    __hash__ = lambda self, other: self._fail_with_undefined_error()
    __getitem__ = lambda self, other: self._fail_with_undefined_error()
    def __str__(self):
        return ''
    def __len__(self):
        return 0
    def __iter__(self):
        return iter([])
    def __bool__(self):
        return False

template_path = "./附件一 復興自主學習申請表-新版.docx"
output_path = "./test_refs_output.docx"

# 測試資料：3個參考資料
test_data = {
    'title': '測試計畫',
    'references': [
        {
            'book_title': 'Python 程式設計',
            'author': '作者A',
            'publisher': '出版社A',
            'link': 'https://example.com/book1'
        },
        {
            'book_title': 'JavaScript 入門',
            'author': '作者B',
            'publisher': '出版社B',
            'link': ''
        },
        {
            'book_title': 'React 完全指南',
            'author': '作者C',
            'publisher': '出版社C',
            'link': 'https://example.com/book3'
        }
    ],
    'member1': {'student_id': '', 'class_name': '', 'seat_number': '', 'name': '', 'has_submitted': ''},
    'member2': {'student_id': '', 'class_name': '', 'seat_number': '', 'name': '', 'has_submitted': ''},
    'member3': {'student_id': '', 'class_name': '', 'seat_number': '', 'name': '', 'has_submitted': ''},
    'motivation': '測試',
    'learning_categories': {},
    'learning_category_other': '',
    'equipment_needs': '',
    'expected_outcome': '',
    'env_needs': {},
    'env_other': '',
    'plan_items': [],
    'midterm_goal': '',
    'final_goal': '',
    'presentation_formats': {},
    'presentation_other': '',
    'phone_agreement': '',
    'status': '審核中',
    'comment': '',
}

print("渲染模板...")
doc = DocxTemplate(template_path)
jinja_env = Environment(undefined=SilentUndefined)
doc.render(test_data, jinja_env=jinja_env)
doc.save(output_path)

print(f"✅ 已生成: {output_path}")
print("\n檢查參考資料欄位...")

from docx import Document
result_doc = Document(output_path)
table = result_doc.tables[0]
row_10 = table.rows[10]
print(f"\nRow 10, Cell 1 內容:")
print(repr(row_10.cells[1].text))
