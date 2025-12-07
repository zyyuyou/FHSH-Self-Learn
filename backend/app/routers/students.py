"""
學生資料查詢路由
"""
from fastapi import APIRouter, HTTPException
import pandas as pd
from pathlib import Path

router = APIRouter(prefix="/api/students", tags=["students"])

# 學生名單文件路徑
STUDENTS_FILE = Path("/app/students.xlsx")

# 加載學生名單到內存（啟動時加載一次）
students_df = None

def load_students():
    """加載學生名單"""
    global students_df
    if students_df is None:
        try:
            students_df = pd.read_excel(STUDENTS_FILE)
            # 轉換為字符串避免類型問題
            students_df['學號'] = students_df['學號'].astype(str)
            students_df['班級'] = students_df['班級'].astype(str)
            students_df['座號'] = students_df['座號'].astype(str)
            students_df['姓名'] = students_df['姓名'].astype(str)
        except Exception as e:
            print(f"載入學生名單失敗: {e}")
            students_df = pd.DataFrame()
    return students_df


@router.get("/{student_id}")
async def get_student_by_id(student_id: str):
    """
    根據學號查詢學生資料

    Args:
        student_id: 學號

    Returns:
        學生資料（班級、座號、姓名）
    """
    df = load_students()

    if df.empty:
        raise HTTPException(status_code=500, detail="學生名單未載入")

    # 查詢學生
    student = df[df['學號'] == student_id]

    if student.empty:
        raise HTTPException(status_code=404, detail="找不到該學號的學生")

    # 取第一筆（學號應該是唯一的）
    student_data = student.iloc[0]

    return {
        "student_id": student_data['學號'],
        "class_name": student_data['班級'],
        "seat_number": student_data['座號'],
        "name": student_data['姓名']
    }
