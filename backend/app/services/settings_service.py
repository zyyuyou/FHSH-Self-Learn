"""
系統設定服務
"""
from typing import Optional
from ..models.settings import SystemSettings, GmailSettingsUpdate


class SettingsService:
    """系統設定服務"""

    MAIN_SETTING_KEY = "main"

    async def get_settings(self) -> SystemSettings:
        """
        獲取系統設定（如果不存在則建立）

        Returns:
            SystemSettings: 系統設定
        """
        settings = await SystemSettings.find_one(
            SystemSettings.setting_key == self.MAIN_SETTING_KEY
        )

        if not settings:
            # 建立預設設定
            settings = SystemSettings(setting_key=self.MAIN_SETTING_KEY)
            await settings.insert()

        return settings

    async def update_gmail_settings(
        self,
        gmail_user: Optional[str],
        gmail_app_password: Optional[str]
    ) -> SystemSettings:
        """
        更新 Gmail 設定

        Args:
            gmail_user: Gmail 帳號（可為空）
            gmail_app_password: Gmail App Password（可為空）

        Returns:
            SystemSettings: 更新後的設定
        """
        settings = await self.get_settings()

        # 更新 Gmail 設定
        # 如果傳入空字串，視為清除設定
        settings.gmail_user = gmail_user if gmail_user else None
        settings.gmail_app_password = gmail_app_password if gmail_app_password else None

        await settings.save()
        return settings

    async def get_gmail_credentials(self) -> tuple[Optional[str], Optional[str]]:
        """
        獲取 Gmail 憑證

        Returns:
            tuple: (gmail_user, gmail_app_password)，如未設定則返回 (None, None)
        """
        settings = await self.get_settings()
        return settings.gmail_user, settings.gmail_app_password

    async def is_gmail_configured(self) -> bool:
        """
        檢查 Gmail 是否已設定

        Returns:
            bool: 是否已設定
        """
        settings = await self.get_settings()
        return bool(settings.gmail_user and settings.gmail_app_password)
