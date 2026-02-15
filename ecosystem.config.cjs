/**
 * PM2 配置文件
 * 
 * 使用方法：
 *   pm2 start ecosystem.config.cjs        # 启动应用
 *   pm2 reload ecosystem.config.cjs       # 零停机重启
 *   pm2 stop ecosystem.config.cjs         # 停止应用
 *   pm2 delete ecosystem.config.cjs       # 删除应用
 * 
 * 注意：
 *   - 文件使用 .cjs 扩展名是因为 PM2 需要 CommonJS 格式
 *   - 环境变量从 .env 文件读取，此文件只配置 PM2 相关参数
 */

module.exports = {
  apps: [
    {
      // 应用名称，在 pm2 list 中显示
      name: 'express-app',

      // 入口文件（构建后的 JS 文件）
      script: 'dist/app.js',

      // 实例数量
      // 'max' - 使用所有 CPU 核心
      // 数字 - 指定实例数量，如 2
      // 建议生产环境使用 'max' 或 CPU 核心数
      instances: 'max',

      // 执行模式
      // 'cluster' - 集群模式，可以利用多核 CPU，推荐生产环境使用
      // 'fork' - 单进程模式，适合开发调试
      exec_mode: 'cluster',

      // 自动重启
      // 当应用崩溃时自动重启
      autorestart: true,

      // 监听文件变化
      // 生产环境建议设为 false
      // 开发环境可以设为 true，文件变化时自动重启
      watch: false,

      // 内存限制
      // 当内存超过此值时自动重启
      // 可以防止内存泄漏导致的问题
      max_memory_restart: '1G',

      // 环境变量
      // 这里只设置 NODE_ENV，其他变量从 .env 文件读取
      env: {
        NODE_ENV: 'production',
      },

      // 开发环境变量（使用 pm2 start --env development 时生效）
      env_development: {
        NODE_ENV: 'development',
      },

      // 日志配置
      // 日志文件路径（相对于应用目录）
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',

      // 日志添加时间戳
      time: true,

      // 日志日期格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // 合并日志
      // 在 cluster 模式下，将所有实例的日志合并到一个文件
      merge_logs: true,

      // 优雅关闭
      // 收到 SIGINT 信号后等待的时间（毫秒）
      // 让应用有时间完成正在处理的请求
      kill_timeout: 5000,

      // 等待应用就绪的时间（毫秒）
      // 在此时间内应用需要发送 ready 信号
      wait_ready: true,
      listen_timeout: 10000,

      // 重启延迟（毫秒）
      // 在 cluster 模式下，实例之间重启的间隔
      restart_delay: 1000,

      // 指数退避重启
      // 如果应用频繁崩溃，增加重启间隔
      exp_backoff_restart_delay: 100,
    },
  ],
};
