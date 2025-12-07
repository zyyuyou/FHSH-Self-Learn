# ==================== 階段 1: 構建前端 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 複製package files
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製源代碼
COPY . .

# 構建生產版本
RUN npm run build

# ==================== 階段 2: Nginx 服務 ====================
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從構建階段複製構建好的靜態文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 3000

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
