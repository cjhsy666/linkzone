# 适配器开发

适配器（Adapter）是 LinkZone 与外部平台（QQ、微信、Web 等）之间的桥梁，负责消息的收发和事件转换。

## 概述

适配器是一个特殊的插件，运行在框架内，负责：

1. **接收外部消息** → 转换为框架标准格式 → 推送给框架
2. **接收框架消息** → 转换为平台格式 → 发送到外部平台
3. **推送平台事件** → 转换为框架事件 → 通知框架

## 适配器元信息

适配器必须在 metadata 中声明 `platform` 字段：

```javascript
class QQAdapter extends Adapter {
    // ...
}

QQAdapter.metadata = {
    name: 'qq-adapter',
    version: '1.0.0',
    description: 'QQ 适配器',
    platform: 'qq',                    // 必填：平台标识
    is_service: true,                  // 适配器是服务插件
    event_types: ['message', 'notice', 'meta']
};

module.exports = QQAdapter;
```

### 必要字段

| 字段 | 值 | 说明 |
|------|-----|------|
| `platform` | 平台标识字符串 | 如 `'qq'`、`'web'`、`'xiaozhi'` |
| `is_service` | `true` | 标记为服务插件，启动时调用 onStart |
| `event_types` | `['message', 'notice', 'meta']` | 订阅所有事件类型 |

## 核心方法

### 发送消息到平台

适配器需要实现 `send` 方法，框架调用 `LinkZone.push` 时会路由到对应平台的适配器：

```javascript
class QQAdapter extends Adapter {
    async onStart() {
        // 初始化平台连接
        this.client = await this.connect();
    }

    async send(message) {
        // message 包含 receiver_id, receiver_type, content 等
        if (message.receiver_type === 'group') {
            await this.client.sendGroupMsg(message.receiver_id, message.content);
        } else {
            await this.client.sendPrivateMsg(message.receiver_id, message.content);
        }
        return 'msg_123'; // 返回 message_id
    }
}
```

### 接收平台消息

适配器监听平台消息，转换为框架格式后通过 `pushEvent` 推送：

```javascript
async onStart() {
    this.client.on('message', (event) => {
        // 转换为框架标准格式
        LinkZone.pushEvent({
            type: 'message',
            platform: 'qq',
            botId: this.client.uin,
            senderId: event.sender.user_id,
            senderName: event.sender.nickname,
            receiverId: event.group_id || event.user_id,
            groupId: event.group_id || '',
            groupName: event.group_name || '',
            message: this.parseMessage(event.message),
            messageId: event.message_id,
            segments: event.message,
            timestamp: event.time,
            extra: {}
        });
    });
}
```

### HTTP 路由

适配器可注册 HTTP 路由，接收外部 HTTP 请求：

```javascript
class WebAdapter extends Adapter {
    async onStart() {
        await this.registerRoute('/api/webhook', async (req) => {
            // req 包含 method, path, query, headers, body
            const { body } = req;

            // 处理 Webhook
            LinkZone.pushEvent({
                type: 'message',
                platform: 'web',
                senderId: body.user_id,
                message: body.text,
                // ...
            });

            return { status: 200, body: { success: true } };
        });
    }
}
```

| 方法 | 说明 |
|------|------|
| `await this.registerRoute(path, handler, method?)` | 注册 HTTP 路由 |
| `await this.unregisterRoute(path, method?)` | 注销 HTTP 路由 |

### WebSocket

适配器可注册 WebSocket 端点：

```javascript
class WSAdapter extends Adapter {
    async onStart() {
        await this.registerWebSocket('/ws/chat', {
            onConnect: (connId) => {
                this.connections.set(connId, {});
            },
            onMessage: (connId, data) => {
                // 处理 WebSocket 消息
                LinkZone.pushEvent({
                    type: 'message',
                    platform: 'websocket',
                    senderId: connId,
                    message: data,
                    // ...
                });
                return 'response'; // 返回给客户端
            },
            onDisconnect: (connId) => {
                this.connections.delete(connId);
            }
        });
    }
}
```

| 方法 | 说明 |
|------|------|
| `await this.registerWebSocket(path, handler)` | 注册 WebSocket |
| `await this.unregisterWebSocket(path)` | 注销 WebSocket |
| `await this.sendToWebSocket(connId, data)` | 发送 WebSocket 数据 |

## 事件类型

### 消息事件（message）

```javascript
{
    type: 'message',
    platform: 'qq',
    bot_id: '123456',
    sender_id: '789',
    sender_name: '用户A',
    receiver_id: 'group_123',
    receiver_type: 'group',
    group_id: 'group_123',
    group_name: '测试群',
    message: '你好',
    message_id: 'msg_001',
    segments: [{ type: 'text', data: { text: '你好' } }],
    timestamp: 1700000000,
    extra: {}
}
```

### 通知事件（notice）

```javascript
{
    type: 'notice',
    platform: 'qq',
    notice_type: 'group_increase',   // 通知类型
    bot_id: '123456',
    sender_id: '789',
    group_id: 'group_123',
    extra: {
        operator_id: '456',          // 操作者
        sub_type: 'approve'          // 子类型
    }
}
```

常见通知类型：

| notice_type | 说明 |
|-------------|------|
| `group_increase` | 群成员增加 |
| `group_decrease` | 群成员减少 |
| `group_admin` | 群管理员变动 |
| `group_ban` | 群禁言 |
| `friend_add` | 好友添加 |
| `message_revoke` | 消息撤回 |
| `poke` | 戳一戳 |

### 元事件（meta）

```javascript
{
    type: 'meta',
    platform: 'qq',
    meta_type: 'heartbeat',          // 元事件类型
    bot_id: '123456',
    extra: {
        status: { online: true },
        interval: 30000
    }
}
```

## 适配器生命周期

```
onStart()
  ├── 初始化平台连接
  ├── 注册消息监听
  ├── 注册事件监听
  └── 注册 HTTP/WebSocket 路由

[运行中]
  ├── 接收平台消息 → pushEvent
  └── 接收框架消息 → send

onStop()
  ├── 断开平台连接
  └── 清理资源
```

## 完整示例

```javascript
class WebAdapter extends Adapter {
    async onStart() {
        LinkZone.logger.info('web-adapter', 'Web 适配器启动');
        this.connections = new Map();

        // 注册 HTTP 路由
        await this.registerRoute('/api/send', async (req) => {
            const { body } = req;
            const { user_id, text } = body;

            LinkZone.pushEvent({
                type: 'message',
                platform: 'web',
                bot_id: 'web-bot',
                sender_id: user_id,
                sender_name: user_id,
                receiver_id: 'web-bot',
                receiver_type: 'private',
                message: text,
                message_id: `web_${Date.now()}`,
                segments: [{ type: 'text', data: { text } }],
                timestamp: Math.floor(Date.now() / 1000),
                extra: {}
            });

            return { status: 200, body: { success: true } };
        });

        // 注册 WebSocket
        await this.registerWebSocket('/ws/chat', {
            onConnect: (connId) => {
                this.connections.set(connId, {});
                LinkZone.logger.info('web-adapter', `WebSocket 连接: ${connId}`);
            },
            onMessage: (connId, data) => {
                const msg = JSON.parse(data);
                LinkZone.pushEvent({
                    type: 'message',
                    platform: 'web',
                    bot_id: 'web-bot',
                    sender_id: connId,
                    sender_name: msg.username || connId,
                    receiver_id: 'web-bot',
                    receiver_type: 'private',
                    message: msg.text,
                    message_id: `web_${Date.now()}`,
                    segments: [{ type: 'text', data: { text: msg.text } }],
                    timestamp: Math.floor(Date.now() / 1000),
                    extra: {}
                });
                return 'ok';
            },
            onDisconnect: (connId) => {
                this.connections.delete(connId);
                LinkZone.logger.info('web-adapter', `WebSocket 断开: ${connId}`);
            }
        });
    }

    async send(message) {
        // WebSocket 推送
        const connId = message.receiver_id;
        const ws = this.connections.get(connId);
        if (ws) {
            const text = typeof message.content === 'string'
                ? message.content
                : this.formatContent(message.content);
            await this.sendToWebSocket(connId, JSON.stringify({ text }));
        }
        return `msg_${Date.now()}`;
    }

    formatContent(content) {
        if (Array.isArray(content)) {
            return content
                .filter(s => s.type === 'text')
                .map(s => s.data.text)
                .join('');
        }
        return String(content);
    }

    async onStop() {
        LinkZone.logger.info('web-adapter', 'Web 适配器停止');
        this.connections.clear();
    }
}

WebAdapter.metadata = {
    name: 'web-adapter',
    version: '1.0.0',
    description: 'Web 适配器',
    platform: 'web',
    is_service: true,
    event_types: ['message', 'notice', 'meta']
};

module.exports = WebAdapter;
```

## 适配器开发注意事项

1. **必须 is_service**：适配器需要持续监听平台事件，必须设为 `is_service: true`
2. **错误处理**：网络断开时应自动重连，不要让适配器崩溃
3. **消息去重**：平台可能重复推送消息，适配器应做去重处理
4. **速率限制**：遵守平台 API 的速率限制，避免被封禁
5. **消息段降级**：平台不支持的消息段类型应降级为纯文本
6. **多 Bot 支持**：一个适配器可以管理多个 Bot 实例，通过 `bot_id` 区分
