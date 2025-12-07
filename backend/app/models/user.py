"""
使用者資料模型 - 使用 Beanie ODM
"""
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field, EmailStr
from .base import Document, TimestampMixin


class UserRole(str, Enum):
    """使用者角色列舉"""
    STUDENT = "student"
    TEACHER = "teacher"


class User(Document, TimestampMixin):
    """使用者基礎模型"""

    username: str = Field(..., description="使用者名稱/賬號")
    hashed_password: str = Field(..., description="加密後的密碼")
    role: UserRole = Field(..., description="使用者角色")
    is_active: bool = Field(default=True, description="賬號是否啟用")

    # 學生特有欄位
    student_id: Optional[str] = Field(default=None, description="學號（僅學生）")
    student_name: Optional[str] = Field(default=None, description="姓名（僅學生）")
    class_name: Optional[str] = Field(default=None, description="班級（僅學生）")
    seat_number: Optional[int] = Field(default=None, description="座號（僅學生）")

    # 教師特有欄位
    teacher_name: Optional[str] = Field(default=None, description="姓名（僅教師）")
    teacher_title: Optional[str] = Field(default=None, description="職稱（僅教師）")
    email: Optional[EmailStr] = Field(default=None, description="郵箱（僅教師）")

    class Settings:
        name = "users"  # MongoDB 集合名稱
        indexes = [
            "username",  # 使用者名稱索引
            "student_id",  # 學號索引
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "username": "11430001",
                "role": "student",
                "student_id": "11430001",
                "student_name": "張三",
                "class_name": "101",
                "seat_number": 1
            }
        }


class UserCreate(BaseModel):
    """建立使用者請求模型"""

    username: str
    password: str
    role: UserRole
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    seat_number: Optional[int] = None
    teacher_name: Optional[str] = None
    teacher_title: Optional[str] = None
    email: Optional[EmailStr] = None


class UserLogin(BaseModel):
    """使用者登入請求模型"""

    username: str
    password: str


class UserResponse(BaseModel):
    """使用者響應模型"""

    id: str
    username: str
    role: UserRole
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    seat_number: Optional[int] = None
    teacher_name: Optional[str] = None
    teacher_title: Optional[str] = None
    email: Optional[EmailStr] = None


class ChangePassword(BaseModel):
    """更改密碼請求模型"""

    old_password: str
    new_password: str


class Token(BaseModel):
    """Token 響應模型"""

    access_token: str
    token_type: str
    user: UserResponse
