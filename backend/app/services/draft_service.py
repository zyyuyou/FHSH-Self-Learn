"""
草稿服務層 - 處理草稿的 CRUD 操作
"""
from typing import Optional
from datetime import datetime
from beanie import PydanticObjectId
from ..models.draft import Draft, DraftCreate, DraftUpdate


class DraftService:
    """草稿服務"""

    async def get_draft_by_user(self, submitter_id: str) -> Optional[Draft]:
        """
        獲取使用者的草稿（每個使用者只有一份草稿）

        Args:
            submitter_id: 提交者使用者 ID

        Returns:
            Optional[Draft]: 草稿物件，不存在返回 None
        """
        return await Draft.find_one(Draft.submitter_id == submitter_id)

    async def create_or_update_draft(
        self,
        draft_data: DraftCreate,
        submitter_id: str,
        submitter_student_id: str
    ) -> Draft:
        """
        建立或更新草稿（每個使用者只保留一份草稿）

        Args:
            draft_data: 草稿資料
            submitter_id: 提交者使用者 ID
            submitter_student_id: 提交者學號

        Returns:
            Draft: 草稿物件
        """
        # 檢查是否已有草稿
        existing_draft = await self.get_draft_by_user(submitter_id)

        if existing_draft:
            # 更新現有草稿
            existing_draft.form_data = draft_data.form_data
            existing_draft.updated_at = datetime.utcnow()
            await existing_draft.save()
            return existing_draft
        else:
            # 建立新草稿
            draft = Draft(
                submitter_id=submitter_id,
                submitter_student_id=submitter_student_id,
                form_data=draft_data.form_data,
            )
            await draft.insert()
            return draft

    async def delete_draft(self, submitter_id: str) -> bool:
        """
        刪除使用者的草稿

        Args:
            submitter_id: 提交者使用者 ID

        Returns:
            bool: 是否刪除成功
        """
        draft = await self.get_draft_by_user(submitter_id)
        if not draft:
            return False

        await draft.delete()
        return True
