# RBAC 权限管理系统

本项目实现了基于角色的访问控制（Role-Based Access Control，RBAC）权限管理系统。

## 目录

- [数据模型](#数据模型)
- [角色体系](#角色体系)
- [权限清单](#权限清单)
- [API 接口](#api-接口)
- [使用示例](#使用示例)
- [中间件说明](#中间件说明)
- [扩展指南](#扩展指南)

---

## 数据模型

### ER 关系图

```
┌──────────┐       ┌───────────┐       ┌──────────┐
│   User   │──M:N──│ UserRole  │──M:N──│   Role   │
└──────────┘       └───────────┘       └──────────┘
                                            │
                                           M:N
                                            │
                                   ┌────────────────┐
                                   │ RolePermission │
                                   └────────────────┘
                                            │
                                           M:N
                                            │
                                     ┌────────────┐
                                     │ Permission │
                                     └────────────┘
```

### 数据表说明

| 表名 | 说明 |
|-----|------|
| `User` | 用户表 |
| `Role` | 角色表 |
| `Permission` | 权限表 |
| `UserRole` | 用户-角色关联表（多对多） |
| `RolePermission` | 角色-权限关联表（多对多） |

### Prisma Schema

```prisma
model Role {
  id          Int              @id @default(autoincrement())
  name        String           @unique @db.VarChar(50)
  code        String           @unique @db.VarChar(50)
  description String?          @db.VarChar(200)
  isSystem    Boolean          @default(false) @map("is_system")
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
  users       UserRole[]
  permissions RolePermission[]
  @@map("roles")
}

model Permission {
  id        Int              @id @default(autoincrement())
  name      String           @db.VarChar(50)
  code      String           @unique @db.VarChar(100)
  module    String           @db.VarChar(50)
  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")
  roles     RolePermission[]
  @@map("permissions")
}

model UserRole {
  userId    Int      @map("user_id")
  roleId    Int      @map("role_id")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@map("user_roles")
}

model RolePermission {
  roleId       Int        @map("role_id")
  permissionId Int        @map("permission_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
  @@map("role_permissions")
}
```

---

## 角色体系

系统预置 7 个角色，按权限从高到低排列：

| 角色代码 | 角色名称 | 描述 | 系统角色 |
|---------|---------|------|:-------:|
| `super_admin` | 超级管理员 | 拥有系统所有权限 | ✅ |
| `admin` | 管理员 | 拥有大部分管理权限 | ✅ |
| `developer` | 开发者 | API 开发者，可创建和管理 API Key | ✅ |
| `pro` | Pro 用户 | 高级付费用户，享有更多配额和高级模型 | ❌ |
| `plus` | Plus 用户 | 基础付费用户，享有更多配额 | ❌ |
| `user` | 普通用户 | 免费用户，基础功能 | ✅ |
| `guest` | 访客 | 试用体验，有限功能 | ✅ |

> **系统角色**：`isSystem = true` 的角色为系统内置角色，不可删除。

### 角色权限对比

| 权限 | 超管 | 管理 | 开发 | Pro | Plus | 普通 | 访客 |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 用户查看 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 用户创建 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 用户编辑 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 用户删除 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 角色查看 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 角色创建 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 角色编辑 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 角色删除 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 权限查看 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 权限分配 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 上传图片 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 上传文件 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 删除文件 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI 对话 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建 API Key | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 管理 API Key | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 基础模型 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 高级模型 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 无限配额 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 优先队列 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 权限清单

系统共有 20 个权限，按模块分组：

### 用户管理 (user)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `user:read` | 查看用户 | 查看用户列表和详情 |
| `user:create` | 创建用户 | 创建新用户 |
| `user:update` | 编辑用户 | 修改用户信息 |
| `user:delete` | 删除用户 | 删除用户 |

### 角色管理 (role)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `role:read` | 查看角色 | 查看角色列表和详情 |
| `role:create` | 创建角色 | 创建新角色 |
| `role:update` | 编辑角色 | 修改角色信息 |
| `role:delete` | 删除角色 | 删除角色（系统角色不可删除） |

### 权限管理 (permission)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `permission:read` | 查看权限 | 查看权限列表 |
| `permission:assign` | 分配权限 | 为角色分配权限 |

### 文件上传 (upload)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `upload:image` | 上传图片 | 上传图片文件 |
| `upload:file` | 上传文件 | 上传普通文件 |
| `upload:delete` | 删除文件 | 删除已上传的文件 |

### AI 对话 (chat)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `chat:use` | 使用 AI 对话 | 使用 AI 对话功能 |

### API 管理 (api)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `api:key:create` | 创建 API Key | 创建 API 访问密钥 |
| `api:key:manage` | 管理 API Key | 查看、编辑、删除 API Key |

### 模型访问 (model)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `model:basic` | 基础模型访问 | 使用基础 AI 模型（如 GPT-3.5） |
| `model:advanced` | 高级模型访问 | 使用高级 AI 模型（如 GPT-4） |

### 配额管理 (quota)

| 权限码 | 名称 | 说明 |
|-------|------|------|
| `quota:unlimited` | 无限配额 | 不受调用次数限制 |
| `queue:priority` | 优先队列 | 请求优先处理 |

---

## API 接口

### 角色管理

#### 获取角色列表

```http
GET /api/roles
Authorization: Bearer <token>
```

**需要权限**: `role:read`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "超级管理员",
      "code": "super_admin",
      "description": "拥有系统所有权限",
      "isSystem": true,
      "permissions": [
        { "id": 1, "code": "user:read", "name": "查看用户" }
      ]
    }
  ]
}
```

#### 获取角色详情

```http
GET /api/roles/:id
Authorization: Bearer <token>
```

**需要权限**: `role:read`

#### 创建角色

```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "自定义角色",
  "code": "custom_role",
  "description": "角色描述",
  "permissionIds": [1, 2, 3]
}
```

**需要权限**: `role:create`

#### 更新角色

```http
PUT /api/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名称",
  "description": "新描述",
  "permissionIds": [1, 2, 3, 4]
}
```

**需要权限**: `role:update`

#### 删除角色

```http
DELETE /api/roles/:id
Authorization: Bearer <token>
```

**需要权限**: `role:delete`

> ⚠️ 系统角色（`isSystem = true`）不可删除

#### 为用户分配角色

```http
POST /api/roles/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "roleIds": [1, 2]
}
```

**需要权限**: `permission:assign`

### 权限管理

#### 获取权限列表

```http
GET /api/roles/permissions
Authorization: Bearer <token>
```

**需要权限**: `permission:read`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "查看用户",
      "code": "user:read",
      "module": "user"
    }
  ]
}
```

---

## 使用示例

### 路由权限保护

```typescript
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { requirePermission, requireRole } from '@/middlewares/permission.middleware';
import { PERMISSIONS } from '@/config/permissions';

const router = Router();

// 需要登录
router.get('/profile', authenticate, getProfile);

// 需要特定权限
router.get('/users', authenticate, requirePermission(PERMISSIONS.USER_READ), getUsers);

// 需要多个权限之一（OR 关系）
router.post(
  '/upload',
  authenticate,
  requirePermission(PERMISSIONS.UPLOAD_IMAGE, PERMISSIONS.UPLOAD_FILE),
  uploadFile
);

// 需要特定角色
router.get('/admin/dashboard', authenticate, requireRole('admin', 'super_admin'), getDashboard);
```

### 在控制器中检查权限

```typescript
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export const someController = (req: AuthenticatedRequest, res: Response) => {
  // 获取当前用户的角色和权限
  const { roles, permissions } = req.user!;

  // 检查是否有特定权限
  if (permissions.includes('model:advanced')) {
    // 使用高级模型
  }

  // 检查是否是特定角色
  if (roles.includes('pro')) {
    // Pro 用户专属功能
  }
};
```

### JWT Token 结构

登录成功后，Token 中包含用户的角色和权限信息：

```typescript
interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];      // ['user', 'pro']
  permissions: string[]; // ['chat:use', 'model:basic', 'model:advanced']
}
```

---

## 中间件说明

### authenticate

认证中间件，验证 JWT Token 并将用户信息注入 `req.user`。

```typescript
// src/middlewares/auth.middleware.ts
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req, res, next) => {
  // 验证 Token 并注入 req.user
};
```

### requirePermission

权限检查中间件，验证用户是否拥有指定权限之一。

```typescript
// src/middlewares/permission.middleware.ts
export const requirePermission = (...permissions: PermissionCode[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));
    if (!hasPermission) {
      return error(res, ErrorCode.FORBIDDEN, '无操作权限');
    }
    next();
  };
};
```

### requireRole

角色检查中间件，验证用户是否拥有指定角色之一。

```typescript
// src/middlewares/permission.middleware.ts
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return error(res, ErrorCode.FORBIDDEN, '无操作权限');
    }
    next();
  };
};
```

---

## 扩展指南

### 添加新权限

1. 在 `src/config/permissions.ts` 中添加权限常量和列表项：

```typescript
export const PERMISSIONS = {
  // ... 现有权限
  NEW_PERMISSION: 'module:action',
} as const;

export const PERMISSION_LIST = [
  // ... 现有权限
  { code: 'module:action', name: '新权限名称', module: 'module' },
];
```

2. 为角色分配新权限（修改 `DEFAULT_ROLES`）

3. 重新运行 seed：

```bash
pnpm prisma:seed
```

### 添加新角色

1. 在 `src/config/permissions.ts` 的 `DEFAULT_ROLES` 数组中添加：

```typescript
export const DEFAULT_ROLES = [
  // ... 现有角色
  {
    code: 'new_role',
    name: '新角色',
    description: '角色描述',
    isSystem: false,
    permissions: ['permission:code1', 'permission:code2'],
  },
];
```

2. 重新运行 seed：

```bash
pnpm prisma:seed
```

### 动态管理角色和权限

除了通过配置文件初始化外，也可以通过 API 动态管理：

- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色权限
- `POST /api/roles/assign` - 为用户分配角色

---

## 测试账号

所有测试账号密码统一为：`Test123456`

| 邮箱 | 昵称 | 角色 |
|-----|------|------|
| superadmin1@example.com | 超级管理员1 | 超级管理员 |
| superadmin2@example.com | 超级管理员2 | 超级管理员 |
| admin1@example.com | 管理员1 | 管理员 |
| admin2@example.com | 管理员2 | 管理员 |
| developer1@example.com | 开发者1 | 开发者 |
| developer2@example.com | 开发者2 | 开发者 |
| pro1@example.com | Pro用户1 | Pro 用户 |
| pro2@example.com | Pro用户2 | Pro 用户 |
| plus1@example.com | Plus用户1 | Plus 用户 |
| plus2@example.com | Plus用户2 | Plus 用户 |
| user1@example.com | 普通用户1 | 普通用户 |
| user2@example.com | 普通用户2 | 普通用户 |
| guest1@example.com | 访客1 | 访客 |
| guest2@example.com | 访客2 | 访客 |

---

## 相关文件

```
src/
├── config/
│   └── permissions.ts       # 权限和角色定义
├── middlewares/
│   ├── auth.middleware.ts   # 认证中间件
│   └── permission.middleware.ts  # 权限检查中间件
├── services/
│   ├── auth.service.ts      # 认证服务（含权限加载）
│   └── role.service.ts      # 角色管理服务
├── routes/
│   └── role.routes.ts       # 角色管理路由
└── utils/
    └── token.ts             # Token 工具（含 payload 类型）

prisma/
├── schema.prisma            # 数据模型定义
└── seed.ts                  # 数据初始化脚本
```
