# Express + TypeScript + Prisma 模板

一个开箱即用的 Express 后端项目模板，集成了常用的基础设施。

## 技术栈

- **框架**: Express ^4.x
- **语言**: TypeScript ^5.x
- **ORM**: Prisma ^5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis ^7.x
- **认证**: JWT
- **校验**: Zod
- **日志**: Winston

## 内置功能

- ✅ JWT 认证（access token + refresh token）
- ✅ 统一响应格式
- ✅ 全局错误处理
- ✅ 请求参数校验（Zod）
- ✅ 请求限流中间件
- ✅ 文件上传中间件
- ✅ 日志系统（Winston）
- ✅ 健康检查接口
- ✅ Docker 支持

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 7.0.0
- MySQL 8.x
- Redis

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库等信息。

### 3. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送 Schema 到数据库
pnpm prisma:push

# 或使用迁移（生产环境推荐）
pnpm prisma:migrate
```

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm dev

# 生产模式
pnpm start
```

服务启动后访问：http://localhost:3000

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式启动（热重载） |
| `pnpm build` | 编译 TypeScript |
| `pnpm start` | 生产模式启动 |
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm prisma:migrate` | 执行数据库迁移 |
| `pnpm prisma:push` | 推送 Schema 到数据库 |
| `pnpm prisma:studio` | 打开数据库可视化工具 |
| `pnpm typecheck` | 类型检查 |

## 项目结构

```
express-template/
├── prisma/
│   └── schema.prisma          # 数据库模型
├── src/
│   ├── app.ts                 # 应用入口
│   ├── config/                # 配置文件
│   │   ├── index.ts           # 环境配置
│   │   ├── database.ts        # 数据库连接
│   │   └── redis.ts           # Redis 连接
│   ├── controllers/           # 控制器
│   │   └── auth.controller.ts # 示例：认证控制器
│   ├── middlewares/           # 中间件
│   │   ├── auth.middleware.ts # JWT 认证
│   │   ├── error.middleware.ts# 错误处理
│   │   ├── validate.middleware.ts # 参数校验
│   │   ├── rateLimit.middleware.ts # 请求限流
│   │   └── upload.middleware.ts # 文件上传
│   ├── routes/                # 路由
│   │   ├── index.ts
│   │   └── auth.routes.ts     # 示例：认证路由
│   ├── services/              # 业务逻辑
│   │   └── auth.service.ts    # 示例：认证服务
│   ├── types/                 # 类型定义
│   │   └── express.d.ts
│   ├── utils/                 # 工具函数
│   │   ├── logger.ts          # 日志
│   │   ├── response.ts        # 统一响应
│   │   ├── token.ts           # JWT 工具
│   │   └── password.ts        # 密码工具
│   └── validators/            # 参数校验
│       └── auth.validator.ts  # 示例：认证校验
├── uploads/                   # 上传文件目录
├── templates/                 # 模板目录
├── logs/                      # 日志目录
├── .env.example               # 环境变量模板
├── package.json
└── tsconfig.json
```

## API 示例

### 健康检查

```
GET /health
```

### 认证接口

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/refresh` | POST | 刷新 Token |
| `/api/v1/auth/logout` | POST | 退出登录 |

## 如何添加新功能

### 1. 添加新模型

编辑 `prisma/schema.prisma`，然后运行：

```bash
pnpm prisma:push  # 开发环境
# 或
pnpm prisma:migrate  # 生产环境
```

### 2. 添加新路由

1. 创建 `src/validators/xxx.validator.ts` - 参数校验
2. 创建 `src/services/xxx.service.ts` - 业务逻辑
3. 创建 `src/controllers/xxx.controller.ts` - 控制器
4. 创建 `src/routes/xxx.routes.ts` - 路由定义
5. 在 `src/routes/index.ts` 中注册路由

## 统一响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 分页响应
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}

// 错误响应
{
  "code": 1001,
  "message": "参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ]
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1000 | 请求错误 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | 禁止访问 |
| 1004 | 资源不存在 |
| 1005 | 资源已存在 |
| 1006 | 请求过于频繁 |
| 5000 | 服务器错误 |

## License

ISC
