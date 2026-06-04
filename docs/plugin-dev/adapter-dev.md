# 外置适配器开发

除了内置适配器，LinkZone 支持通过 Node.js 和 Python 开发自定义适配器，接入新的通信平台。

## 适配器的工作方式

外置适配器通过 Unix Socket / TCP 与框架核心通信，SDK 封装了底层协议。适配器需要实现两个核心能力：

1. **接收消息**：从外部平台接收消息，通过 `pushEvent` 推送到框架
2. **发送消息**：框架调用 `send` 方法，将回复发送到外部平台

```
外部平台 ←→ 你的适配器代码 ←→ SDK ←→ Unix Socket ←→ 框架核心
```

## 项目结构

### Node.js

```
ecosystems/nodejs/adapters/
  my-adapter/
    index.js          # 适配器入口
```

### Python

```
ecosystems/python/adapters/
  my-adapter/
    __init__.py       # 适配器入口
```

## 元信息完整字段

元信息是适配器注册时提供给框架的描述数据，框架据此识别和管理适配器。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | **是** | — | 适配器唯一标识，用于框架内部引用，不可重复 |
| `platform` | string | **是** | `"custom"` | 平台标识，决定消息路由和平台特性识别 |
| `version` | string | 否 | `"1.0.0"` | 版本号，语义化版本格式 |
| `type` | string | 否 | `"adapter"` | 组件类型，适配器固定为 `"adapter"` |
| `description` | string | 否 | `""` | 适配器描述，用于管理后台展示 |
| `category` | string | 否 | `""` | 分类，如 `"IM"`、`"IoT"`、`"API"` |
| `author` | string | 否 | `""` | 作者 |
| `homepage` | string | 否 | `""` | 主页 URL |
| `license` | string | 否 | `""` | 许可证 |
| `icon` | string | 否 | `""` | 图标 URL 或名称 |
| `tags` | string[] | 否 | `[]` | 标签，如 `["qq", "im"]` |
| `dependencies` | string[] | 否 | `[]` | 依赖的其他组件名称列表 |
| `priority` | number | 否 | `0` | 优先级，数值越大越优先处理 |
| `config_schema` | object | 否 | `{}` | 配置项定义，框架据此生成配置界面和校验 |
| `extra` | object | 否 | `{}` | 扩展字段，存储自定义元数据 |
| `is_public` | bool | 否 | `false` | 是否公开（市场可见） |
| `is_encrypted` | bool | 否 | `true` | 代码是否加密 |
| `file_path` | string | 否 | `""` | 文件路径（框架自动填充） |
| `market` | bool | 否 | `false` | 是否上架市场 |
| `enable_metrics` | bool | 否 | `false` | 是否启用性能指标收集 |
| `enable_health_check` | bool | 否 | `false` | 是否启用健康检查 |
| `health_check_interval` | string | 否 | `"30s"` | 健康检查间隔 |
| `enable_cache` | bool | 否 | `false` | 是否启用缓存扩展 |
| `enable_retry` | bool | 否 | `false` | 是否启用重试扩展 |
| `lifecycle_mode` | string | 否 | `"persistent"` | 生命周期模式：`persistent`（常驻）、`transient`（临时）、`loaded`（按需加载） |
| `owner` | string | 否 | `"nodejs-runtime"` / `"python-runtime"` | 所属运行时 |
| `stage` | number | 否 | `0` | 启动阶段，数值越小越早启动 |
| `adapters` | string[] | 否 | `[]` | 依赖的适配器列表 |
| `event_types` | string[] | 否 | `["message"]` | 订阅的事件类型 |
| `is_service` | bool | 否 | `false` | 是否为服务型组件 |
| `cron` | string | 否 | `""` | 定时任务 Cron 表达式 |
| `listen_only` | bool | 否 | `false` | 是否仅监听模式（不处理消息） |
| `permission_level` | number | 否 | `1` | 所需权限等级（1-7，1=普通用户，6=管理员，7=超级管理员） |
| `tool` | object/null | 否 | `null` | AI 工具定义（适配器一般不用） |
| `ai_triggerable` | bool | 否 | `false` | 是否可被 AI 触发 |
| `ai_trigger_usage` | string | 否 | `""` | AI 触发时的用途描述 |
| `ai_trigger_format` | string | 否 | `""` | AI 触发时的参数格式描述 |
| `ai_trigger_args` | object | 否 | `{}` | AI 触发时的参数定义 |

### config_schema 详解

`config_schema` 定义适配器的可配置项，框架据此生成配置界面和校验规则：

```javascript
config_schema: {
    api_token: {
        type: 'string',           // 类型：string / number / bool / select
        label: 'API Token',       // 显示名称
        default: '',              // 默认值
        description: '平台 API Token',  // 说明
        required: true            // 是否必填（可选）
    },
    max_retries: {
        type: 'number',
        label: '最大重试次数',
        default: 3,
        description: 'API 请求最大重试次数'
    },
    sandbox: {
        type: 'bool',
        label: '沙箱模式',
        default: false,
        description: '是否使用沙箱环境'
    },
    mode: {
        type: 'select',
        label: '运行模式',
        default: 'websocket',
        description: '连接方式',
        options: [
            { label: 'WebSocket', value: 'websocket' },
            { label: 'HTTP 长轮询', value: 'long_polling' }
        ]
    }
}
```

框架会自动为所有组件追加 `log_level` 配置项。

## 完整示例

### Node.js

```javascript
const { Adapter, LinkZone } = require('linkzone-sdk');

class TelegramAdapter extends Adapter {
    constructor() {
        super({
            name: 'telegram',
            platform: 'telegram',
            version: '1.0.0',
            description: 'Telegram Bot 适配器',
            category: 'IM',
            author: 'Your Name',
            license: 'MIT',
            tags: ['telegram', 'im'],
            priority: 80,
            enable_metrics: true,
            enable_health_check: true,
            health_check_interval: '30s',
            config_schema: {
                bot_token: {
                    type: 'string',
                    label: 'Bot Token',
                    default: '',
                    description: 'Telegram Bot Token（从 @BotFather 获取）'
                },
                api_base: {
                    type: 'string',
                    label: 'API 地址',
                    default: 'https://api.telegram.org',
                    description: 'Telegram API 地址'
                },
                max_connections: {
                    type: 'number',
                    label: '最大连接数',
                    default: 10,
                    description: 'Webhook 最大连接数'
                }
            }
        });
        this.pollingTimer = null;
    }

    async onStart() {
        const config = await this.getConfig();
        this.botToken = config.bot_token;
        this.apiBase = config.api_base || 'https://api.telegram.org';

        if (!this.botToken) {
            throw new Error('未配置 bot_token');
        }

        // 启动长轮询
        this._startPolling();
        LinkZone.logger.info('telegram', '适配器已启动');
    }

    async onStop() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
        LinkZone.logger.info('telegram', '适配器已停止');
    }

    async send(msg) {
        const { receiver_id, content, segments } = msg;
        let text = content;

        // 将消息段转换为 Telegram 格式
        if (segments && segments.length > 0) {
            text = this._convertSegments(segments);
        }

        const url = `${this.apiBase}/bot${this.botToken}/sendMessage`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: receiver_id,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await resp.json();
        return String(data.result?.message_id || '');
    }

    async deleteMessage(messageId) {
        const config = await this.getConfig();
        const url = `${this.apiBase}/bot${config.bot_token}/deleteMessage`;
        // 需要从存储中获取 chat_id
        const chatId = await this.getData(`chat:${messageId}`);
        if (!chatId) return;

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: parseInt(messageId) })
        });
    }

    async doAction(action, params) {
        switch (action) {
            case 'kick':
                return this._kickMember(params);
            case 'ban':
                return this._banMember(params);
            default:
                throw new Error(`不支持的动作: ${action}`);
        }
    }

    // 长轮询获取更新
    async _startPolling() {
        let offset = 0;
        this.pollingTimer = setInterval(async () => {
            try {
                const url = `${this.apiBase}/bot${this.botToken}/getUpdates`;
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offset, timeout: 10 })
                });
                const data = await resp.json();

                for (const update of data.result || []) {
                    offset = update.update_id + 1;
                    if (update.message) {
                        this._handleTelegramMessage(update.message);
                    }
                }
            } catch (err) {
                LinkZone.logger.error('telegram', '轮询失败: ' + err.message);
            }
        }, 3000);
    }

    // 将 Telegram 消息推送到框架
    _handleTelegramMessage(msg) {
        this.pushEvent({
            type: 'message',
            platform: 'telegram',
            botId: this.botToken.split(':')[0],
            senderId: String(msg.from.id),
            senderName: msg.from.first_name,
            receiverId: String(msg.chat.id),
            receiverType: msg.chat.type === 'group' ? 'group' : 'private',
            message: msg.text || '',
            segments: [],
            messageId: String(msg.message_id),
            extra: {
                telegram: {
                    chat_type: msg.chat.type,
                    is_bot: msg.from.is_bot
                }
            }
        });
    }

    _convertSegments(segments) {
        return segments.map(seg => {
            switch (seg.type) {
                case 'text': return seg.data.text || '';
                case 'image': return `[图片](${seg.data.url})`;
                case 'at': return `@${seg.data.qq}`;
                default: return '';
            }
        }).join('');
    }

    async _kickMember(params) { /* ... */ }
    async _banMember(params) { /* ... */ }
}

module.exports = TelegramAdapter;
```

### Python

```python
from linkzone import Adapter, LinkZone, create_adapter
import threading
import time
import json
import urllib.request


class TelegramAdapter(Adapter):
    def __init__(self):
        super().__init__(
            {
                "name": "telegram",
                "platform": "telegram",
                "version": "1.0.0",
                "description": "Telegram Bot 适配器",
                "category": "IM",
                "author": "Your Name",
                "license": "MIT",
                "tags": ["telegram", "im"],
                "priority": 80,
                "enable_metrics": True,
                "enable_health_check": True,
                "health_check_interval": "30s",
                "config_schema": {
                    "bot_token": {
                        "type": "string",
                        "label": "Bot Token",
                        "default": "",
                        "description": "Telegram Bot Token",
                    },
                    "api_base": {
                        "type": "string",
                        "label": "API 地址",
                        "default": "https://api.telegram.org",
                        "description": "Telegram API 地址",
                    },
                },
            }
        )
        self._polling_thread = None
        self._running = False

    def on_start(self):
        config = self.get_config()
        self.bot_token = config.get("bot_token", "")
        self.api_base = config.get("api_base", "https://api.telegram.org")

        if not self.bot_token:
            raise Exception("未配置 bot_token")

        self._running = True
        self._polling_thread = threading.Thread(target=self._poll, daemon=True)
        self._polling_thread.start()
        LinkZone.logger.info("telegram", "适配器已启动")

    def on_stop(self):
        self._running = False
        LinkZone.logger.info("telegram", "适配器已停止")

    def send(self, msg):
        receiver_id = msg.get("receiver_id", "")
        content = msg.get("content", "")

        url = f"{self.api_base}/bot{self.bot_token}/sendMessage"
        data = json.dumps(
            {"chat_id": receiver_id, "text": content, "parse_mode": "HTML"}
        ).encode()

        req = urllib.request.Request(
            url, data=data, headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())

        return str(result.get("result", {}).get("message_id", ""))

    def delete_message(self, message_id):
        pass

    def do_action(self, action, params):
        if action == "kick":
            return self._kick_member(params)
        raise Exception(f"不支持的动作: {action}")

    def _poll(self):
        offset = 0
        while self._running:
            try:
                url = f"{self.api_base}/bot{self.bot_token}/getUpdates"
                data = json.dumps({"offset": offset, "timeout": 10}).encode()
                req = urllib.request.Request(
                    url, data=data, headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    result = json.loads(resp.read())

                for update in result.get("result", []):
                    offset = update["update_id"] + 1
                    if "message" in update:
                        self._handle_message(update["message"])
            except Exception as e:
                LinkZone.logger.error("telegram", f"轮询失败: {e}")
            time.sleep(3)

    def _handle_message(self, msg):
        self.push_event(
            {
                "type": "message",
                "platform": "telegram",
                "bot_id": self.bot_token.split(":")[0],
                "sender_id": str(msg["from"]["id"]),
                "sender_name": msg["from"].get("first_name", ""),
                "receiver_id": str(msg["chat"]["id"]),
                "receiver_type": "group" if msg["chat"]["type"] == "group" else "private",
                "message": msg.get("text", ""),
                "segments": [],
                "message_id": str(msg["message_id"]),
                "extra": {"telegram": {"chat_type": msg["chat"]["type"]}},
            }
        )

    def _kick_member(self, params):
        pass


create_adapter(TelegramAdapter)
```

## 核心 API

### 必须实现的方法

#### `send(msg)`

框架调用此方法将回复消息发送到外部平台。

**msg 参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `receiver_id` | string | 接收者 ID（用户 ID 或群 ID） |
| `receiver_type` | string | `private`（私聊）或 `group`（群聊） |
| `content` | string | 消息文本内容 |
| `segments` | array | 消息段（富文本内容） |
| `bot_id` | string | 机器人 ID |
| `extra` | object | 附加数据 |

**返回值：** 发送成功后的消息 ID（string）

#### `onStart()`

适配器启动时调用，用于初始化连接、读取配置等。

#### `onStop()`

适配器停止时调用，用于清理连接、释放资源等。

### 可选实现的方法

#### `deleteMessage(messageId)`

撤回指定消息。如果不实现，框架会返回默认错误。

#### `doAction(action, params)`

执行平台特定动作（踢人、禁言等）。如果不实现，框架会返回默认错误。

### 推送事件

#### `pushEvent(event)`

将外部平台收到的消息推送到框架：

**event 参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 否 | 事件类型，默认 `"message"` |
| `platform` | string | 否 | 平台标识，默认使用元信息中的 `platform` |
| `bot_id` | string | 否 | 机器人 ID |
| `timestamp` | number | 否 | 时间戳，默认当前时间 |
| `sender_id` | string | **是** | 发送者 ID |
| `sender_name` | string | 否 | 发送者名称 |
| `receiver_id` | string | **是** | 接收者 ID |
| `receiver_type` | string | 否 | `private` 或 `group` |
| `group_id` | string | 否 | 群 ID（群聊时设置） |
| `group_name` | string | 否 | 群名称 |
| `message` | string | **是** | 消息文本 |
| `segments` | array | 否 | 消息段 |
| `message_id` | string | 否 | 消息 ID |
| `sub_type` | string | 否 | 子类型 |
| `extra` | object | 否 | 附加数据 |

### 消息段格式

消息段用于表示富文本内容，支持以下类型：

```javascript
// 文本
{ type: 'text', data: { text: '你好' } }

// 图片
{ type: 'image', data: { url: 'https://example.com/img.png', file: 'https://example.com/img.png' } }

// @某人
{ type: 'at', data: { qq: '123456' } }

// 回复
{ type: 'reply', data: { id: 'msg-123' } }

// 表情
{ type: 'face', data: { id: '178' } }

// 语音
{ type: 'voice', data: { url: 'https://example.com/voice.silk', file: 'https://example.com/voice.silk' } }

// 视频
{ type: 'video', data: { url: 'https://example.com/video.mp4', file: 'https://example.com/video.mp4' } }

// JSON 卡片
{ type: 'json', data: { data: { ... } } }

// 音乐
{ type: 'music', data: { type: 'qq', url: '...', audio: '...', title: '...', content: '...', image: '...' } }
```

### 数据存储

适配器可以使用框架提供的键值存储：

```javascript
// 写入
await this.setData('key', { foo: 'bar' });

// 读取
const value = await this.getData('key', defaultValue);

// 删除
await this.deleteData('key');

// 列出所有 key
const keys = await this.listData();
```

### 配置管理

```javascript
// 获取当前配置
const config = await this.getConfig();

// 更新配置
await this.setConfig({ api_token: 'new-token' });
```

### HTTP 路由注册

适配器可以注册 HTTP 路由，用于接收 Webhook 回调：

```javascript
// Node.js
await this.registerRoute('/webhook/my-platform', async (req) => {
    this.onExternalMessage(req.body);
    return { status: 200, body: { ok: true } };
}, 'POST');

// 取消注册
await this.unregisterRoute('/webhook/my-platform', 'POST');
```

```python
# Python
self.register_route("/webhook/my-platform", self._handle_webhook, "POST")

def _handle_webhook(self, req):
    self.on_external_message(req["body"])
    return {"status": 200, "body": {"ok": True}}
```

### WebSocket 注册

```javascript
// Node.js
await this.registerWebSocket('/ws/my-platform', {
    onConnect: (connId) => { /* 连接建立 */ },
    onMessage: (connId, data) => { /* 收到消息 */ return responseData; },
    onDisconnect: (connId) => { /* 连接断开 */ }
});

// 向客户端发送消息
await this.sendToWebSocket(connId, data);
```

### 定时任务

```javascript
// 注册定时任务
await this.registerCron('health-check', '*/5 * * * *', () => {
    // 每 5 分钟执行一次
    this.checkConnection();
});

// 取消定时任务
await this.unregisterCron('health-check');
```

### 日志

```javascript
// Node.js
LinkZone.logger.debug('telegram', '调试信息');
LinkZone.logger.info('telegram', '普通信息');
LinkZone.logger.warn('telegram', '警告信息');
LinkZone.logger.error('telegram', '错误信息');
```

```python
# Python
LinkZone.logger.debug("telegram", "调试信息")
LinkZone.logger.info("telegram", "普通信息")
LinkZone.logger.warn("telegram", "警告信息")
LinkZone.logger.error("telegram", "错误信息")
```

### 性能指标

```javascript
// 手动上报指标（启用 enable_metrics 后自动上报消息处理指标）
await this.reportMetrics(durationMs, errorOrNull);
```

## 快捷创建

SDK 提供了快捷创建函数：

### Node.js

```javascript
const { createAdapter } = require('linkzone-sdk');

module.exports = createAdapter(
    {
        name: 'simple-adapter',
        platform: 'simple',
        version: '1.0.0'
    },
    async (msg) => {
        // send 方法实现
        console.log('发送消息:', msg.content);
        return 'msg-id';
    }
);
```

### Python

```python
from linkzone import create_adapter

class SimpleAdapter(Adapter):
    def __init__(self):
        super().__init__({"name": "simple-adapter", "platform": "simple", "version": "1.0.0"})

    def send(self, msg):
        print(f"发送消息: {msg.get('content')}")
        return "msg-id"

create_adapter(SimpleAdapter)
```

## 与 Go 核心 Adapter 接口的对应关系

Go 核心定义了 `Adapter` 接口，外置 SDK 通过 IPC 协议实现了等价功能：

| Go 接口方法 | SDK 方法 | 说明 |
|------------|---------|------|
| `Send(msg)` | `send(msg)` | 发送消息 |
| `DeleteMessage(id)` | `deleteMessage(id)` | 撤回消息 |
| `DoAction(action, params)` | `doAction(action, params)` | 执行动作 |
| `OnStart()` | `onStart()` | 启动 |
| `OnStop()` | `onStop()` | 停止 |
| `OnReload()` | 自动处理 | 重载（SDK 自动重读配置） |
| `SetConfig(config)` | `setConfig(config)` | 更新配置 |
| `GetConfigMap()` | `getConfig()` | 获取配置 |
| `SetData/GetData` | `setData/getData` | 数据存储 |
| `IsConnected()` | 心跳机制 | 连接状态（SDK 通过心跳维护） |
| `AddFilter/Match` | — | 过滤器（外置适配器暂不支持） |

Go 核心还定义了扩展接口：

| Go 接口 | SDK 支持 | 说明 |
|---------|---------|------|
| `RoutableAdapter` | `registerRoute` | HTTP 路由注册 |
| `StreamAdapter` | `registerWebSocket` | WebSocket 支持 |
