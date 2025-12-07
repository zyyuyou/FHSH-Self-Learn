"""
匯入學生名單資料到 MongoDB，並自動建立學生賬號

使用方法:
    python scripts/import_students.py path/to/114-1全校名單.xlsx
"""
import sys
import asyncio
from pathlib import Path
import pandas as pd

# 新增父目錄到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import mongodb_client
from app.models import Student, User
from app.utils.auth import get_password_hash


async def import_students_from_excel(excel_path: str):
    """
    從 Excel 檔案匯入學生資料

    Args:
        excel_path: Excel 檔案路徑
    """
    print(f"📖 讀取 Excel 檔案: {excel_path}")

    # 讀取 Excel 檔案
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"❌ 讀取 Excel 檔案失敗: {e}")
        return

    print(f"✅ 成功讀取 {len(df)} 條學生記錄")
    print(f"📊 資料列: {df.columns.tolist()}")

    # 連線資料庫
    await mongodb_client.connect_db()

    # 清空現有資料（自動清空以便測試）
    print("\n🗑️  清空現有學生資料...")
    count = await Student.delete_all()
    print(f"🗑️  已刪除 {count.deleted_count if count else 0} 條現有記錄")

    # 轉換資料並匯入
    students = []
    for _, row in df.iterrows():
        student = Student(
            student_id=str(row['學號']),
            class_name=str(row['班級']),
            seat_number=int(row['座號']),
            name=str(row['姓名'])
        )
        students.append(student)

    # 批次匯入
    print(f"\n📝 開始匯入學生資料...")
    await Student.insert_many(students)
    count = len(students)
    print(f"✅ 成功匯入 {count} 條學生記錄")

    # 驗證匯入
    total = await Student.count()
    print(f"📊 資料庫中共有 {total} 條學生記錄")

    # 為所有學生建立使用者賬號
    print(f"\n👤 開始建立學生使用者賬號...")
    users = []
    total = len(df)

    for idx, row in enumerate(df.iterrows(), 1):
        _, row_data = row
        student_id = str(row_data['學號'])
        username = f"{student_id}@fhsh.tp.edu.tw"

        # 顯示進度
        if idx % 100 == 0 or idx == total:
            print(f"   處理進度: {idx}/{total} ({idx*100//total}%)")

        user = User(
            username=username,
            hashed_password=get_password_hash(student_id),
            role="student",
            student_id=student_id,
            student_name=str(row_data['姓名']),
            class_name=str(row_data['班級']),
            seat_number=int(row_data['座號'])
        )
        users.append(user)

    # 批次建立使用者
    print(f"💾 寫入資料庫...")
    await User.insert_many(users)
    print(f"✅ 成功建立 {len(users)} 個學生賬號")
    print(f"📧 賬號格式: {{學號}}@fhsh.tp.edu.tw")
    print(f"🔑 密碼: {{學號}}")

    # 建立預設教師賬號
    print(f"\n👨‍🏫 建立預設教師賬號...")
    teacher = User(
        username="fhshbook@fhsh.tp.edu.tw",
        hashed_password=get_password_hash("fhshbook"),
        role="teacher",
        teacher_name="圖書館",
        teacher_title="預設帳號"
    )
    await teacher.insert()
    print(f"✅ 成功建立預設教師賬號")
    print(f"📧 教師賬號: fhshbook@fhsh.tp.edu.tw")
    print(f"🔑 教師密碼: fhshbook")

    # 關閉資料庫連線
    await mongodb_client.close_db()
    print("\n✨ 匯入完成！")


async def main():
    """主函式"""
    if len(sys.argv) < 2:
        print("使用方法: python scripts/import_students.py <excel_file_path>")
        print("示例: python scripts/import_students.py ../114-1全校名單.xlsx")
        sys.exit(1)

    excel_path = sys.argv[1]
    if not Path(excel_path).exists():
        print(f"❌ 檔案不存在: {excel_path}")
        sys.exit(1)

    await import_students_from_excel(excel_path)


if __name__ == "__main__":
    asyncio.run(main())
