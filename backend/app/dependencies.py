"""
FastAPI 依賴注入 - 使用 Beanie ODM
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .models.user import User, UserRole
from .services.user_service import UserService
from .utils.auth import decode_access_token

# HTTP Bearer token scheme
security = HTTPBearer()


def get_user_service() -> UserService:
    """
    獲取使用者服務例項
    使用 Beanie 後不再需要傳入 database
    """
    return UserService()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_service: UserService = Depends(get_user_service)
) -> User:
    """
    獲取當前登入使用者

    從 JWT token 中解析使用者資訊
    """
    token = credentials.credentials

    # 解碼 token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的認證憑證",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 獲取使用者 ID
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的認證憑證",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 從資料庫獲取使用者
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="使用者不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="使用者已被禁用"
        )

    return user


async def get_current_student(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    獲取當前學生使用者

    確保當前使用者是學生角色
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要學生許可權"
        )
    return current_user


async def get_current_teacher(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    獲取當前教師使用者

    確保當前使用者是教師角色
    """
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要教師許可權"
        )
    return current_user
