#!/usr/bin/env python3
from docxtpl import DocxTemplate
from jinja2 import Environment, Undefined
from docx import Document

class SilentUndefined(Undefined):
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

# 使用容器的模板
template_path = "./container_template.docx"
output_path = "./測試容器模板渲染.docx"

# 簡化的測試資料 - 只選閱讀計畫
test_data = {
    'title': '測試',
    'learning_categories': {
        '閱讀計畫': True,
    },
    'learning_category_other': '',

    'presentation_formats': {
        '靜態展': True,
    },
    'presentation_other': '',
}

print("渲染容器模板...")
doc = DocxTemplate(template_path)
jinja_env = Environment(undefined=SilentUndefined)
doc.render(test_data, jinja_env=jinja_env)
doc.save(output_path)

# 檢查結果
doc_result = Document(output_path)
table = doc_result.tables[0]

print("\n學習類別渲染結果:")
row = table.rows[7]
cell = row.cells[1]
text = cell.text
print(f"內容: {repr(text)}")
print(f"checkbox數量: {text.count('☑') + text.count('□')}")

print("\n成果發表形式渲染結果:")
row = table.rows[24]
cell = row.cells[1]
text = cell.text
print(f"內容: {repr(text)}")
print(f"checkbox數量: {text.count('☑') + text.count('□')}")
