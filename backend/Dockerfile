# 使用官方 Python 3.11 映象作為基礎映象
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 設定環境變數
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 安裝系統依賴（包含 LibreOffice 用於 PDF 轉換）
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libreoffice \
    libreoffice-writer \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴檔案
COPY backend/requirements.txt .

# 安裝 Python 依賴
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 複製應用程式碼
COPY backend/ .

# 複製學生名單檔案到容器根目錄
COPY ["114-1全校名單.xlsx", "/114-1全校名單.xlsx"]

# 建立上傳目錄和臨時目錄
RUN mkdir -p uploads temp templates

# 複製 Word 模板檔案
COPY ["附件一 復興自主學習申請表-新版.docx", "/app/templates/application_template.docx"]

# 設定啟動指令碼許可權
RUN chmod +x /app/entrypoint.sh

# 暴露埠
EXPOSE 8000

# 使用啟動指令碼
ENTRYPOINT ["/app/entrypoint.sh"]
