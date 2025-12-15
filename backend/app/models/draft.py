"""
草稿資料模型 - 用於儲存學生填寫中的申請表進度
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .base import Document, TimestampMixin


class Draft(Document, TimestampMixin):
    """草稿模型 - 儲存申請表填寫進度"""

    # 提交者資訊
    submitter_id: str = Field(..., description="提交者使用者ID")
    submitter_student_id: str = Field(..., description="提交者學號")

    # 表單資料 (儲存為 JSON 格式)
    form_data: Dict[str, Any] = Field(default={}, description="表單資料")

    class Settings:
        name = "drafts"  # MongoDB 集合名稱
        indexes = [
            "submitter_id",
            "submitter_student_id",
        ]


class DraftCreate(BaseModel):
    """建立草稿請求模型"""
    form_data: Dict[str, Any]


class DraftUpdate(BaseModel):
    """更新草稿請求模型"""
    form_data: Dict[str, Any]


class DraftResponse(BaseModel):
    """草稿響應模型"""
    id: str
    submitter_id: str
    submitter_student_id: str
    form_data: Dict[str, Any]
    created_at: str
    updated_at: str
