"""
學生服務層 - 使用 Beanie ODM
"""
from typing import List, Optional
from ..models.student import Student


class StudentService:
    """學生服務 - 使用 Beanie ODM"""

    async def create_student(self, student: Student) -> Student:
        """
        建立學生記錄

        Args:
            student: 學生資料

        Returns:
            Student: 建立的學生
        """
        await student.insert()
        return student

    async def bulk_create_students(self, students: List[Student]) -> int:
        """
        批次建立學生記錄

        Args:
            students: 學生列表

        Returns:
            int: 插入的數量
        """
        if not students:
            return 0

        await Student.insert_many(students)
        return len(students)

    async def get_student_by_id(self, student_id: str) -> Optional[Student]:
        """
        透過學號獲取學生

        Args:
            student_id: 學號

        Returns:
            Optional[Student]: 學生物件，不存在返回 None
        """
        return await Student.find_one(Student.student_id == student_id)

    async def get_students_by_class(self, class_name: str) -> List[Student]:
        """
        獲取指定班級的所有學生

        Args:
            class_name: 班級名稱

        Returns:
            List[Student]: 學生列表
        """
        students = await Student.find(
            Student.class_name == class_name
        ).sort(Student.seat_number).to_list()
        return students

    async def get_all_students(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Student]:
        """
        獲取所有學生

        Args:
            skip: 跳過數量
            limit: 限制數量

        Returns:
            List[Student]: 學生列表
        """
        students = await Student.find().skip(skip).limit(limit).to_list()
        return students

    async def search_students(
        self,
        student_id: Optional[str] = None,
        student_name: Optional[str] = None,
        class_name: Optional[str] = None
    ) -> List[Student]:
        """
        搜尋學生

        Args:
            student_id: 學號（模糊搜尋）
            student_name: 姓名（模糊搜尋）
            class_name: 班級（精確匹配）

        Returns:
            List[Student]: 匹配的學生列表
        """
        query = Student.find()

        if student_id:
            query = query.find(Student.student_id == student_id)

        if student_name:
            # Beanie 支援正規表示式查詢
            import re
            query = query.find({"name": {"$regex": re.escape(student_name), "$options": "i"}})

        if class_name:
            query = query.find(Student.class_name == class_name)

        students = await query.to_list()
        return students

    async def count_students(self) -> int:
        """
        統計學生總數

        Returns:
            int: 學生數量
        """
        return await Student.find().count()

    async def clear_all_students(self) -> int:
        """
        清空所有學生記錄（用於重新匯入）

        Returns:
            int: 刪除的數量
        """
        result = await Student.find().delete()
        return result.deleted_count if result else 0
