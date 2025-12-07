"""
申請表服務層 - 使用 Beanie ODM
"""
from typing import List, Optional, Dict
from datetime import datetime
from beanie import PydanticObjectId
from ..models.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationStatus,
)


class ApplicationService:
    """申請表服務 - 使用 Beanie ODM"""

    async def create_application(
        self,
        application_data: ApplicationCreate,
        submitter_id: str,
        submitter_student_id: str
    ) -> Application:
        """
        建立申請表

        Args:
            application_data: 申請表資料
            submitter_id: 提交者使用者 ID
            submitter_student_id: 提交者學號

        Returns:
            Application: 建立的申請表
        """
        # 建立申請表物件
        application = Application(
            **application_data.model_dump(),
            status=ApplicationStatus.PENDING,
            submitter_id=submitter_id,
            submitter_student_id=submitter_student_id,
            comment="",
            reviewer_id=None,
        )

        # 插入資料庫
        await application.insert()
        return application

    async def get_application_by_id(self, application_id: str) -> Optional[Application]:
        """
        透過 ID 獲取申請表

        Args:
            application_id: 申請表 ID

        Returns:
            Optional[Application]: 申請表物件，不存在返回 None
        """
        return await Application.get(PydanticObjectId(application_id))

    async def get_applications_by_user(
        self,
        submitter_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Application]:
        """
        獲取使用者的所有申請表

        Args:
            submitter_id: 提交者 ID
            skip: 跳過數量
            limit: 限制數量

        Returns:
            List[Application]: 申請表列表
        """
        applications = await Application.find(
            Application.submitter_id == submitter_id
        ).sort(-Application.created_at).skip(skip).limit(limit).to_list()

        return applications

    async def get_all_applications(
        self,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Application]:
        """
        獲取所有申請表（教師用）

        Args:
            status: 篩選狀態
            skip: 跳過數量
            limit: 限制數量

        Returns:
            List[Application]: 申請表列表
        """
        if status:
            query = Application.find(Application.status == status)
        else:
            query = Application.find()

        applications = await query.sort(-Application.created_at).skip(skip).limit(limit).to_list()
        return applications

    async def update_application(
        self,
        application_id: str,
        update_data: ApplicationUpdate,
        user_id: str
    ) -> Optional[Application]:
        """
        更新申請表

        Args:
            application_id: 申請表 ID
            update_data: 更新資料
            user_id: 操作使用者 ID

        Returns:
            Optional[Application]: 更新後的申請表
        """
        application = await self.get_application_by_id(application_id)
        if not application:
            return None

        # 只更新提供的欄位
        update_dict = update_data.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            if hasattr(application, key):
                setattr(application, key, value)

        application.updated_at = datetime.utcnow()
        await application.save()
        return application

    async def update_application_status(
        self,
        application_id: str,
        status: ApplicationStatus,
        reviewer_id: str,
        comment: Optional[str] = None
    ) -> Optional[Application]:
        """
        更新申請表狀態（教師稽覈）

        Args:
            application_id: 申請表 ID
            status: 新狀態
            reviewer_id: 稽覈教師 ID
            comment: 評語

        Returns:
            Optional[Application]: 更新後的申請表
        """
        application = await self.get_application_by_id(application_id)
        if not application:
            return None

        application.status = status
        application.reviewer_id = reviewer_id
        if comment is not None:
            application.comment = comment
        application.updated_at = datetime.utcnow()

        await application.save()
        return application

    async def delete_application(self, application_id: str) -> bool:
        """
        刪除申請表

        Args:
            application_id: 申請表 ID

        Returns:
            bool: 是否刪除成功
        """
        application = await self.get_application_by_id(application_id)
        if not application:
            return False

        await application.delete()
        return True

    async def count_applications(self, status: Optional[ApplicationStatus] = None) -> int:
        """
        統計申請表數量

        Args:
            status: 篩選狀態

        Returns:
            int: 申請表數量
        """
        if status:
            return await Application.find(Application.status == status).count()
        return await Application.find().count()
