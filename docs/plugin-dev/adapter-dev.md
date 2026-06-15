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
class QQAdapter extends Plugin {
    // ...
}

QQAdapter.metadata = {
    name: 'qq-adapter',
    version: '1.0.0',
    description: 'QQ 适配器',
    platform: 'qq',                    // 必填：平台标识
    lifecycle_mode: 'persistent',       // 适配器必须为 persistent
    is_service: true,                   // 适配器是服务插件
    event_types: ['message', 'notice', 'meta']
};

module.exports = QQAdapter;
```

### 必要字段

| 字段 | 值 | 说明 |
|------|-----|------|
| `platform` | 平台标识字符串 | 如 `'qq'`、`'web'`、`'xiaozhi'` |
| `lifecycle_mode` | `'persistent'` | 适配器必须常驻运行 |
| `is_service` | `true` | 标记为服务插件 |
| `event_types` | `['message', 'notice', 'meta']` | 订阅所有事件类型 |

## 核心方法

### 发送消息到平台

适配器需要实现消息发送方法，框架调用 `LinkZone.sendGroupMessage` / `LinkZone.sendPrivateMessage` 时，会路由到对应平台的适配器：

```javascript
class QQAdapter extends Plugin {
    async onStart() {
        // 初始化平台连接
        this.client = await this.connect();
    }

    // 适配器需注册消息发送回调
    async sendToPlatform(receiverId, receiverType, content) {
        if (receiverType === 'group') {
            await this.client.sendGroupMsg(receiverId, content);
        } else {
            await this.client.sendPrivateMsg(receiverId, content);
        }
    }
}
```

### 接收平台消息

适配器监听平台消息，转换为框架格式后推送：

```javascript
async onStart() {
    this.client.on('message', (event) => {
        // 转换为框架标准格式
        const frameworkEvent = {
            type: 'message',
            platform: 'qq',
            bot_id: this.client.uin,
            sender_id: event.sender.user_id,
            sender_name: event.sender.nickname,
            receiver_id: event.group_id || event.user_id,
            receiver_type: event.group_id ? 'group' : 'private',
            group_id: event.group_id || '',
            group_name: event.group_name || '',
            message: this.parseMessage(event.message),
            message_id: event.message_id,
            segments: event.message,
            timestamp: event.time,
            extra: {}
        };

        // 推送给框架
        LinkZone.pushEvent(frameworkEvent);
    });
}
```

### 消息格式转换

适配器负责平台消息格式与框架标准格式之间的转换：

#### 平台消息 → 框架消息

```javascript
parseMessage(platformMessage) {
    // 将平台特有的消息格式转为纯文本
    let text = '';
    for (const seg of platformMessage) {
        switch (seg.type) {
            case 'text':
                text += seg.data.text;
                break;
            case 'at':
                text += `@${seg.data.qq}`;
                break;
            case 'image':
                text += '[图片]';
                break;
            // ... 其他类型
        }
    }
    return text;
}
```

#### 框架消息 → 平台消息

```javascript
formatMessage(content) {
    // 将框架消息段转为平台格式
    if (typeof content === 'string') {
        return [{ type: 'text', data: { text: content } }];
    }

    if (Array.isArray(content)) {
        return content.map(seg => {
            // 框架消息段 → 平台消息段
            switch (seg.type) {
                case 'text':
                    return { type: 'text', data: { text: seg.data.text } };
                case 'image':
                    return { type: 'image', data: { file: seg.data.file || seg.data.url } };
                case 'at':
                    return { type: 'at', data: { qq: seg.data.qq } };
                // ... 平台特有转换
            }
        });
    }

    // 单个消息段
    return [this.convertSegment(content)];
}
```

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
  └── 注册发送回调

[运行中]
  ├── 接收平台消息 → pushEvent
  └── 接收框架消息 → sendToPlatform

onStop()
  ├── 断开平台连接
  └── 清理资源
```

## 完整示例

```javascript
class WebAdapter extends Plugin {
    async onStart() {
        this.log.info('Web 适配器启动');
        this.connections = new Map();

        // 初始化 WebSocket 服务器
        this.wss = new WebSocket.Server({ port: 8080 });

        this.wss.on('connection', (ws, req) => {
            const userId = this.extractUserId(req);
            this.connections.set(userId, ws);

            ws.on('message', (data) => {
                const msg = JSON.parse(data);
                LinkZone.pushEvent({
                    type: 'message',
                    platform: 'web',
                    bot_id: 'web-bot',
                    sender_id: userId,
                    sender_name: msg.username || userId,
                    receiver_id: 'web-bot',
                    receiver_type: 'private',
                    group_id: '',
                    group_name: '',
                    message: msg.text,
                    message_id: `web_${Date.now()}`,
                    segments: [{ type: 'text', data: { text: msg.text } }],
                    timestamp: Math.floor(Date.now() / 1000),
                    extra: {}
                });
            });

            ws.on('close', () => {
                this.connections.delete(userId);
            });
        });
    }

    async sendToPlatform(receiverId, receiverType, content) {
        const ws = this.connections.get(receiverId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            const text = typeof content === 'string'
                ? content
                : this.formatContent(content);
            ws.send(JSON.stringify({ text }));
        }
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
        this.log.info('Web 适配器停止');
        if (this.wss) {
            this.wss.close();
        }
        this.connections.clear();
    }
}

WebAdapter.metadata = {
    name: 'web-adapter',
    version: '1.0.0',
    description: 'Web 适配器',
    platform: 'web',
    lifecycle_mode: 'persistent',
    is_service: true,
    event_types: ['message', 'notice', 'meta']
};

module.exports = WebAdapter;
```

## 适配器开发注意事项

1. **必须 persistent**：适配器需要持续监听平台事件，`lifecycle_mode` 必须为 `persistent`
2. **错误处理**：网络断开时应自动重连，不要让适配器崩溃
3. **消息去重**：平台可能重复推送消息，适配器应做去重处理
4. **速率限制**：遵守平台 API 的速率限制，避免被封禁
5. **消息段降级**：平台不支持的消息段类型应降级为纯文本
6. **多 Bot 支持**：一个适配器可以管理多个 Bot 实例，通过 `bot_id` 区分
