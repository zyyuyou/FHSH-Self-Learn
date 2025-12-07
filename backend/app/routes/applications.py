"""
申请表相关路由 - 使用 Beanie ODM
"""
from typing import List, Optional
from pathlib import Path
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from ..models.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationStatus,
)
from ..models.user import User
from ..services.application_service import ApplicationService
from ..services.pdf_service import PDFService
from ..dependencies import get_current_user, get_current_teacher

router = APIRouter(prefix="/applications", tags=["申请表"])


def get_application_service() -> ApplicationService:
    """获取申请表服务实例"""
    return ApplicationService()


@router.post("/", response_model=ApplicationResponse, summary="创建申请表")
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    创建新的自主学习申请表

    学生登录后可以创建申请表
    """
    # 创建申请表
    application = await application_service.create_application(
        application_data=application_data,
        submitter_id=str(current_user.id),
        submitter_student_id=current_user.student_id or current_user.username
    )

    # 转换为响应模型
    return ApplicationResponse(
        id=str(application.id),
        title=application.title,
        apply_date_start=application.apply_date_start,
        apply_date_end=application.apply_date_end,
        status=application.status,
        members=application.members,
        motivation=application.motivation,
        learning_categories=application.learning_categories,
        learning_category_other=application.learning_category_other or "",
        references=application.references or [],
        expected_outcome=application.expected_outcome or "",
        equipment_needs=application.equipment_needs or "",
        env_needs=application.env_needs,
        env_other=application.env_other or "",
        plan_items=application.plan_items,
        midterm_goal=application.midterm_goal or "",
        final_goal=application.final_goal or "",
        presentation_formats=application.presentation_formats or {},
        presentation_other=application.presentation_other or "",
        phone_agreement=application.phone_agreement or "",
        signatures=application.signatures,
        comment=application.comment or "",
        submitter_id=application.submitter_id,
        submitter_student_id=application.submitter_student_id,
        created_at=application.created_at.isoformat(),
        updated_at=application.updated_at.isoformat(),
    )


@router.get("/", response_model=List[ApplicationListResponse], summary="获取申请表列表")
async def get_applications(
    status: Optional[ApplicationStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    获取申请表列表

    - 学生：返回自己的申请表
    - 教师：返回所有申请表
    """
    if current_user.role == "teacher":
        # 教师可以查看所有申请表
        applications = await application_service.get_all_applications(
            status=status,
            skip=skip,
            limit=limit
        )
    else:
        # 学生只能查看自己的申请表
        applications = await application_service.get_applications_by_user(
            submitter_id=str(current_user.id),
            skip=skip,
            limit=limit
        )

    return [
        ApplicationListResponse(
            id=str(app.id),
            title=app.title,
            apply_date_start=app.apply_date_start,
            apply_date_end=app.apply_date_end,
            status=app.status,
            comment=app.comment,
            submitter_student_id=app.submitter_student_id,
            created_at=app.created_at.isoformat(),
            updated_at=app.updated_at.isoformat(),
        )
        for app in applications
    ]


@router.get("/{application_id}", response_model=ApplicationResponse, summary="获取申请表详情")
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    获取申请表详情

    - 学生：只能查看自己的申请表
    - 教师：可以查看所有申请表
    """
    application = await application_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请表不存在"
        )

    # 权限检查
    if current_user.role == "student" and application.submitter_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看此申请表"
        )

    return ApplicationResponse(
        id=str(application.id),
        title=application.title,
        apply_date_start=application.apply_date_start,
        apply_date_end=application.apply_date_end,
        status=application.status,
        members=application.members,
        motivation=application.motivation,
        learning_categories=application.learning_categories,
        learning_category_other=application.learning_category_other or "",
        references=application.references or [],
        expected_outcome=application.expected_outcome or "",
        equipment_needs=application.equipment_needs or "",
        env_needs=application.env_needs,
        env_other=application.env_other or "",
        plan_items=application.plan_items,
        midterm_goal=application.midterm_goal or "",
        final_goal=application.final_goal or "",
        presentation_formats=application.presentation_formats or {},
        presentation_other=application.presentation_other or "",
        phone_agreement=application.phone_agreement or "",
        signatures=application.signatures,
        comment=application.comment or "",
        submitter_id=application.submitter_id,
        submitter_student_id=application.submitter_student_id,
        created_at=application.created_at.isoformat(),
        updated_at=application.updated_at.isoformat(),
    )


@router.put("/{application_id}", response_model=ApplicationResponse, summary="更新申请表")
async def update_application(
    application_id: str,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    更新申请表

    学生只能更新自己的申请表
    """
    # 获取申请表
    application = await application_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请表不存在"
        )

    # 权限检查
    if application.submitter_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权修改此申请表"
        )

    # 更新申请表
    updated_application = await application_service.update_application(
        application_id=application_id,
        update_data=application_data,
        user_id=str(current_user.id)
    )

    if not updated_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="更新失败"
        )

    return ApplicationResponse(
        id=str(updated_application.id),
        title=updated_application.title,
        apply_date_start=updated_application.apply_date_start,
        apply_date_end=updated_application.apply_date_end,
        status=updated_application.status,
        members=updated_application.members,
        motivation=updated_application.motivation,
        learning_categories=updated_application.learning_categories,
        learning_category_other=updated_application.learning_category_other or "",
        references=updated_application.references or [],
        expected_outcome=updated_application.expected_outcome or "",
        equipment_needs=updated_application.equipment_needs or "",
        env_needs=updated_application.env_needs,
        env_other=updated_application.env_other or "",
        plan_items=updated_application.plan_items,
        midterm_goal=updated_application.midterm_goal or "",
        final_goal=updated_application.final_goal or "",
        presentation_formats=updated_application.presentation_formats or {},
        presentation_other=updated_application.presentation_other or "",
        phone_agreement=updated_application.phone_agreement or "",
        signatures=updated_application.signatures,
        comment=updated_application.comment or "",
        submitter_id=updated_application.submitter_id,
        submitter_student_id=updated_application.submitter_student_id,
        created_at=updated_application.created_at.isoformat(),
        updated_at=updated_application.updated_at.isoformat(),
    )


class ReviewRequest(BaseModel):
    """审核请求模型"""
    status: str
    comment: Optional[str] = None


@router.patch("/{application_id}/review", response_model=ApplicationResponse, summary="审核申请表")
async def review_application(
    application_id: str,
    review_data: ReviewRequest,
    current_teacher: User = Depends(get_current_teacher),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    审核申请表（教师功能）

    教师可以通过/不通过学生的申请，并添加评语
    """
    application = await application_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请表不存在"
        )

    # 转换状态字符串为枚举
    try:
        status_enum = ApplicationStatus(review_data.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的状态值: {review_data.status}"
        )

    # 更新申请表状态
    updated_application = await application_service.update_application_status(
        application_id=application_id,
        status=status_enum,
        reviewer_id=str(current_teacher.id),
        comment=review_data.comment
    )

    if not updated_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="更新失败"
        )

    return ApplicationResponse(
        id=str(updated_application.id),
        title=updated_application.title,
        apply_date_start=updated_application.apply_date_start,
        apply_date_end=updated_application.apply_date_end,
        status=updated_application.status,
        members=updated_application.members,
        motivation=updated_application.motivation,
        learning_categories=updated_application.learning_categories,
        learning_category_other=updated_application.learning_category_other or "",
        references=updated_application.references or [],
        expected_outcome=updated_application.expected_outcome or "",
        equipment_needs=updated_application.equipment_needs or "",
        env_needs=updated_application.env_needs,
        env_other=updated_application.env_other or "",
        plan_items=updated_application.plan_items,
        midterm_goal=updated_application.midterm_goal or "",
        final_goal=updated_application.final_goal or "",
        presentation_formats=updated_application.presentation_formats or {},
        presentation_other=updated_application.presentation_other or "",
        phone_agreement=updated_application.phone_agreement or "",
        signatures=updated_application.signatures,
        comment=updated_application.comment or "",
        submitter_id=updated_application.submitter_id,
        submitter_student_id=updated_application.submitter_student_id,
        created_at=updated_application.created_at.isoformat(),
        updated_at=updated_application.updated_at.isoformat(),
    )


@router.delete("/{application_id}", summary="删除申请表")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    删除申请表

    学生只能删除自己的申请表
    """
    application = await application_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请表不存在"
        )

    # 权限检查
    if application.submitter_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除此申请表"
        )

    # 删除申请表
    success = await application_service.delete_application(application_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="删除失败"
        )

    return {"message": "申请表已删除"}


@router.get("/{application_id}/export-pdf", summary="導出申請表為 PDF")
async def export_application_pdf(
    application_id: str,
    current_user: User = Depends(get_current_user),
    application_service: ApplicationService = Depends(get_application_service)
):
    """
    將申請表導出為 PDF 文件

    - 學生和教師都可以導出
    - 返回 PDF 文件供下載
    """
    # 獲取申請表
    application = await application_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="申请表不存在"
        )

    # 權限檢查（學生只能導出自己的，教師可以導出所有）
    if current_user.role == "student" and application.submitter_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="無權導出此申請表"
        )

    try:
        # 生成 PDF
        pdf_path = await PDFService.generate_pdf(application)

        # 生成文件名（使用 URL 編碼處理中文）
        from urllib.parse import quote
        filename = f"自主學習申請表_{application.title}_{application.submitter_student_id}.pdf"
        encoded_filename = quote(filename)

        # 返回 PDF 文件
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=filename,
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
            }
        )

    except FileNotFoundError as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"模板文件不存在: {str(e)}"
        )
    except Exception as e:
        import traceback
        print("=" * 60)
        print("PDF 導出錯誤 - 完整堆棧:")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成 PDF 失敗: {str(e)}"
        )
