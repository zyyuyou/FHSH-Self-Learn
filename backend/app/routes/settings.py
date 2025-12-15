"""
系統設定相關路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.settings import GmailSettingsUpdate, GmailSettingsResponse
from ..models.user import User
from ..services.settings_service import SettingsService
from ..dependencies import get_current_teacher

router = APIRouter(prefix="/settings", tags=["系統設定"])


def get_settings_service() -> SettingsService:
    """獲取設定服務實例"""
    return SettingsService()


@router.get("/gmail", response_model=GmailSettingsResponse, summary="獲取 Gmail 設定")
async def get_gmail_settings(
    current_teacher: User = Depends(get_current_teacher),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    獲取 Gmail 設定狀態（僅教師可用）

    不會返回 App Password，只返回是否已設定
    """
    settings = await settings_service.get_settings()

    return GmailSettingsResponse(
        gmail_user=settings.gmail_user,
        is_configured=bool(settings.gmail_user and settings.gmail_app_password)
    )


@router.put("/gmail", response_model=GmailSettingsResponse, summary="更新 Gmail 設定")
async def update_gmail_settings(
    gmail_settings: GmailSettingsUpdate,
    current_teacher: User = Depends(get_current_teacher),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    更新 Gmail 設定（僅教師可用）

    - **gmail_user**: Gmail 帳號（留空則不發送郵件通知）
    - **gmail_app_password**: Gmail App Password（留空則不發送郵件通知）

    注意：
    1. 兩個欄位都必須填寫才會啟用郵件通知
    2. 若想停用郵件通知，將兩個欄位都清空即可
    """
    settings = await settings_service.update_gmail_settings(
        gmail_user=gmail_settings.gmail_user,
        gmail_app_password=gmail_settings.gmail_app_password
    )

    return GmailSettingsResponse(
        gmail_user=settings.gmail_user,
        is_configured=bool(settings.gmail_user and settings.gmail_app_password)
    )
