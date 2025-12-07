#!/usr/bin/env python3
"""
縮排修正指令碼 - 將 2 空格縮排轉換為 4 空格
只修正行首的縮排，不影響字串內容

用法：
    python fix-indentation.py <file_path>
    python fix-indentation.py services/api.ts
"""

import sys
import os
import re
from pathlib import Path


def convert_indentation(file_path: str, dry_run: bool = False) -> bool:
    """
    轉換檔案的縮排從 2 空格到 4 空格

    Args:
        file_path: 要轉換的檔案路徑
        dry_run: 如果為 True，只顯示結果不實際修改

    Returns:
        True 如果成功，False 如果失敗
    """
    if not os.path.exists(file_path):
        print(f"❌ 檔案不存在: {file_path}")
        return False

    try:
        # 讀取檔案
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # 轉換每一行
        converted_lines = []
        changes = 0

        for line_no, line in enumerate(lines, 1):
            # 只處理行首的空格縮排
            # 匹配行首的空格（2的倍數）
            match = re.match(r'^( {2,})(.*)$', line)

            if match:
                indent = match.group(1)
                content = match.group(2)

                # 計算當前縮排級別（2空格為單位）
                indent_level = len(indent) // 2

                # 轉換為 4 空格縮排
                new_indent = '    ' * indent_level

                # 如果有變化才記錄
                if new_indent != indent:
                    changes += 1
                    if dry_run and changes <= 5:  # 只顯示前5個變化
                        print(f"  行 {line_no}: {len(indent)}空格 -> {len(new_indent)}空格")

                new_line = new_indent + content
                converted_lines.append(new_line)
            else:
                # 沒有縮排或縮排不是2的倍數，保持原樣
                converted_lines.append(line)

        if changes == 0:
            print(f"✅ {file_path}: 已經使用 4 空格縮排")
            return True

        print(f"📝 {file_path}: 發現 {changes} 行需要轉換")

        if dry_run:
            print("   (預覽模式，未實際修改檔案)")
            return True

        # 備份原檔案
        backup_path = file_path + '.bak'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        # 寫入轉換後的內容
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(converted_lines)

        print(f"✅ 轉換完成！備份檔案: {backup_path}")
        return True

    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        return False


def main():
    """主函式"""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    file_path = sys.argv[1]
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv

    print("="* 60)
    print("  縮排修正工具 - 2空格 → 4空格")
    print("="* 60)
    print()

    if dry_run:
        print("⚠️  預覽模式（不會實際修改檔案）")
        print()

    success = convert_indentation(file_path, dry_run=dry_run)

    if success:
        print()
        print("提示：如果結果正確，可以刪除 .bak 備份檔案")
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
