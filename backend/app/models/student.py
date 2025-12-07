"""
學生資料模型 - 使用 Beanie ODM
"""
from pydantic import BaseModel, Field
from .base import Document, TimestampMixin


class Student(Document, TimestampMixin):
    """學生模型（從全校名單匯入）"""

    student_id: str = Field(..., description="學號")
    class_name: str = Field(..., description="班級")
    seat_number: int = Field(..., description="座號")
    name: str = Field(..., description="姓名")

    class Settings:
        name = "students"  # MongoDB 集合名稱
        indexes = [
            "student_id",  # 學號索引（唯一）
            "class_name",  # 班級索引
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "11430001",
                "class_name": "101",
                "seat_number": 1,
                "name": "張三"
            }
        }


class StudentResponse(BaseModel):
    """學生響應模型"""

    id: str
    student_id: str
    class_name: str
    seat_number: int
    name: str
