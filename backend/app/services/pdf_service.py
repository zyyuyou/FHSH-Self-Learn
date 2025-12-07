"""
PDF 生成服務
"""
import os
import subprocess
import tempfile
import traceback
from pathlib import Path
from typing import Dict, Any
from docxtpl import DocxTemplate
from ..models.application import Application


class PDFService:
    """PDF 生成服務"""

    # Word 模板路徑
    TEMPLATE_PATH = Path("/app/templates/application_template.docx")
    TEMP_DIR = Path("/app/temp")

    @classmethod
    def _prepare_template_data(cls, application: Application) -> Dict[str, Any]:
        """
        準備模板資料

        Args:
            application: 申請表資料

        Returns:
            Dict: 模板變數字典
        """
        # 提取組員資訊
        members_data = []
        for i, member in enumerate(application.members, 1):
            members_data.append({
                'number': i,
                'student_id': member.student_id,
                'class_name': member.student_class,
                'seat_number': member.student_seat,
                'name': member.student_name or '',
                'has_submitted': member.has_submitted or '否'
            })

        # 填充空白組員（如果少於3人）
        while len(members_data) < 3:
            members_data.append({
                'number': len(members_data) + 1,
                'student_id': '',
                'class_name': '',
                'seat_number': '',
                'name': '',
                'has_submitted': ''
            })

        # 處理學習類別
        categories = []
        for category, selected in application.learning_categories.items():
            if selected:
                categories.append(category)
        if application.learning_category_other:
            categories.append(f"其他：{application.learning_category_other}")
        categories_str = '、'.join(categories) if categories else ''

        # 處理學習環境需求
        env_needs = []
        for env, selected in application.env_needs.items():
            if selected:
                env_needs.append(env)
        if application.env_other:
            env_needs.append(f"其他：{application.env_other}")
        env_str = '、'.join(env_needs) if env_needs else ''

        # 處理參考資料
        references_data = []
        for idx, ref in enumerate(application.references, 1):
            ref_str = f"{ref.book_title} / {ref.author} / {ref.publisher}"
            if ref.link:
                ref_str += f" / {ref.link}"
            references_data.append({
                'number': idx,
                'book_title': ref.book_title,
                'author': ref.author,
                'publisher': ref.publisher,
                'link': ref.link or '',
                'full_text': ref_str
            })

        # 將所有參考資料合併成一個字串（用於簡單模板）
        references_str = '\n'.join([ref['full_text'] for ref in references_data]) if references_data else ''

        # 準備學習計畫專案
        plan_items = []
        for idx, item in enumerate(application.plan_items, 1):
            # 將日期格式從 YYYY-MM-DD 轉換為 MM/DD
            date_display = item.date
            if item.date and '-' in item.date:
                try:
                    # 解析日期並格式化為 月/日
                    parts = item.date.split('-')
                    if len(parts) == 3:
                        month = int(parts[1])
                        day = int(parts[2])
                        date_display = f"{month}/{day}"
                except:
                    date_display = item.date

            plan_items.append({
                'number': idx,
                'date': date_display,
                'content': item.content,
                'hours': item.hours,
                'metric': item.metric
            })

        # 組裝模板資料
        template_data = {
            # 計畫名稱
            'title': application.title,

            # 申請期間
            'apply_date_start': application.apply_date_start,
            'apply_date_end': application.apply_date_end,

            # 組員資訊
            'members': members_data,
            'member1': members_data[0],
            'member2': members_data[1],
            'member3': members_data[2],

            # 學習動機
            'motivation': application.motivation,

            # 學習類別（原始字典和字串）
            'learning_categories': application.learning_categories,  # 原始字典
            'learning_categories_str': categories_str,  # 字串版本
            'learning_category_other': application.learning_category_other or '',

            # 參考資料
            'references': references_data,  # 列表形式
            'references_str': references_str,  # 字串形式

            # 預期成效
            'expected_outcome': application.expected_outcome or '',

            # 學習裝置需求
            'equipment_needs': application.equipment_needs or '',

            # 學習環境需求（原始字典和字串）
            'env_needs': application.env_needs,  # 原始字典
            'env_needs_str': env_str,  # 字串版本
            'env_other': application.env_other or '',

            # 學習計畫專案
            'plan_items': plan_items,

            # 階段目標
            'midterm_goal': application.midterm_goal or '',
            'final_goal': application.final_goal or '',

            # 成果發表形式
            'presentation_formats': application.presentation_formats or {},
            'presentation_other': application.presentation_other or '',

            # 手機使用規範
            'phone_agreement': application.phone_agreement or '',

            # 簽名欄位（暫時留空）
            'student_signature': '',
            'parent_signature': '',
            'homeroom_teacher_signature': '',
            'counselor_signature': '',

            # 審核資訊
            'status': application.status.value,
            'comment': application.comment or '',
        }

        return template_data

    @classmethod
    def _convert_docx_to_pdf(cls, docx_path: Path, pdf_path: Path) -> None:
        """
        使用 LibreOffice 將 Word 檔案轉換為 PDF

        Args:
            docx_path: Word 檔案路徑
            pdf_path: 輸出 PDF 路徑
        """
        # 確保輸出目錄存在
        pdf_path.parent.mkdir(parents=True, exist_ok=True)

        # 使用 LibreOffice headless mode 轉換
        cmd = [
            'libreoffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', str(pdf_path.parent),
            str(docx_path)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                timeout=30
            )

            if result.returncode != 0:
                raise Exception(f"LibreOffice 轉換失敗: {result.stderr}")

            # LibreOffice 會自動使用原檔名生成 PDF
            generated_pdf = pdf_path.parent / f"{docx_path.stem}.pdf"

            # 如果指定的 PDF 路徑名稱不同，需要重新命名
            if generated_pdf != pdf_path:
                generated_pdf.rename(pdf_path)

        except subprocess.TimeoutExpired:
            raise Exception("PDF 轉換超時")
        except Exception as e:
            raise Exception(f"PDF 轉換錯誤: {str(e)}")

    @classmethod
    async def generate_pdf(cls, application: Application) -> Path:
        """
        生成 PDF 檔案

        Args:
            application: 申請表資料

        Returns:
            Path: 生成的 PDF 檔案路徑
        """
        # 確保臨時目錄存在
        cls.TEMP_DIR.mkdir(parents=True, exist_ok=True)

        # 檢查模板是否存在
        if not cls.TEMPLATE_PATH.exists():
            raise FileNotFoundError(f"Word 模板不存在: {cls.TEMPLATE_PATH}")

        try:
            # 1. 載入 Word 模板
            doc = DocxTemplate(cls.TEMPLATE_PATH)

            # 2. 準備模板資料
            context = cls._prepare_template_data(application)

            # 3. 渲染模板
            # 先列印資料以便除錯
            print("=" * 60)
            print("PDF 模板資料:")
            import json
            print(json.dumps(context, ensure_ascii=False, indent=2, default=str))
            print("=" * 60)

            # 使用自定義 Jinja2 環境，將未定義變數設為空字串
            from jinja2 import Environment, Undefined

            class SilentUndefined(Undefined):
                """靜默處理未定義變數，返回空字串"""
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

            jinja_env = Environment(undefined=SilentUndefined)
            doc.render(context, jinja_env=jinja_env)

            # 4. 儲存填充好的 Word 檔案到臨時目錄
            temp_docx = cls.TEMP_DIR / f"application_{application.id}.docx"
            doc.save(temp_docx)

            # 5. 轉換為 PDF
            temp_pdf = cls.TEMP_DIR / f"application_{application.id}.pdf"
            cls._convert_docx_to_pdf(temp_docx, temp_pdf)

            # 6. 清理臨時 Word 檔案
            if temp_docx.exists():
                temp_docx.unlink()

            return temp_pdf

        except Exception as e:
            # 列印完整的錯誤堆疊以便除錯
            print(f"PDF生成錯誤詳情:")
            traceback.print_exc()

            # 清理可能產生的臨時檔案
            temp_docx = cls.TEMP_DIR / f"application_{application.id}.docx"
            temp_pdf = cls.TEMP_DIR / f"application_{application.id}.pdf"

            if temp_docx.exists():
                temp_docx.unlink()
            if temp_pdf.exists():
                temp_pdf.unlink()

            raise Exception(f"生成 PDF 失敗: {str(e)}")
