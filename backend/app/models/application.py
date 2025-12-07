"""
申請表資料模型 - 使用 Beanie ODM
"""
from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from .base import Document, TimestampMixin


class ApplicationStatus(str, Enum):
    """申請狀態列舉"""
    PENDING = "審核中"
    PASSED = "透過"
    NOT_PASSED = "未透過"


class Member(BaseModel):
    """組員資訊"""

    student_id: str = Field(..., description="學號")
    student_class: str = Field(..., description="班級")
    student_seat: str = Field(..., description="座號")
    student_name: Optional[str] = Field(default=None, description="姓名")
    has_submitted: Optional[str] = Field(default=None, description="是否繳交過自主學習成果")


class PlanItem(BaseModel):
    """學習計劃項次"""

    date: str = Field(..., description="日期")
    content: str = Field(..., description="學習內容")
    hours: str = Field(..., description="時數")
    metric: str = Field(..., description="學生自訂檢核指標")


class Reference(BaseModel):
    """參考資料"""

    book_title: str = Field(..., description="書名")
    author: str = Field(..., description="作者")
    publisher: str = Field(..., description="出版社")
    link: Optional[str] = Field(default=None, description="連結（電子書籍或電子期刊）")


class Signature(BaseModel):
    """簽章資訊"""

    type: str = Field(..., description="簽章型別（組長、家長、教師等）")
    image_url: Optional[str] = Field(default=None, description="簽章圖片 URL 或 base64")


class Application(Document, TimestampMixin):
    """自主學習申請表模型"""

    # 基本資訊
    title: str = Field(..., description="計劃名稱")
    apply_date_start: str = Field(..., description="開放申請開始時間")
    apply_date_end: str = Field(..., description="開放申請結束時間")
    status: ApplicationStatus = Field(default=ApplicationStatus.PENDING, description="稽覈狀態")

    # 學生資料（最多3人）
    members: List[Member] = Field(..., description="組員資訊（最多3人）")

    # 學習動機
    motivation: str = Field(..., description="學習動機")

    # 學習類別
    learning_categories: Dict[str, bool] = Field(..., description="學習類別選擇")
    learning_category_other: Optional[str] = Field(default="", description="學習類別其他說明")

    # 新增：學習方法(參考資料)
    references: List[Reference] = Field(default=[], description="學習方法參考資料")

    # 新增：預期成效（為了相容舊資料，改為可選）
    expected_outcome: Optional[str] = Field(default="", description="本階段自主學習預計達到的成果")

    # 新增：學習裝置需求（為了相容舊資料，改為可選）
    equipment_needs: Optional[str] = Field(default="", description="學習裝置需求")

    # 學習環境需求
    env_needs: Dict[str, bool] = Field(..., description="學習環境需求選擇")
    env_other: Optional[str] = Field(default="", description="其他場地說明")

    # 學習內容規劃
    plan_items: List[PlanItem] = Field(..., description="學習內容規劃項次")

    # 新增：階段中(4周後)預計達成目標（為了相容舊資料，改為可選）
    midterm_goal: Optional[str] = Field(default="", description="階段中(4周後)預計達成目標")

    # 新增：階段末(8周後)預計達成目標（為了相容舊資料，改為可選）
    final_goal: Optional[str] = Field(default="", description="階段末(8周後)預計達成目標")

    # 成果發表形式
    presentation_formats: Optional[Dict[str, bool]] = Field(default_factory=dict, description="成果發表形式選擇")
    presentation_other: Optional[str] = Field(default="", description="成果發表其他說明")

    # 手機使用規範
    phone_agreement: Optional[str] = Field(default="", description="手機使用規範同意情況")

    # 簽章
    signatures: List[Signature] = Field(default=[], description="簽章列表")

    # 稽覈相關
    comment: Optional[str] = Field(default="", description="教師評語/評論")
    reviewer_id: Optional[str] = Field(default=None, description="稽覈教師ID")

    # 提交者資訊
    submitter_id: str = Field(..., description="提交者使用者ID")
    submitter_student_id: str = Field(..., description="提交者學號")

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        if v == "通過":
            return "透過"
        if v == "未通過":
            return "未透過"
        return v

    class Settings:
        name = "applications"  # MongoDB 集合名稱
        indexes = [
            "submitter_id",  # 提交者索引
            "submitter_student_id",  # 提交者學號索引
            "status",  # 狀態索引
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Python 程式設計自主學習計劃",
                "apply_date_start": "2025-01-01",
                "apply_date_end": "2025-06-30",
                "status": "稽覈中",
                "members": [
                    {
                        "student_id": "11430001",
                        "student_class": "101",
                        "student_seat": "1",
                        "student_name": "張三",
                        "has_submitted": "否"
                    }
                ],
                "motivation": "對程式設計有濃厚興趣...",
                "learning_categories": {
                    "專題研究": True,
                    "技藝學習": True
                },
                "plan_items": [
                    {
                        "date": "2025-02-01",
                        "content": "學習 Python 基礎語法",
                        "hours": "2",
                        "metric": "完成前3章練習"
                    }
                ]
            }
        }


class ApplicationCreate(BaseModel):
    """建立申請表請求模型"""

    title: str
    apply_date_start: str
    apply_date_end: str
    members: List[Member]
    motivation: str
    learning_categories: Dict[str, bool]
    learning_category_other: Optional[str] = ""
    references: List[Reference] = []
    expected_outcome: str
    equipment_needs: str
    env_needs: Dict[str, bool]
    env_other: Optional[str] = ""
    plan_items: List[PlanItem]
    midterm_goal: str
    final_goal: str
    presentation_formats: Optional[Dict[str, bool]] = {}
    presentation_other: Optional[str] = ""
    phone_agreement: Optional[str] = ""
    signatures: List[Signature] = []


class ApplicationUpdate(BaseModel):
    """更新申請表請求模型"""

    title: Optional[str] = None
    apply_date_start: Optional[str] = None
    apply_date_end: Optional[str] = None
    members: Optional[List[Member]] = None
    motivation: Optional[str] = None
    learning_categories: Optional[Dict[str, bool]] = None
    learning_category_other: Optional[str] = None
    references: Optional[List[Reference]] = None
    expected_outcome: Optional[str] = None
    equipment_needs: Optional[str] = None
    env_needs: Optional[Dict[str, bool]] = None
    env_other: Optional[str] = None
    plan_items: Optional[List[PlanItem]] = None
    midterm_goal: Optional[str] = None
    final_goal: Optional[str] = None
    presentation_formats: Optional[Dict[str, bool]] = None
    presentation_other: Optional[str] = None
    phone_agreement: Optional[str] = None
    signatures: Optional[List[Signature]] = None
    status: Optional[ApplicationStatus] = None
    comment: Optional[str] = None


class ApplicationResponse(BaseModel):
    """申請表響應模型"""

    id: str
    title: str
    apply_date_start: str
    apply_date_end: str
    status: ApplicationStatus
    members: List[Member]
    motivation: str
    learning_categories: Dict[str, bool]
    learning_category_other: str
    references: List[Reference]
    expected_outcome: Optional[str] = ""
    equipment_needs: Optional[str] = ""
    env_needs: Dict[str, bool]
    env_other: str
    plan_items: List[PlanItem]
    midterm_goal: Optional[str] = ""
    final_goal: Optional[str] = ""
    presentation_formats: Optional[Dict[str, bool]] = {}
    presentation_other: str
    phone_agreement: Optional[str] = ""
    signatures: List[Signature]
    comment: str
    submitter_id: str
    submitter_student_id: str
    created_at: str
    updated_at: str


class ApplicationListResponse(BaseModel):
    """申請表列表響應模型"""

    id: str
    title: str
    apply_date_start: str
    apply_date_end: str
    status: ApplicationStatus
    comment: str
    submitter_student_id: str
    created_at: str
    updated_at: str
