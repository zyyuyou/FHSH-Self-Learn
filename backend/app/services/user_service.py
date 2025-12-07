"""
使用者服務層 - 使用 Beanie ODM
"""
from typing import Optional
from beanie import PydanticObjectId
from ..models.user import User, UserCreate, UserRole
from ..utils.auth import get_password_hash, verify_password


class UserService:
    """使用者服務 - 使用 Beanie ODM"""

    async def create_user(self, user_data: UserCreate) -> User:
        """
        建立使用者

        Args:
            user_data: 使用者建立資料

        Returns:
            User: 建立的使用者
        """
        # 檢查使用者名稱是否已存在
        existing_user = await User.find_one(User.username == user_data.username)
        if existing_user:
            raise ValueError("使用者名稱已存在")

        # 加密密碼
        hashed_password = get_password_hash(user_data.password)

        # 建立使用者物件
        user = User(
            username=user_data.username,
            hashed_password=hashed_password,
            role=user_data.role,
            is_active=True,
        )

        # 根據角色新增額外欄位
        if user_data.role == UserRole.STUDENT:
            user.student_id = user_data.student_id
            user.student_name = user_data.student_name
            user.class_name = user_data.class_name
            user.seat_number = user_data.seat_number
        else:  # TEACHER
            user.teacher_name = user_data.teacher_name
            user.teacher_title = user_data.teacher_title
            user.email = user_data.email

        # 插入資料庫
        await user.insert()
        return user

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """
        透過使用者名稱獲取使用者

        Args:
            username: 使用者名稱

        Returns:
            Optional[User]: 使用者物件，不存在返回 None
        """
        return await User.find_one(User.username == username)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        透過 ID 獲取使用者

        Args:
            user_id: 使用者 ID

        Returns:
            Optional[User]: 使用者物件，不存在返回 None
        """
        return await User.get(PydanticObjectId(user_id))

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        驗證使用者憑證

        Args:
            username: 使用者名稱
            password: 密碼

        Returns:
            Optional[User]: 驗證成功返回使用者物件，否則返回 None
        """
        user = await self.get_user_by_username(username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    async def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        """
        更新使用者資訊

        Args:
            user_id: 使用者 ID
            update_data: 更新的資料

        Returns:
            Optional[User]: 更新後的使用者物件
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return None

        # 更新欄位
        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        await user.save()
        return user

    async def delete_user(self, user_id: str) -> bool:
        """
        刪除使用者

        Args:
            user_id: 使用者 ID

        Returns:
            bool: 是否刪除成功
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return False

        await user.delete()
        return True

    async def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """
        更改使用者密碼

        Args:
            user_id: 使用者 ID
            old_password: 舊密碼
            new_password: 新密碼

        Returns:
            bool: 是否更改成功
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return False

        # 驗證舊密碼
        if not verify_password(old_password, user.hashed_password):
            raise ValueError("舊密碼錯誤")

        # 加密新密碼
        user.hashed_password = get_password_hash(new_password)
        await user.save()
        return True
