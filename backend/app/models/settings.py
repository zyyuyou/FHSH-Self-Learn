"""
系統設定資料模型 - 使用 Beanie ODM
"""
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from .base import Document, TimestampMixin


class SystemSettings(Document, TimestampMixin):
    """系統設定模型（單例模式，只有一筆記錄）"""

    # Gmail 設定
    gmail_user: Optional[EmailStr] = Field(default=None, description="Gmail 帳號")
    gmail_app_password: Optional[str] = Field(default=None, description="Gmail App Password")

    # 設定描述
    setting_key: str = Field(default="main", description="設定鍵值（固定為 main）")

    class Settings:
        name = "system_settings"  # MongoDB 集合名稱
        indexes = [
            "setting_key",
        ]


class GmailSettingsUpdate(BaseModel):
    """Gmail 設定更新請求模型"""
    gmail_user: Optional[str] = Field(default=None, description="Gmail 帳號（留空則不發送郵件）")
    gmail_app_password: Optional[str] = Field(default=None, description="Gmail App Password（留空則不發送郵件）")


class GmailSettingsResponse(BaseModel):
    """Gmail 設定響應模型（不返回密碼）"""
    gmail_user: Optional[str] = None
    is_configured: bool = False
