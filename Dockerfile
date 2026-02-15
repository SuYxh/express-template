# ================================
# 服务端 Dockerfile
# 多阶段构建，优化镜像大小
# ================================

# -------- 阶段1: 构建阶段 --------
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@7.33.7 --activate

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml ./

# 复制 prisma schema（生成 client 需要）
COPY prisma ./prisma/

# 安装所有依赖（包括 devDependencies，用于构建）
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client
RUN pnpm prisma:generate

# 复制源代码
COPY . .

# 构建 TypeScript
RUN pnpm build

# -------- 阶段2: 生产阶段 --------
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@7.33.7 --activate

# 设置环境变量
ENV NODE_ENV=production

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml ./

# 复制 prisma schema
COPY prisma ./prisma/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 生成 Prisma Client（生产环境也需要）
RUN pnpm prisma:generate

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 复制模板文件夹（如果有）
COPY templates ./templates

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/app.js"]
