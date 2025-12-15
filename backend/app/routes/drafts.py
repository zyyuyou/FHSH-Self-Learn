"""
草稿相關路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.draft import DraftCreate, DraftResponse
from ..models.user import User
from ..services.draft_service import DraftService
from ..dependencies import get_current_user

router = APIRouter(prefix="/drafts", tags=["草稿"])


def get_draft_service() -> DraftService:
    """獲取草稿服務實例"""
    return DraftService()


@router.get("/", response_model=DraftResponse, summary="獲取當前使用者的草稿")
async def get_draft(
    current_user: User = Depends(get_current_user),
    draft_service: DraftService = Depends(get_draft_service)
):
    """
    獲取當前使用者的草稿

    - 每個使用者只有一份草稿
    - 如果沒有草稿，返回 404
    """
    draft = await draft_service.get_draft_by_user(str(current_user.id))

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="沒有儲存的草稿"
        )

    return DraftResponse(
        id=str(draft.id),
        submitter_id=draft.submitter_id,
        submitter_student_id=draft.submitter_student_id,
        form_data=draft.form_data,
        created_at=draft.created_at.isoformat(),
        updated_at=draft.updated_at.isoformat(),
    )


@router.post("/", response_model=DraftResponse, summary="儲存草稿")
async def save_draft(
    draft_data: DraftCreate,
    current_user: User = Depends(get_current_user),
    draft_service: DraftService = Depends(get_draft_service)
):
    """
    儲存草稿

    - 如果已有草稿，會覆蓋更新
    - 如果沒有草稿，會建立新的
    """
    draft = await draft_service.create_or_update_draft(
        draft_data=draft_data,
        submitter_id=str(current_user.id),
        submitter_student_id=current_user.student_id or current_user.username
    )

    return DraftResponse(
        id=str(draft.id),
        submitter_id=draft.submitter_id,
        submitter_student_id=draft.submitter_student_id,
        form_data=draft.form_data,
        created_at=draft.created_at.isoformat(),
        updated_at=draft.updated_at.isoformat(),
    )


@router.delete("/", summary="刪除草稿")
async def delete_draft(
    current_user: User = Depends(get_current_user),
    draft_service: DraftService = Depends(get_draft_service)
):
    """
    刪除當前使用者的草稿
    """
    success = await draft_service.delete_draft(str(current_user.id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="沒有可刪除的草稿"
        )

    return {"message": "草稿已刪除"}
