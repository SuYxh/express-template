# Express + TypeScript + Prisma 模板

一个开箱即用的 Express 后端项目模板，集成了常用的基础设施。

## 技术栈

- **框架**: Express ^4.x
- **语言**: TypeScript ^5.x
- **ORM**: Prisma ^5.x
- **数据库**: MySQL 8.x
- **缓存**: Redis ^7.x（可选，不可用时自动降级）
- **认证**: JWT（access token + refresh token）
- **校验**: Zod
- **日志**: Winston
- **LLM**: OpenAI SDK（支持 DeepSeek 等兼容接口）
- **实时通信**: WebSocket (ws)
- **API 文档**: Scalar + swagger-jsdoc

## 内置功能

### 🔐 认证授权
- JWT 双 Token 机制（access token + refresh token）
- 密码加密（bcrypt）
- Token 黑名单（Redis / 内存）

### 🌐 API 能力
- RESTful API 设计
- 统一响应格式
- 全局错误处理
- 请求参数校验（Zod）

### 🛡️ 安全防护
- 请求限流中间件（express-rate-limit + Redis）
- Helmet 安全头
- CORS 跨域配置

### 📁 文件处理
- 图片上传（支持 JPG/PNG/GIF/WebP）
- 文件上传（支持 PDF/Word/Excel/TXT/JSON）
- 静态资源服务

### 🤖 AI 能力
- LLM 对话接口（普通/流式）
- 支持 DeepSeek、OpenAI 等兼容接口
- SSE 流式响应

### 🔌 实时通信
- WebSocket 服务（ws 库）
- JWT 认证
- 心跳检测
- 用户连接管理
- 消息推送（单用户/广播）

### 📝 开发工具
- 日志系统（Winston，按日期分割）
- 健康检查接口
- Docker 支持
- PM2 生产部署配置

### 📖 API 文档
- Scalar（现代美观的 API 文档 UI）
- OpenAPI 3.0 规范
- 支持在线测试接口

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 7.0.0
- MySQL 8.x
- Redis（可选）

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

服务启动后访问：
- 服务地址：http://localhost:3000
- API 文档：http://localhost:3000/docs

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
│   └── schema.prisma           # 数据库模型
├── src/
│   ├── app.ts                  # 应用入口
│   ├── config/                 # 配置文件
│   │   ├── index.ts            # 环境配置
│   │   ├── database.ts         # 数据库连接
│   │   ├── redis.ts            # Redis 连接
│   │   └── swagger.ts          # API 文档配置
│   ├── controllers/            # 控制器
│   │   ├── auth.controller.ts  # 认证控制器
│   │   ├── upload.controller.ts# 上传控制器
│   │   └── chat.controller.ts  # AI 对话控制器
│   ├── middlewares/            # 中间件
│   │   ├── auth.middleware.ts  # JWT 认证
│   │   ├── error.middleware.ts # 错误处理
│   │   ├── validate.middleware.ts # 参数校验
│   │   ├── rateLimit.middleware.ts # 请求限流
│   │   └── upload.middleware.ts # 文件上传
│   ├── routes/                 # 路由
│   │   ├── index.ts
│   │   ├── auth.routes.ts      # 认证路由
│   │   ├── upload.routes.ts    # 上传路由
│   │   └── chat.routes.ts      # AI 对话路由
│   ├── services/               # 业务逻辑
│   │   ├── auth.service.ts     # 认证服务
│   │   ├── llm.service.ts      # LLM 服务
│   │   └── websocket.service.ts# WebSocket 服务
│   ├── types/                  # 类型定义
│   │   └── express.d.ts
│   ├── utils/                  # 工具函数
│   │   ├── logger.ts           # 日志
│   │   ├── response.ts         # 统一响应
│   │   ├── token.ts            # JWT 工具
│   │   └── password.ts         # 密码工具
│   └── validators/             # 参数校验
│       ├── auth.validator.ts   # 认证校验
│       └── chat.validator.ts   # 对话校验
├── public/                     # 静态资源
│   ├── chat.html               # AI 对话测试页面
│   ├── ws-test.html            # WebSocket 测试页面
│   └── ws-client.js            # WebSocket 客户端封装
├── uploads/                    # 上传文件目录
├── scripts/                    # 脚本
│   └── test-rate-limit.sh      # 限流测试脚本
├── logs/                       # 日志目录
├── .env.example                # 环境变量模板
├── ecosystem.config.cjs        # PM2 配置
├── package.json
└── tsconfig.json
```

## API 文档

### 在线文档（Scalar）

项目集成了 [Scalar](https://scalar.com/) 作为 API 文档 UI，提供现代美观的交互式文档。

| 地址 | 说明 |
|------|------|
| http://localhost:3000/docs | API 文档页面 |
| http://localhost:3000/openapi.json | OpenAPI JSON |

**功能特性**：
- 🎨 现代美观的紫色主题
- 🔐 支持 Bearer Token 认证测试
- 📝 完整的请求/响应示例
- 🏷️ 按模块分组（Auth、Upload、Chat）
- 🧪 可直接在页面上测试接口

**为新接口添加文档**：

在路由文件中添加 JSDoc 注释：

```typescript
/**
 * @openapi
 * /api/v1/xxx:
 *   post:
 *     tags: [TagName]
 *     summary: 接口名称
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/XxxRequest'
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/xxx', ...);
```

公共 Schema 定义在 `src/config/swagger.ts` 中，可通过 `$ref` 引用复用。

---

### 健康检查

```
GET /health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "websocket": "ok"
  }
}
```

### 认证接口

| 路由 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/v1/auth/register` | POST | 用户注册 | ❌ |
| `/api/v1/auth/login` | POST | 用户登录 | ❌ |
| `/api/v1/auth/refresh` | POST | 刷新 Token | ❌ |
| `/api/v1/auth/logout` | POST | 退出登录 | ✅ |

#### 注册
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "用户名"
}
```

#### 登录
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

响应：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### 上传接口

| 路由 | 方法 | 说明 | 字段名 | 限制 |
|------|------|------|--------|------|
| `/api/v1/upload/image` | POST | 上传单张图片 | `file` | 5MB |
| `/api/v1/upload/images` | POST | 上传多张图片 | `files` | 10张 |
| `/api/v1/upload/file` | POST | 上传单个文件 | `file` | 10MB |
| `/api/v1/upload/files` | POST | 上传多个文件 | `files` | 10个 |
| `/api/v1/upload/:filename` | DELETE | 删除文件 | - | - |

所有上传接口需要认证。

#### 上传示例
```bash
curl -X POST http://localhost:3000/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@./image.png"
```

响应：
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "filename": "1234567890-123456789.png",
    "originalname": "image.png",
    "mimetype": "image/png",
    "size": 12345,
    "url": "http://localhost:3000/uploads/1234567890-123456789.png"
  }
}
```

### AI 对话接口

| 路由 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/v1/chat` | POST | 普通对话 | ✅ |
| `/api/v1/chat/stream` | POST | 流式对话（SSE） | ✅ |

#### 请求参数
```json
{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "model": "deepseek-chat",
  "temperature": 0.7,
  "maxTokens": 2048,
  "systemPrompt": "你是一个助手"
}
```

#### 普通对话
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages": [{"role": "user", "content": "你好"}]}'
```

#### 流式对话
```bash
curl -X POST http://localhost:3000/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: text/event-stream" \
  -d '{"messages": [{"role": "user", "content": "你好"}]}'
```

流式响应格式：
```
data: {"content":"你"}
data: {"content":"好"}
data: {"content":"！"}
data: [DONE]
```

### WebSocket

#### 连接地址
```
ws://localhost:3000/ws?token=YOUR_JWT_TOKEN
```

#### 消息格式
```json
{"type": "消息类型", "data": {...}}
```

#### 内置消息类型
| 发送类型 | 返回类型 | 说明 |
|---------|---------|------|
| `ping` | `pong` | 心跳检测 |
| 其他 | `echo` | 原样返回 |

#### 服务端推送（在业务代码中使用）
```typescript
import { wsService } from './app';

// 推送给指定用户
wsService.sendToUser(userId, {
  type: 'task_complete',
  data: { taskId: '123', result: '...' }
});

// 广播给所有在线用户
wsService.broadcast({
  type: 'notification',
  data: { message: '系统公告' }
});

// 获取在线用户
const onlineUsers = wsService.getOnlineUsers();

// 判断用户是否在线
const isOnline = wsService.isUserOnline(userId);
```

#### 前端 WebSocket 客户端

项目提供封装好的客户端 `public/ws-client.js`：

```javascript
const ws = new WebSocketClient({
  url: 'ws://localhost:3000/ws',
  token: 'your-jwt-token',
  reconnect: true,              // 自动重连
  reconnectInterval: 3000,      // 重连间隔
  reconnectMaxAttempts: 10,     // 最大重连次数
  heartbeatInterval: 30000,     // 心跳间隔
  heartbeatTimeout: 10000,      // 心跳超时

  onOpen: () => console.log('已连接'),
  onClose: (event) => console.log('已断开'),
  onError: (error) => console.log('错误'),
  onMessage: (data) => console.log('收到消息', data),
  onReconnect: (attempts) => console.log(`重连中 ${attempts}`)
});

ws.connect();
ws.send({ type: 'test', data: { msg: 'hello' } });
ws.close();
```

### 限流测试接口

```
GET /api/v1/test/rate-limit
```

1 分钟最多 3 次请求，用于测试限流功能。

运行测试脚本：
```bash
./scripts/test-rate-limit.sh
```

## 测试页面

| 页面 | 地址 | 说明 |
|------|------|------|
| AI 对话测试 | http://localhost:3000/public/chat.html | 测试 AI 对话功能 |
| WebSocket 测试 | http://localhost:3000/public/ws-test.html | 测试 WebSocket 连接 |

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

## 环境变量

```bash
# 服务配置
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# 数据库
DATABASE_URL="mysql://user:password@host:port/database"

# Redis（可选，不配置则使用内存存储）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-jwt-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 跨域
CORS_ORIGIN=*

# 上传
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# LLM（OpenAI 兼容接口）
LLM_API_KEY=your-llm-api-key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat

# 日志
LOG_LEVEL=debug
```

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

## 生产部署

### 使用 PM2

```bash
# 构建
pnpm build

# 启动
pm2 start ecosystem.config.cjs

# 查看状态
pm2 list

# 零停机重启
pm2 reload ecosystem.config.cjs

# 停止
pm2 stop ecosystem.config.cjs
```

### 使用 Docker

```bash
# 构建镜像
docker build -t express-template .

# 运行容器
docker run -d -p 3000:3000 --env-file .env express-template
```

## License

ISC
