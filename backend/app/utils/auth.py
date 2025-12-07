"""
認證相關工具函式
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..config import settings

# 密碼加密上下文（使用較快的rounds以加速批次初始化）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=8)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    驗證密碼

    Args:
        plain_password: 明文密碼
        hashed_password: 加密後的密碼

    Returns:
        bool: 密碼是否匹配
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    加密密碼

    Args:
        password: 明文密碼

    Returns:
        str: 加密後的密碼
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    建立 JWT access token

    Args:
        data: 要編碼的資料
        expires_delta: 過期時間增量

    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    解碼 JWT token

    Args:
        token: JWT token

    Returns:
        Optional[dict]: 解碼後的資料，失敗返回 None
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


# HTTP Bearer 安全方案
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    獲取當前登入使用者

    Args:
        credentials: HTTP Bearer 憑證

    Returns:
        User: 當前使用者物件

    Raises:
        HTTPException: 如果認證失敗
    """
    from ..models.user import User
    from ..services.user_service import UserService

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無效的認證憑證",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception

    user_service = UserService()
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception

    return user
