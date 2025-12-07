# 自主学习计划申请系统 - 项目总览

## 📋 项目简介

臺北市立復興高級中學 自主学习计划申请系统，包含前端和后端两部分。

- **前端**: React 19 + TypeScript + Vite
- **后端**: FastAPI + MongoDB
- **部署**: Docker + Docker Compose

## 📁 项目结构

```
self-learn-system/
├── frontend/                   # 前端项目（React）
│   ├── components/             # React 组件
│   ├── App.tsx                 # 主应用组件
│   ├── types.ts                # TypeScript 类型定义
│   ├── index.html
│   ├── index.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # 后端项目（FastAPI）
│   ├── app/                    # 应用代码
│   │   ├── models/             # 数据模型
│   │   ├── routes/             # API 路由
│   │   ├── services/           # 业务逻辑
│   │   ├── database/           # 数据库连接
│   │   ├── utils/              # 工具函数
│   │   ├── main.py             # 主应用
│   │   ├── config.py           # 配置
│   │   └── dependencies.py     # 依赖注入
│   ├── scripts/                # 脚本工具
│   │   └── import_students.py  # 导入学生数据
│   ├── requirements.txt        # Python 依赖
│   ├── Dockerfile              # Docker 镜像
│   ├── docker-compose.yml      # Docker Compose 配置
│   └── README.md               # 后端文档
│
├── 114-1全校名單.xlsx          # 学生名单数据
└── PROJECT_OVERVIEW.md         # 本文件
```

## 🚀 一键启动（Docker）

### 启动后端服务

```bash
cd backend
docker-compose up -d
```

这将启动：
- MongoDB 数据库（端口 27017）
- FastAPI 后端服务（端口 8000）

### 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

## 📊 数据库设计

### Collections（集合）

1. **users** - 用户集合
    - 包含学生和教师用户
    - 字段: username, password, role, student_id, teacher_name, etc.

2. **students** - 学生名单集合
    - 从 Excel 文件导入的全校学生数据
    - 字段: student_id, class_name, seat_number, name

3. **applications** - 申请表集合
    - 学生提交的自主学习计划申请
    - 字段: title, members, motivation, plan_items, status, etc.

## 🔧 开发流程

### 1. 导入学生数据

```bash
cd backend
python scripts/import_students.py ../114-1全校名單.xlsx
```

### 2. 创建测试账号

使用 API 创建学生和教师测试账号：

```bash
# 创建学生账号
curl -X POST "http://localhost:8000/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "11430001",
        "password": "student123",
        "role": "student",
        "student_id": "11430001",
        "student_name": "张三",
        "class_name": "101",
        "seat_number": 1
    }'

# 创建教师账号
curl -X POST "http://localhost:8000/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "teacher001",
        "password": "teacher123",
        "role": "teacher",
        "teacher_name": "李老师"
    }'
```

### 3. 前端连接后端

前端代码需要更新以连接到后端 API（http://localhost:8000）。

## 📚 API 文档

启动后端后，访问：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 认证流程

1. 用户通过 `/auth/login` 登录
2. 后端返回 JWT token
3. 前端在后续请求中携带 token：`Authorization: Bearer <token>`
4. 后端验证 token 并返回数据

## 📝 功能清单

### 已实现（后端）

- ✅ 用户认证（学生/教师登录）
- ✅ 申请表 CRUD 操作
- ✅ 学生名单查询
- ✅ 教师审核功能
- ✅ JWT 认证
- ✅ MongoDB 数据库集成
- ✅ Docker 容器化部署
- ✅ 预留老师 MongoDB SDK 接口

### 已实现（前端）

- ✅ 登录页面
- ✅ 申请表填写页面
- ✅ 历史记录页面
- ✅ 签名组件
- ✅ 表单验证

### 待实现

- [ ] 前端连接后端 API
- [ ] 文件上传（签章图片）
- [ ] PDF 导出功能
- [ ] 集成老师的 MongoDB SDK
- [ ] 单元测试
- [ ] 生产环境部署配置

## 🛠️ 老师 MongoDB SDK 集成

当老师提供 SDK 后，需要修改：

1. `backend/app/database/mongodb.py`
    - 替换 `MongoDBClient` 类的实现
    - 文件中已包含详细的集成说明和示例代码

2. `backend/requirements.txt`
    - 添加老师 SDK 的依赖

详细说明请查看 `backend/app/database/mongodb.py` 文件中的注释。

## 📋 数据格式说明

### 学生名单 Excel 格式

| 学号 | 班级 | 座号 | 姓名 |
|------|------|------|------|
| 11430001 | 101 | 1 | 张三 |
| 11430002 | 101 | 2 | 李四 |

### 申请表数据结构

参见 `backend/app/models/application.py` 中的 `Application` 模型。

## 🐛 常见问题

### Q: 如何重置数据库？
```bash
docker-compose down -v  # 删除所有数据卷
docker-compose up -d    # 重新启动
```

### Q: 如何查看 MongoDB 数据？
```bash
# 进入 MongoDB 容器
docker exec -it self-learning-mongodb mongosh

# 使用数据库
use self_learning_system

# 查看集合
show collections

# 查询数据
db.users.find()
db.students.find()
db.applications.find()
```

### Q: 后端 API 无法访问？
检查：
1. Docker 容器是否正常运行：`docker-compose ps`
2. 端口 8000 是否被占用：`lsof -i :8000`
3. 查看日志：`docker-compose logs -f backend`

## 📄 代码规范

- **Python**: 使用四个空格缩进，遵循 PEP 8
- **TypeScript**: 使用两个空格缩进（前端现有规范）
- **命名**: 清晰的变量和函数命名，使用中文注释

## 🎯 下一步计划

1. **前端对接后端 API**
    - 替换前端的 mock 数据
    - 实现真实的登录和数据提交

2. **文件上传功能**
    - 签章图片上传
    - 存储到服务器或云存储

3. **PDF 导出**
    - 将申请表导出为 PDF 格式

4. **生产部署**
    - 配置 HTTPS
    - 设置环境变量
    - 数据备份策略

## 📞 联系方式

如有问题，请联系开发团队。

---

**注意**:
- 后端所有代码使用四个空格缩进
- 已为老师的 MongoDB SDK 预留集成接口
- Docker 配置已完成，可一键部署
