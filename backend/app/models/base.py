"""
基礎資料模型 - 使用 Beanie ODM
"""
from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class TimestampMixin:
    """時間戳混入類"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# 匯出 Document 供其他模型使用
__all__ = ["Document", "TimestampMixin"]
