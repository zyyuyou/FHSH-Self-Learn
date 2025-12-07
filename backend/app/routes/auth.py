"""
認證相關路由 - 使用 Beanie ODM
"""
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.user import UserLogin, Token, UserResponse, UserRole, UserCreate, ChangePassword, User
from ..services.user_service import UserService
from ..utils.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["認證"])


def get_user_service() -> UserService:
    """獲取使用者服務例項"""
    return UserService()


@router.post("/login", response_model=Token, summary="使用者登入")
async def login(
    user_login: UserLogin,
    user_service: UserService = Depends(get_user_service)
):
    """
    使用者登入介面

    - **username**: 使用者名稱（學號或教師賬號）
    - **password**: 密碼
    """

    # 驗證使用者憑證
    user = await user_service.authenticate_user(user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="使用者名稱或密碼錯誤",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 建立 access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.id), "role": user.role}
    )

    # 構建使用者響應
    user_response = UserResponse(
        id=str(user.id),
        username=user.username,
        role=user.role,
        student_id=user.student_id,
        student_name=user.student_name,
        class_name=user.class_name,
        seat_number=user.seat_number,
        teacher_name=user.teacher_name,
        teacher_title=user.teacher_title,
        email=user.email,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/register", response_model=UserResponse, summary="使用者註冊（僅供開發測試）")
async def register(
    username: str,
    password: str,
    role: UserRole,
    student_id: str = None,
    student_name: str = None,
    class_name: str = None,
    seat_number: int = None,
    teacher_name: str = None,
    user_service: UserService = Depends(get_user_service)
):
    """
    使用者註冊介面（僅供開發測試使用）

    生產環境應該透過管理員後臺或指令碼批次匯入使用者
    """

    # 建立使用者資料
    user_create = UserCreate(
        username=username,
        password=password,
        role=role,
        student_id=student_id,
        student_name=student_name,
        class_name=class_name,
        seat_number=seat_number,
        teacher_name=teacher_name,
    )

    try:
        user = await user_service.create_user(user_create)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return UserResponse(
        id=str(user.id),
        username=user.username,
        role=user.role,
        student_id=user.student_id,
        student_name=user.student_name,
        class_name=user.class_name,
        seat_number=user.seat_number,
        teacher_name=user.teacher_name,
        teacher_title=user.teacher_title,
        email=user.email,
    )


@router.post("/change-password", summary="更改密碼")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """
    更改密碼介面

    - **old_password**: 舊密碼
    - **new_password**: 新密碼
    """
    try:
        success = await user_service.change_password(
            user_id=str(current_user.id),
            old_password=password_data.old_password,
            new_password=password_data.new_password
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="更改密碼失敗"
            )
        return {"message": "密碼更改成功"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
