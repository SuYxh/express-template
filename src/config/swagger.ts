import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Template API',
      version: '1.0.0',
      description: 'Express + TypeScript + Prisma 模板项目 API 文档',
    },
    servers: [
      {
        url: config.serverUrl,
        description: config.env === 'production' ? '生产环境' : '开发环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '请输入 JWT Token',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123' },
            name: { type: 'string', example: '张三' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'test@example.com' },
            password: { type: 'string', example: 'Test123456' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', description: '刷新令牌' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            message: { type: 'string', example: '登录成功' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', description: '访问令牌' },
                refreshToken: { type: 'string', description: '刷新令牌' },
                expiresIn: { type: 'integer', example: 900, description: '有效期（秒）' },
              },
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
        ChatRequest: {
          type: 'object',
          required: ['messages'],
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                  content: { type: 'string' },
                },
              },
              example: [{ role: 'user', content: '你好' }],
            },
            model: { type: 'string', example: 'deepseek-chat' },
            temperature: { type: 'number', minimum: 0, maximum: 2, example: 0.7 },
            maxTokens: { type: 'integer', example: 2048 },
            systemPrompt: { type: 'string' },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            message: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                reply: { type: 'string', description: 'AI 回复内容' },
              },
            },
          },
        },
        FileInfo: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: '1234567890-123456789.png' },
            originalname: { type: 'string', example: 'avatar.png' },
            mimetype: { type: 'string', example: 'image/png' },
            size: { type: 'integer', example: 12345 },
            url: { type: 'string', example: 'http://localhost:3000/uploads/xxx.png' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            message: { type: 'string', example: 'success' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 1001 },
            message: { type: 'string', example: '参数错误' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '认证相关接口' },
      { name: 'Upload', description: '文件上传接口' },
      { name: 'Chat', description: 'AI 对话接口' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
