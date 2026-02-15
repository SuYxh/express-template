export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  PERMISSION_READ: 'permission:read',
  PERMISSION_ASSIGN: 'permission:assign',

  UPLOAD_IMAGE: 'upload:image',
  UPLOAD_FILE: 'upload:file',
  UPLOAD_DELETE: 'upload:delete',

  CHAT_USE: 'chat:use',

  API_KEY_CREATE: 'api:key:create',
  API_KEY_MANAGE: 'api:key:manage',

  MODEL_BASIC: 'model:basic',
  MODEL_ADVANCED: 'model:advanced',

  QUOTA_UNLIMITED: 'quota:unlimited',
  PRIORITY_QUEUE: 'queue:priority',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = [
  { code: 'user:read', name: '查看用户', module: 'user' },
  { code: 'user:create', name: '创建用户', module: 'user' },
  { code: 'user:update', name: '编辑用户', module: 'user' },
  { code: 'user:delete', name: '删除用户', module: 'user' },

  { code: 'role:read', name: '查看角色', module: 'role' },
  { code: 'role:create', name: '创建角色', module: 'role' },
  { code: 'role:update', name: '编辑角色', module: 'role' },
  { code: 'role:delete', name: '删除角色', module: 'role' },

  { code: 'permission:read', name: '查看权限', module: 'permission' },
  { code: 'permission:assign', name: '分配权限', module: 'permission' },

  { code: 'upload:image', name: '上传图片', module: 'upload' },
  { code: 'upload:file', name: '上传文件', module: 'upload' },
  { code: 'upload:delete', name: '删除文件', module: 'upload' },

  { code: 'chat:use', name: '使用 AI 对话', module: 'chat' },

  { code: 'api:key:create', name: '创建 API Key', module: 'api' },
  { code: 'api:key:manage', name: '管理 API Key', module: 'api' },

  { code: 'model:basic', name: '基础模型访问', module: 'model' },
  { code: 'model:advanced', name: '高级模型访问', module: 'model' },

  { code: 'quota:unlimited', name: '无限配额', module: 'quota' },
  { code: 'queue:priority', name: '优先队列', module: 'quota' },
];

export const DEFAULT_ROLES = [
  {
    code: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限',
    isSystem: true,
    permissions: PERMISSION_LIST.map((p) => p.code),
  },
  {
    code: 'admin',
    name: '管理员',
    description: '拥有大部分管理权限',
    isSystem: true,
    permissions: [
      'user:read',
      'user:create',
      'user:update',
      'role:read',
      'permission:read',
      'upload:image',
      'upload:file',
      'upload:delete',
      'chat:use',
      'model:basic',
      'model:advanced',
    ],
  },
  {
    code: 'developer',
    name: '开发者',
    description: 'API 开发者，可创建和管理 API Key',
    isSystem: true,
    permissions: [
      'api:key:create',
      'api:key:manage',
      'upload:image',
      'upload:file',
      'chat:use',
      'model:basic',
      'model:advanced',
    ],
  },
  {
    code: 'pro',
    name: 'Pro 用户',
    description: '高级付费用户，享有更多配额和高级模型',
    isSystem: false,
    permissions: [
      'upload:image',
      'upload:file',
      'chat:use',
      'model:basic',
      'model:advanced',
      'queue:priority',
    ],
  },
  {
    code: 'plus',
    name: 'Plus 用户',
    description: '基础付费用户，享有更多配额',
    isSystem: false,
    permissions: ['upload:image', 'upload:file', 'chat:use', 'model:basic', 'model:advanced'],
  },
  {
    code: 'user',
    name: '普通用户',
    description: '免费用户，基础功能',
    isSystem: true,
    permissions: ['upload:image', 'upload:file', 'chat:use', 'model:basic'],
  },
  {
    code: 'guest',
    name: '访客',
    description: '试用体验，有限功能',
    isSystem: true,
    permissions: ['chat:use', 'model:basic'],
  },
];
