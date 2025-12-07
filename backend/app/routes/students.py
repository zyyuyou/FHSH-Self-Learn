"""
學生相關路由 - 使用 Beanie ODM
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..models.student import StudentResponse
from ..services.student_service import StudentService
from ..dependencies import get_current_teacher

router = APIRouter(prefix="/students", tags=["學生"])


def get_student_service() -> StudentService:
    """獲取學生服務例項"""
    return StudentService()


@router.get("/", response_model=List[StudentResponse], summary="獲取學生列表")
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    student_service: StudentService = Depends(get_student_service)
):
    """
    獲取學生列表

    任何登入使用者都可以查詢學生資訊（用於填寫申請表時查詢組員）
    """
    students = await student_service.get_all_students(skip=skip, limit=limit)

    return [
        StudentResponse(
            id=str(student.id),
            student_id=student.student_id,
            class_name=student.class_name,
            seat_number=student.seat_number,
            name=student.name,
        )
        for student in students
    ]


@router.get("/search", response_model=List[StudentResponse], summary="搜尋學生")
async def search_students(
    student_id: Optional[str] = Query(None),
    student_name: Optional[str] = Query(None),
    class_name: Optional[str] = Query(None),
    student_service: StudentService = Depends(get_student_service)
):
    """
    搜尋學生（按學號、姓名或班級）

    用於填寫申請表時快速查詢組員
    """
    students = await student_service.search_students(
        student_id=student_id,
        student_name=student_name,
        class_name=class_name
    )

    return [
        StudentResponse(
            id=str(student.id),
            student_id=student.student_id,
            class_name=student.class_name,
            seat_number=student.seat_number,
            name=student.name,
        )
        for student in students
    ]


@router.get("/{student_id}", response_model=StudentResponse, summary="獲取學生詳情")
async def get_student(
    student_id: str,
    student_service: StudentService = Depends(get_student_service)
):
    """
    透過學號獲取學生資訊
    """
    student = await student_service.get_student_by_id(student_id)

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="學生不存在"
        )

    return StudentResponse(
        id=str(student.id),
        student_id=student.student_id,
        class_name=student.class_name,
        seat_number=student.seat_number,
        name=student.name,
    )


@router.get("/class/{class_name}", response_model=List[StudentResponse], summary="獲取班級學生")
async def get_students_by_class(
    class_name: str,
    student_service: StudentService = Depends(get_student_service)
):
    """
    獲取指定班級的所有學生
    """
    students = await student_service.get_students_by_class(class_name)

    return [
        StudentResponse(
            id=str(student.id),
            student_id=student.student_id,
            class_name=student.class_name,
            seat_number=student.seat_number,
            name=student.name,
        )
        for student in students
    ]
