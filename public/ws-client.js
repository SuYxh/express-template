/**
 * WebSocket 客户端封装类
 * 
 * 功能特性：
 * - 自动心跳检测：定时发送 ping，检测连接是否存活
 * - 断线自动重连：连接断开后自动尝试重新连接
 * - 连接状态管理：实时追踪连接状态
 * - 事件回调机制：支持 onOpen、onClose、onError、onMessage、onReconnect
 * 
 * 使用示例：
 * ```javascript
 * const ws = new WebSocketClient({
 *   url: 'ws://localhost:3000/ws',
 *   token: 'your-jwt-token',
 *   onMessage: (data) => console.log('收到消息', data)
 * });
 * ws.connect();
 * ws.send({ type: 'test', data: { msg: 'hello' } });
 * ws.close();
 * ```
 */
class WebSocketClient {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.url - WebSocket 服务器地址
   * @param {string} options.token - JWT 认证 token（可选，会附加到 URL 参数）
   * @param {boolean} options.reconnect - 是否启用自动重连，默认 true
   * @param {number} options.reconnectInterval - 重连间隔时间（毫秒），默认 3000
   * @param {number} options.reconnectMaxAttempts - 最大重连次数，默认 10
   * @param {number} options.heartbeatInterval - 心跳发送间隔（毫秒），默认 30000
   * @param {number} options.heartbeatTimeout - 心跳超时时间（毫秒），默认 10000
   * @param {Function} options.onOpen - 连接成功回调
   * @param {Function} options.onClose - 连接关闭回调
   * @param {Function} options.onError - 错误回调
   * @param {Function} options.onMessage - 收到消息回调
   * @param {Function} options.onReconnect - 开始重连回调
   */
  constructor(options = {}) {
    // ========== 连接配置 ==========
    this.url = options.url || '';                                    // WebSocket 服务器地址
    this.token = options.token || '';                                // JWT token

    // ========== 重连配置 ==========
    this.reconnect = options.reconnect !== false;                    // 是否启用自动重连
    this.reconnectInterval = options.reconnectInterval || 3000;      // 重连间隔（ms）
    this.reconnectMaxAttempts = options.reconnectMaxAttempts || 10;  // 最大重连次数

    // ========== 心跳配置 ==========
    this.heartbeatInterval = options.heartbeatInterval || 30000;     // 心跳间隔（ms）
    this.heartbeatTimeout = options.heartbeatTimeout || 10000;       // 心跳超时（ms）

    // ========== 内部状态 ==========
    this.ws = null;                      // WebSocket 实例
    this.reconnectAttempts = 0;          // 当前重连次数
    this.heartbeatTimer = null;          // 心跳定时器
    this.heartbeatTimeoutTimer = null;   // 心跳超时定时器
    this.manualClose = false;            // 是否手动关闭（手动关闭不触发重连）

    // ========== 事件回调 ==========
    this.onOpen = options.onOpen || (() => {});           // 连接成功
    this.onClose = options.onClose || (() => {});         // 连接关闭
    this.onError = options.onError || (() => {});         // 发生错误
    this.onMessage = options.onMessage || (() => {});     // 收到消息
    this.onReconnect = options.onReconnect || (() => {}); // 开始重连
  }

  /**
   * 建立 WebSocket 连接
   * @param {string} url - WebSocket 地址（可选，覆盖构造函数的 url）
   * @param {string} token - JWT token（可选，覆盖构造函数的 token）
   */
  connect(url, token) {
    // 支持动态修改 url 和 token
    if (url) this.url = url;
    if (token) this.token = token;

    if (!this.url) {
      console.error('[WS] URL is required');
      return;
    }

    // 重置手动关闭标记
    this.manualClose = false;

    // 构建完整 URL（带 token 参数）
    const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url;

    try {
      this.ws = new WebSocket(wsUrl);
      this._bindEvents();
    } catch (e) {
      console.error('[WS] Connection error:', e);
      this._handleReconnect();
    }
  }

  /**
   * 绑定 WebSocket 事件
   * @private
   */
  _bindEvents() {
    // 连接成功
    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;  // 重置重连计数
      this._startHeartbeat();       // 启动心跳
      this.onOpen();
    };

    // 连接关闭
    this.ws.onclose = (event) => {
      console.log(`[WS] Disconnected (code: ${event.code})`);
      this._stopHeartbeat();  // 停止心跳
      this.onClose(event);

      // 非手动关闭 && 启用重连 => 尝试重连
      if (!this.manualClose && this.reconnect) {
        this._handleReconnect();
      }
    };

    // 连接错误
    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
      this.onError(error);
    };

    // 收到消息
    this.ws.onmessage = (event) => {
      const data = this._parseMessage(event.data);
      
      // 如果是 pong 消息，处理心跳响应，不传递给业务层
      if (data && data.type === 'pong') {
        this._onPong();
        return;
      }

      // 其他消息传递给业务层
      this.onMessage(data, event);
    };
  }

  /**
   * 解析消息内容
   * @private
   * @param {string} data - 原始消息数据
   * @returns {Object|string} 解析后的数据
   */
  _parseMessage(data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;  // 非 JSON 格式，原样返回
    }
  }

  /**
   * 启动心跳检测
   * @private
   * 
   * 工作原理：
   * 1. 每隔 heartbeatInterval 发送一个 ping 消息
   * 2. 等待服务端返回 pong 消息
   * 3. 如果 heartbeatTimeout 内没收到 pong，认为连接已断开，主动关闭
   */
  _startHeartbeat() {
    this._stopHeartbeat();  // 先清理旧的定时器

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });  // 发送心跳
        this._waitPong();              // 等待响应
      }
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * 等待心跳响应（pong）
   * @private
   * 
   * 如果在超时时间内没收到 pong，主动关闭连接触发重连
   */
  _waitPong() {
    this.heartbeatTimeoutTimer = setTimeout(() => {
      console.warn('[WS] Heartbeat timeout, reconnecting...');
      this.ws?.close();  // 关闭连接，会触发 onclose -> _handleReconnect
    }, this.heartbeatTimeout);
  }

  /**
   * 收到心跳响应（pong）
   * @private
   * 
   * 清除超时定时器，说明连接正常
   */
  _onPong() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * 处理重连逻辑
   * @private
   */
  _handleReconnect() {
    // 达到最大重连次数，停止重连
    if (this.reconnectAttempts >= this.reconnectMaxAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting... (${this.reconnectAttempts}/${this.reconnectMaxAttempts})`);
    this.onReconnect(this.reconnectAttempts);

    // 延迟重连
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * 发送消息
   * @param {Object|string} data - 要发送的数据（对象会自动 JSON.stringify）
   * @returns {boolean} 是否发送成功
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, cannot send message');
      return false;
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(message);
    return true;
  }

  /**
   * 关闭连接
   * 
   * 注意：手动调用 close() 不会触发自动重连
   */
  close() {
    this.manualClose = true;  // 标记为手动关闭
    this._stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 是否已连接
   * @returns {boolean}
   */
  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 当前连接状态
   * @returns {string} CONNECTING | OPEN | CLOSING | CLOSED
   */
  get state() {
    if (!this.ws) return 'CLOSED';
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.ws.readyState];
  }
}

// 支持 CommonJS 和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebSocketClient;
}


/** 使用示例

// 引入
<script src="ws-client.js"></script>

// 或 Node.js
const WebSocketClient = require('./ws-client.js');

// 创建实例
const ws = new WebSocketClient({
  url: 'ws://localhost:3000/ws',
  token: 'your-jwt-token',
  reconnect: true,              // 是否自动重连
  reconnectInterval: 3000,      // 重连间隔 (ms)
  reconnectMaxAttempts: 10,     // 最大重连次数
  heartbeatInterval: 30000,     // 心跳间隔 (ms)
  heartbeatTimeout: 10000,      // 心跳超时 (ms)

  onOpen: () => console.log('已连接'),
  onClose: (event) => console.log('已断开'),
  onError: (error) => console.log('错误'),
  onMessage: (data) => console.log('收到消息', data),
  onReconnect: (attempts) => console.log(`重连中 ${attempts}`)
});

// 连接
ws.connect();

// 发送消息
ws.send({ type: 'test', data: { msg: 'hello' } });

// 断开
ws.close();

// 状态
console.log(ws.isConnected);  // true/false
console.log(ws.state);        // CONNECTING/OPEN/CLOSING/CLOSED

 */