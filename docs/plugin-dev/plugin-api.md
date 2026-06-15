# Plugin API

Plugin 是插件基类，提供了生命周期钩子、数据库访问、定时任务、日志、插件间通信等核心能力。

> **全局变量**：Node.js 和 Python 的 SDK 对象（`Plugin`、`Sender`、`LinkZone`、`LZDB`）由 runtime 自动注入为全局变量，**无需 `require` 或 `import`**。

## 生命周期钩子

| 钩子 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 启动 | `onStart()` | `on_start()` | 插件实例化后调用，用于初始化 |
| 消息处理 | `handleMessage(sender)` | `handle_message(sender)` | 收到匹配消息时调用 |
| 通知处理 | `handleNotice(sender)` | `handle_notice(sender)` | 收到通知事件时调用 |
| 元事件处理 | `handleMeta(sender)` | `handle_meta(sender)` | 收到元事件时调用 |
| 定时任务 | `handleCron()` | `handle_cron()` | Cron 表达式触发时调用 |
| AI 工具执行 | `executeTool(sender, args)` | `execute_tool(sender, args)` | AI 调用工具时执行 |
| 停止 | `onStop()` | `on_stop()` | 插件卸载前调用，用于清理资源 |

> **loaded 模式**的插件 runtime 不会创建实例，因此 `onStart`、`handleMessage` 等钩子**不会被调用**。

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
| 获取数据 | `await this.db.get(key)` | `self.db.get(key)` | 获取指定 key 的值 |
| 设置数据 | `await this.db.set(key, value)` | `self.db.set(key, value)` | 设置 key-value |
| 删除数据 | `await this.db.delete(key)` | `self.db.delete(key)` | 删除指定 key |
| 列出键 | `await this.db.list(prefix?)` | `self.db.list(prefix="")` | 列出指定前缀的 key |
| 检查存在 | `await this.db.has(key)` | `self.db.has(key)` | 检查 key 是否存在 |

> 函数式插件中通过 `Plugin.db` 访问。

### LZDB 全局数据库

`LZDB` 是全局数据库对象，可在任何插件中使用（包括 loaded 模式）：

```javascript
// Node.js
await LZDB.set('global_key', 'value');
const val = await LZDB.get('global_key');
```

```python
# Python
LZDB.set("global_key", "value")
val = LZDB.get("global_key")
```

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取 | `await LZDB.get(ns, key)` | `LZDB.get(ns, key)` | 获取指定命名空间的数据 |
| 设置 | `await LZDB.set(ns, key, value)` | `LZDB.set(ns, key, value)` | 设置数据 |
| 删除 | `await LZDB.delete(ns, key)` | `LZDB.delete(ns, key)` | 删除数据 |
| 列出 | `await LZDB.list(ns, prefix?)` | `LZDB.list(ns, prefix="")` | 列出 key |
| 检查 | `await LZDB.has(ns, key)` | `LZDB.has(ns, key)` | 检查存在 |

> 当 `ns` 和 `key` 都传入时操作指定命名空间；只传一个参数时，`ns` 默认为插件自身命名空间。

## 定时任务

在 metadata 中声明 `cron` 表达式，框架会按计划调用 `handleCron`：

```javascript
// Node.js
class TimerPlugin extends Plugin {
    async handleCron() {
        // 每天早上 8 点执行
        await LinkZone.sendGroupMessage('group_123', '早上好！');
    }
}

TimerPlugin.metadata = {
    name: 'morning-greeting',
    cron: '0 8 * * *',
    lifecycle_mode: 'persistent'
};

module.exports = TimerPlugin;
```

```python
# Python
class TimerPlugin(Plugin):
    def handle_cron(self):
        LinkZone.send_group_message("group_123", "早上好！")

TimerPlugin.metadata = {
    "name": "morning-greeting",
    "cron": "0 8 * * *",
    "lifecycle_mode": "persistent"
}
```

## 日志

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 调试 | `this.log.debug(msg)` | `self.log.debug(msg)` | DEBUG 级别日志 |
| 信息 | `this.log.info(msg)` | `self.log.info(msg)` | INFO 级别日志 |
| 警告 | `this.log.warn(msg)` | `self.log.warn(msg)` | WARN 级别日志 |
| 错误 | `this.log.error(msg)` | `self.log.error(msg)` | ERROR 级别日志 |

> 函数式插件中通过 `Plugin.log` 访问。日志级别可通过 `config_schema` 中的 `log_level` 配置项控制。

## 插件间通信

### 发送消息

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 发送群消息 | `await LinkZone.sendGroupMessage(groupId, content)` | `LinkZone.send_group_message(group_id, content)` | 向指定群发送消息 |
| 发送私聊消息 | `await LinkZone.sendPrivateMessage(userId, content)` | `LinkZone.send_private_message(user_id, content)` | 向指定用户发送私聊 |

### 事件推送

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 推送事件 | `await LinkZone.pushEvent(event)` | `LinkZone.push_event(event)` | 向框架推送自定义事件 |

### HTTP 请求

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| HTTP GET | `await LinkZone.httpGet(url, headers?)` | `LinkZone.http_get(url, headers={})` | 发起 GET 请求 |
| HTTP POST | `await LinkZone.httpPost(url, body, headers?)` | `LinkZone.http_post(url, body, headers={})` | 发起 POST 请求 |

> HTTP 请求通过主进程代理发送，避免插件直接暴露网络。

## 配置访问

插件可通过 `sender.getConfig()` 获取用户在管理后台配置的值：

```javascript
async handleMessage(sender) {
    const config = await sender.getConfig();
    const apiKey = config.api_key;
    const maxRetries = config.max_retries || 3;
}
```

## 热重载

框架支持插件热重载，修改插件代码后自动重新加载，无需重启服务：

- **transient** 插件：下次触发时自动使用新代码
- **persistent** 插件：检测到文件变更后自动重启
- **loaded** 插件：下次被 require 时使用新代码

热重载时会依次调用 `onStop()` → 卸载旧实例 → 加载新代码 → 调用 `onStart()`。

## 错误处理

插件中的未捕获异常会被 SDK 自动捕获并记录日志，不会导致 runtime 崩溃：

```javascript
async handleMessage(sender) {
    try {
        const result = await riskyOperation();
        await sender.reply(result);
    } catch (err) {
        this.log.error(`处理失败: ${err.message}`);
        await sender.reply('处理出错，请稍后重试');
    }
}
```

## 完整示例

```javascript
class WeatherPlugin extends Plugin {
    async onStart() {
        this.log.info('天气插件已启动');
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
        const data = await this.db.get(`weather_${city}`);

        if (data) {
            await sender.reply(data);
        } else {
            const result = await LinkZone.httpGet(
                `https://api.weather.com?city=${city}&key=${config.api_key}`
            );
            await this.db.set(`weather_${city}`, result);
            await sender.reply(result);
        }
    }

    async handleCron() {
        // 每天早上 8 点推送天气
        const cities = await this.db.list('weather_');
        for (const key of cities) {
            const city = key.replace('weather_', '');
            const result = await LinkZone.httpGet(
                `https://api.weather.com?city=${city}`
            );
            await this.db.set(key, result);
        }
    }

    async executeTool(sender, args) {
        const { city } = args;
        const data = await this.db.get(`weather_${city}`);
        return { success: true, content: data || '暂无数据' };
    }

    async onStop() {
        this.log.info('天气插件已停止');
    }
}

WeatherPlugin.metadata = {
    name: 'weather',
    version: '1.0.0',
    description: '天气查询',
    triggers: [{ type: 0, pattern: '/weather' }],
    cron: '0 8 * * *',
    lifecycle_mode: 'persistent',
    tool: {
        enabled: true,
        usage: '查询天气',
        when_to_use: '用户询问天气时',
        parameters: [
            { name: 'city', type: 'string', description: '城市', required: true }
        ]
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
