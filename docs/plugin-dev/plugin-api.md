# Plugin API

Plugin 是插件基类，提供了生命周期钩子、数据库访问、定时任务、日志、插件间通信等核心能力。

> **全局变量**：Node.js 和 Python 的 SDK 对象（`Plugin`、`Sender`、`LinkZone`、`LZDB`）由 runtime 自动注入为全局变量，**无需 `require` 或 `import`**。

## 生命周期钩子

| 钩子 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 启动 | `onStart()` | `on_start()` | 插件实例化后调用，用于初始化 |
| 消息处理 | `handleMessage(sender)` | `handle_message(sender)` | 收到匹配消息时调用 |
| 框架事件 | `onEvent(event)` | `on_event(event)` | 收到框架内部事件时调用（需在 metadata.subscribe 中声明） |
| 定时任务 | `onCron()` | `on_cron()` | Cron 表达式触发时调用 |
| AI 工具执行 | `executeTool(sender, args)` | `execute_tool(sender, args)` | AI 调用工具时执行 |
| 停止 | `onStop()` | `on_stop()` | 插件卸载前调用，用于清理资源 |

> **工具库模式**的插件 runtime 不会创建实例，因此 `onStart`、`handleMessage` 等钩子**不会被调用**。

## 插件定义方式

### Node.js - 函数式

```javascript
module.exports = {
    metadata: {
        name: 'echo',
        version: '1.0.0',
        description: '回声插件',
        triggers: [{ type: 0, pattern: '/echo' }]
    },
    async handleMessage(sender) {
        await sender.reply(sender.getMessage());
    }
};
```

### Node.js - 类式

```javascript
class HelloPlugin extends Plugin {
    async handleMessage(sender) {
        await sender.reply(`你好，${sender.getSenderName()}！`);
    }
}

HelloPlugin.metadata = {
    name: 'hello',
    version: '1.0.0',
    description: '问候插件',
    triggers: [{ type: 0, pattern: '/hello' }],
    event_types: ['message']
};

module.exports = HelloPlugin;
```

> **重要**：类式插件必须使用**静态属性** `MyPlugin.metadata = {...}` 定义元信息，而不是通过 `super({...})` 传递。runtime 只读取静态 metadata 属性。

### Python - 函数式

```python
# SDK 对象由 runtime 自动注入，无需 import

def handle_message(sender):
    sender.reply(sender.get_message())

metadata = {
    "name": "echo",
    "version": "1.0.0",
    "description": "回声插件",
    "triggers": [{"type": 0, "pattern": "/echo"}]
}
```

### Python - 类式

```python
# SDK 对象由 runtime 自动注入，无需 import

class HelloPlugin(Plugin):
    def handle_message(self, sender):
        sender.reply(f"你好，{sender.get_sender_name()}！")

HelloPlugin.metadata = {
    "name": "hello",
    "version": "1.0.0",
    "description": "问候插件",
    "triggers": [{"type": 0, "pattern": "/hello"}],
    "event_types": ["message"]
}
```

> **Python 注意**：虽然 `Plugin`、`Sender`、`LinkZone`、`LZDB` 是全局变量，但 Python 的类定义语法要求基类在定义时可见。因此 Python 类式插件中 `Plugin` 作为基类必须能被解析到——runtime 会在执行前将其注入全局命名空间，所以无需 import。

## 数据库访问

插件可通过 `this.db`（Node.js）/ `self.db`（Python）访问插件专属的命名空间数据库。

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取数据 | `await this.db.get(bucket, key)` | `self.db.get(bucket, key)` | 获取指定 key 的值 |
| 设置数据 | `await this.db.set(bucket, key, value)` | `self.db.set(bucket, key, value)` | 设置 key-value |
| 删除数据 | `await this.db.delete(bucket, key)` | `self.db.delete(bucket, key)` | 删除指定 key |
| 列出键 | `await this.db.list(bucket)` | `self.db.list(bucket)` | 列出 bucket 下所有 key |
| 检查存在 | `await this.db.exists(bucket, key)` | `self.db.exists(bucket, key)` | 检查 key 是否存在 |
| 批量设置 | `await this.db.batchSet(bucket, items)` | `self.db.batch_set(bucket, items)` | 批量写入 |
| 批量删除 | `await this.db.batchDelete(bucket, keys)` | `self.db.batch_delete(bucket, keys)` | 批量删除 |
| 列出桶 | `await this.db.listBuckets()` | `self.db.list_buckets()` | 列出所有 bucket |

> **注意**：`self.db` 在 `__init__` 中为 None，必须在 `on_start()` 及之后的钩子中使用。工具库模式插件不能使用 `self.db`，只能用 `LZDB`。

### LZDB 全局数据库

`LZDB` 是全局数据库对象，可在任何插件中使用（包括工具库模式）：

```javascript
// Node.js
const db = new LZDB('my-namespace');
await db.set('key', 'value');
const val = await db.get('key');
```

```python
# Python
db = LZDB("my-namespace")
db.set("key", "value")
val = db.get("key")
```

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取 | `await db.get(key, defaultValue?)` | `db.get(key, default=None)` | 获取数据 |
| 设置 | `await db.set(key, value)` | `db.set(key, value)` | 设置数据 |
| 删除 | `await db.delete(key)` | `db.delete(key)` | 删除数据 |
| 检查 | `await db.exists(key)` | `db.exists(key)` | 检查存在 |
| 列出 | `await db.keys()` | `db.keys()` | 列出所有 key |
| 清空 | `await db.clear()` | `db.clear()` | 清空命名空间 |

静态方法：

| 方法 | 说明 |
|------|------|
| `LZDB.setDefaultClient(client)` | 设置默认客户端（runtime 自动调用） |
| `LZDB.listNamespaces(client?)` | 列出所有命名空间 |

## 定时任务

### 方式一：metadata 声明

在 metadata 中声明 `cron` 表达式，框架会按计划调用 `onCron`：

```javascript
// Node.js
class TimerPlugin extends Plugin {
    async onCron() {
        // 每天早上 8 点执行
        await LinkZone.push('qq', 'group_123', '早上好！');
    }
}

TimerPlugin.metadata = {
    name: 'morning-greeting',
    cron: '0 8 * * *',
    is_service: true
};

module.exports = TimerPlugin;
```

```python
# Python
class TimerPlugin(Plugin):
    def on_cron(self):
        LinkZone.push("qq", "group_123", "早上好！")

TimerPlugin.metadata = {
    "name": "morning-greeting",
    "cron": "0 8 * * *",
    "is_service": True
}
```

### 方式二：回调式定时任务

通过 `registerCron` 注册回调式定时任务：

```javascript
// Node.js
async onStart() {
    this.registerCron('daily_report', '0 9 * * *', async () => {
        this.log.info('daily_report', '每天 9 点执行');
    });
}
```

```python
# Python
def on_start(self):
    self.register_cron("daily_report", "0 9 * * *", self.daily_report)

def daily_report(self):
    LinkZone.logger.info("daily_report", "每天 9 点执行")
```

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 注册 | `await this.registerCron(taskId, cron, handler)` | `self.register_cron(task_id, cron, handler)` | 注册定时任务 |
| 更新 | `await this.updateCron(taskId, cron)` | `self.update_cron(task_id, cron)` | 更新 cron 表达式 |
| 取消 | `await this.unregisterCron(taskId)` | `self.unregister_cron(task_id)` | 取消定时任务 |
| 列出 | `await this.listCron()` | `self.list_cron()` | 列出所有定时任务 |
| 手动触发 | `await this.triggerCron(taskId)` | `self.trigger_cron(task_id)` | 手动触发 |

## 日志

### 方式一：LinkZone.logger（推荐）

```javascript
// Node.js
LinkZone.logger.debug('module', '调试信息');
LinkZone.logger.info('module', '普通信息');
LinkZone.logger.warn('module', '警告信息');
LinkZone.logger.error('module', '错误信息');
LinkZone.logger.fatal('module', '致命错误');

// 只传一个参数时，module 默认为当前插件名
LinkZone.logger.info('这条日志的 module 自动为当前插件名');
```

```python
# Python
LinkZone.logger.debug("module", "调试信息")
LinkZone.logger.info("module", "普通信息")
LinkZone.logger.warn("module", "警告信息")
LinkZone.logger.error("module", "错误信息")
LinkZone.logger.fatal("module", "致命错误")

# 只传一个参数时，module 默认为当前插件名
LinkZone.logger.info("这条日志的 module 自动为当前插件名")
```

日志级别控制：

```javascript
await LinkZone.logger.setLevel('debug')          // 全局
await LinkZone.logger.setLevel('debug', 'module') // 指定模块
const level = await LinkZone.logger.getLevel()    // 获取当前级别
```

### 方式二：组件私有存储

插件可通过 `getData`/`setData` 访问组件私有存储：

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取数据 | `await this.getData(key, defaultValue?)` | `self.get_data(key, default=None)` | 读取组件私有数据 |
| 设置数据 | `await this.setData(key, value)` | `self.set_data(key, value)` | 写入组件私有数据 |
| 删除数据 | `await this.deleteData(key)` | `self.delete_data(key)` | 删除数据 |
| 列出数据 | `await this.listData()` | `self.list_data()` | 列出所有数据键 |

## 消息推送

### LinkZone.push

```javascript
// Node.js
await LinkZone.push('qq', 'user_123', '你好！')                    // 私聊
await LinkZone.push('qq', 'group_456', '群公告', 'group')           // 群聊
await LinkZone.push('qq', 'user_123', '你好！', 'private', 'bot_789') // 指定机器人
await LinkZone.pushAdmin('qq', '系统通知')                           // 管理员消息
```

```python
# Python
LinkZone.push("qq", "user_123", "你好！")                    # 私聊
LinkZone.push("qq", "group_456", "群公告", "group")           # 群聊
LinkZone.push("qq", "user_123", "你好！", "private", "bot_789") # 指定机器人
LinkZone.push_admin("qq", "系统通知")                           # 管理员消息
```

### 事件注入

```javascript
// Node.js
await LinkZone.inject({
    type: 'message',
    platform: 'qq',
    message: '/hello',
    senderId: 'user123',
    senderName: '测试用户',
    groupId: '',        // 有则为群聊
});
```

```python
# Python
LinkZone.inject({
    "type": "message",
    "platform": "qq",
    "message": "/hello",
    "sender_id": "user123",
    "sender_name": "测试用户",
    "group_id": "",        # 有则为群聊
})
```

## 配置访问

插件可通过 `sender.getConfig()` 获取用户在管理后台配置的值：

```javascript
async handleMessage(sender) {
    const config = await sender.getConfig();
    const apiKey = config.api_key;
    const maxRetries = config.max_retries || 3;
}
```

```python
def handle_message(self, sender):
    config = sender.get_config()
    api_key = config.get("api_key")
    max_retries = config.get("max_retries", 3)
```

全局配置访问：

```javascript
// Node.js
const config = await LinkZone.config.get('plugin-name')
await LinkZone.config.set('plugin-name', { key: 'value' })
```

```python
# Python
config = LinkZone.config.get("plugin-name")
LinkZone.config.set("plugin-name", {"key": "value"})
```

## HTTP 路由

适配器可通过 `LinkZone.http` 注册 HTTP 路由：

```javascript
// Node.js
await LinkZone.http.register('/api/data', handler)
await LinkZone.http.get('/api/data', handler)
await LinkZone.http.post('/api/data', handler)
await LinkZone.http.put('/api/data', handler)
await LinkZone.http.delete('/api/data', handler)
await LinkZone.http.unregister('/api/data')
```

```python
# Python
LinkZone.http.register("/api/data", handler)
LinkZone.http.get("/api/data", handler)
LinkZone.http.post("/api/data", handler)
LinkZone.http.put("/api/data", handler)
LinkZone.http.delete("/api/data", handler)
LinkZone.http.unregister("/api/data")
```

handler 接收 `{ method, path, query, headers, body }`，返回 `{ status?, headers?, body }`。

## WebSocket

适配器可通过 `LinkZone.ws` 注册 WebSocket：

```javascript
// Node.js
await LinkZone.ws.register('/ws/chat', {
    onConnect(connId) { },
    onMessage(connId, data) { },
    onDisconnect(connId) { }
})
await LinkZone.ws.unregister('/ws/chat')
await LinkZone.ws.send(connId, data)
```

```python
# Python
LinkZone.ws.register("/ws/chat", {
    "on_connect": lambda conn_id: None,
    "on_message": lambda conn_id, data: "response",
    "on_disconnect": lambda conn_id: None
})
LinkZone.ws.unregister("/ws/chat")
LinkZone.ws.send(conn_id, "Hello")
```

## 热重载

框架支持插件热重载，修改插件代码后自动重新加载，无需重启服务：

- **普通插件**：检测到文件变更后自动卸载旧实例、加载新代码
- **服务插件**：调用 `onStop()` → 卸载旧实例 → 加载新代码 → 调用 `onStart()`
- **工具库**：下次被 require 时使用新代码

热重载时会依次调用 `onStop()` → 卸载旧实例 → 加载新代码 → 调用 `onStart()`。

## 错误处理

插件中的未捕获异常会被 SDK 自动捕获并记录日志，不会导致 runtime 崩溃：

```javascript
async handleMessage(sender) {
    try {
        const result = await riskyOperation();
        await sender.reply(result);
    } catch (err) {
        LinkZone.logger.error('plugin', `处理失败: ${err.message}`);
        await sender.reply('处理出错，请稍后重试');
    }
}
```

## 完整示例

```javascript
class WeatherPlugin extends Plugin {
    async onStart() {
        LinkZone.logger.info('weather', '天气插件已启动');
        this.cache = {};
    }

    async handleMessage(sender) {
        const city = await sender.param(0);
        if (!city) {
            await sender.reply('请输入城市名，如：/weather 北京');
            return;
        }

        // 从配置获取 API Key
        const config = await sender.getConfig();
        const data = await this.db.get('weather', `cache_${city}`);

        if (data) {
            await sender.reply(data);
        } else {
            const result = await fetch(
                `https://api.weather.com?city=${city}&key=${config.api_key}`
            );
            await this.db.set('weather', `cache_${city}`, result);
            await sender.reply(result);
        }
    }

    async onCron() {
        // 每天早上 8 点推送天气
        const keys = await this.db.list('weather');
        for (const key of keys) {
            if (!key.startsWith('cache_')) continue;
            const city = key.replace('cache_', '');
            const result = await fetch(
                `https://api.weather.com?city=${city}`
            );
            await this.db.set('weather', key, result);
        }
    }

    async executeTool(sender, args) {
        const { city } = args;
        const data = await this.db.get('weather', `cache_${city}`);
        return { success: true, content: data || '暂无数据' };
    }

    async onStop() {
        LinkZone.logger.info('weather', '天气插件已停止');
    }
}

WeatherPlugin.metadata = {
    name: 'weather',
    version: '1.0.0',
    description: '天气查询',
    triggers: [{ type: 0, pattern: '/weather' }],
    cron: '0 8 * * *',
    is_service: true,
    ai: {
        tool: {
            parameters: [
                { name: 'city', type: 'string', description: '城市', required: true }
            ],
            usage: '查询天气',
            when_to_use: '用户询问天气时'
        }
    },
    config_schema: {
        api_key: {
            type: 'string',
            label: 'API Key',
            required: true
        }
    }
};

module.exports = WeatherPlugin;
```
