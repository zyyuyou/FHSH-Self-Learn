"""
郵件通知服務 - 使用 Gmail SMTP 發送審核結果通知
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from pathlib import Path
from typing import Optional, Tuple
import traceback


class EmailService:
    """郵件通知服務"""

    # Gmail SMTP 設定
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587

    @classmethod
    async def _get_credentials(cls) -> Tuple[Optional[str], Optional[str]]:
        """
        從資料庫獲取 Gmail 帳號和 App Password

        Returns:
            tuple: (email, app_password)，如未設定則返回 (None, None)
        """
        from .settings_service import SettingsService
        settings_service = SettingsService()
        return await settings_service.get_gmail_credentials()

    @classmethod
    def _create_review_email(
        cls,
        recipient_email: str,
        student_name: str,
        application_title: str,
        status: str,
        comment: Optional[str] = None,
        sender_email: str = "",
    ) -> MIMEMultipart:
        """
        建立審核結果通知郵件

        Args:
            recipient_email: 收件人 Email
            student_name: 學生姓名
            application_title: 申請表標題
            status: 審核狀態（通過/未通過）
            comment: 審核意見
            sender_email: 寄件人 Email

        Returns:
            MIMEMultipart: 郵件物件
        """
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = f"【自主學習申請】{application_title} - 審核結果通知"

        # 判斷狀態顯示
        if status == "通過":
            status_text = "✅ 初審通過"
            status_color = "#28a745"
            next_step_text = "請列印 PDF，簽名完成後並繳交至圖書館進行複審。"
        else:
            status_text = "❌ 未通過"
            status_color = "#dc3545"
            next_step_text = ""

        # HTML 郵件內容
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }}
        .content {{
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
            border-top: none;
        }}
        .status {{
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            color: white;
            background-color: {status_color};
            margin: 20px 0;
        }}
        .info-box {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
        }}
        .comment-box {{
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }}
        .footer {{
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 自主學習申請系統</h1>
        <p>審核結果通知</p>
    </div>
    <div class="content">
        <p>親愛的 <strong>{student_name}</strong> 同學，您好：</p>

        <p>您提交的自主學習計畫申請已完成審核，審核結果如下：</p>

        <div class="info-box">
            <p><strong>📋 計畫名稱：</strong>{application_title}</p>
            <p><strong>📊 審核結果：</strong></p>
            <div class="status">{status_text}</div>
            {"<p style='margin-top: 15px; font-weight: bold; color: #155724;'>📌 " + next_step_text + "</p>" if next_step_text else ""}
        </div>

        {"<div class='comment-box'><p><strong>💬 審核意見：</strong></p><p>" + comment + "</p></div>" if comment else ""}

        <p>若您有任何疑問，請洽詢指導教師。</p>

        <p>祝學習順利！</p>
    </div>
    <div class="footer">
        <p>此為系統自動發送的通知郵件，請勿直接回覆。</p>
        <p>復興高中自主學習申請系統</p>
    </div>
</body>
</html>
"""
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        return msg

    @classmethod
    def _attach_pdf(cls, msg: MIMEMultipart, pdf_path: Path, filename: str) -> None:
        """
        附加 PDF 檔案到郵件

        Args:
            msg: 郵件物件
            pdf_path: PDF 檔案路徑
            filename: 附件檔名
        """
        with open(pdf_path, "rb") as f:
            pdf_data = f.read()

        attachment = MIMEApplication(pdf_data, _subtype="pdf")
        attachment.add_header(
            "Content-Disposition", "attachment", filename=filename
        )
        msg.attach(attachment)

    @classmethod
    async def send_review_notification(
        cls,
        recipient_email: str,
        student_name: str,
        application_title: str,
        status: str,
        comment: Optional[str] = None,
        pdf_path: Optional[Path] = None,
    ) -> bool:
        """
        發送審核結果通知郵件

        Args:
            recipient_email: 收件人 Email（即學生的 username）
            student_name: 學生姓名
            application_title: 申請表標題
            status: 審核狀態（通過/未通過）
            comment: 審核意見
            pdf_path: PDF 檔案路徑（可選）

        Returns:
            bool: 是否發送成功
        """
        try:
            # 獲取憑證
            sender_email, app_password = await cls._get_credentials()

            # 檢查是否已設定
            if not sender_email or not app_password:
                print("郵件發送跳過（未設定 Gmail 帳號）")
                return False

            # 建立郵件
            msg = cls._create_review_email(
                recipient_email=recipient_email,
                student_name=student_name,
                application_title=application_title,
                status=status,
                comment=comment,
                sender_email=sender_email,
            )

            # 附加 PDF（如果有）
            if pdf_path and pdf_path.exists():
                filename = f"{application_title}_申請表.pdf"
                cls._attach_pdf(msg, pdf_path, filename)

            # 發送郵件
            with smtplib.SMTP(cls.SMTP_SERVER, cls.SMTP_PORT) as server:
                server.starttls()
                server.login(sender_email, app_password)
                server.send_message(msg)

            print(f"郵件發送成功: {recipient_email}")
            return True

        except Exception as e:
            # 錯誤記錄但不中斷流程
            print(f"郵件發送失敗: {e}")
            traceback.print_exc()
            return False

    @classmethod
    async def is_configured(cls) -> bool:
        """
        檢查郵件服務是否已設定

        Returns:
            bool: 是否已設定 Gmail 憑證
        """
        from .settings_service import SettingsService
        settings_service = SettingsService()
        return await settings_service.is_gmail_configured()
