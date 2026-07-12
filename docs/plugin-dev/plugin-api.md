# Plugin API

Plugin 是插件基类，提供了生命周期钩子、数据库访问、定时任务、日志、插件间通信等核心能力。

> **全局变量**：Node.js 和 Python 的 SDK 对象（`Plugin`、`Sender`、`LinkZone`、`LZDB`）由 runtime 自动注入为全局变量，**无需 `require` 或 `import`**。

## 生命周期钩子

| 钩子 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 启动 | `onStart()` | `on_start()` | 插件实例化后调用，用于初始化 |
| 消息处理 | `handleEvent(sender)` | `handle_event(sender)` | 收到匹配消息时调用 |
| 框架事件 | `onEvent(event)` | `on_event(event)` | 收到框架内部事件时调用（需在 metadata.subscribe 中声明） |
| 定时任务 | `onCron()` | `on_cron()` | Cron 表达式触发时调用 |
| AI 工具执行 | `executeTool(sender, args)` | `execute_tool(sender, args)` | AI 调用工具时执行 |
| 停止 | `onStop()` | `on_stop()` | 插件卸载前调用，用于清理资源 |

> **工具库模式**的插件 runtime 不会创建实例，因此 `onStart`、`handleEvent` 等钩子**不会被调用**。

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
    async handleEvent(sender) {
        await sender.reply(sender.getMessage());
    }
};
```

### Node.js - 类式

```javascript
class HelloPlugin extends Plugin {
    async handleEvent(sender) {
        await sender.reply(`你好，${sender.getSenderName()}！`);
    }
}

HelloPlugin.metadata = {
    name: 'hello',
    version: '1.0.0',
    description: '问候插件',
    triggers: [{ type: 0, pattern: '/hello' }],
    adapter_events: ['message']
};

module.exports = HelloPlugin;
```

> **Node.js 注意**：类式插件必须使用**静态属性** `MyPlugin.metadata = {...}` 定义元信息，runtime 在创建实例之前读取。不要写 `super({ name: 'xxx', ... })`，runtime 不会读取 constructor 内的 metadata。
>
> **Python 注意**：Python 类式插件推荐使用**模块级变量** `metadata = {...}` 定义元信息，与函数式插件保持一致。不要在 `__init__` 中通过 `super().__init__(metadata or {...})` 传 metadata，这种写法不匹配 runtime 的正则提取规则（`metadata\s*=\s*\{...\}`），会导致插件被跳过。runtime 创建实例时会自动将解析到的 metadata 传给构造函数。

### Python - 函数式

```python
# SDK 对象由 runtime 自动注入，无需 import

def handle_event(sender):
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

metadata = {
    "name": "hello",
    "version": "1.0.0",
    "description": "问候插件",
    "triggers": [{"type": 0, "pattern": "/hello"}],
    "adapter_events": ["message"]
}

class HelloPlugin(Plugin):
    def handle_event(self, sender):
        sender.reply(f"你好，{sender.get_sender_name()}！")
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
metadata = {
    "name": "morning-greeting",
    "cron": "0 8 * * *",
    "is_service": True
}

class TimerPlugin(Plugin):
    def on_cron(self):
        LinkZone.push("qq", "group_123", "早上好！")
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
LinkZone.logger.info('module', '普通信息');
LinkZone.logger.error('module', '错误信息');
// 只传一个参数时，module 默认为当前插件名
LinkZone.logger.info('这条日志的 module 自动为当前插件名');
```

```python
# Python
LinkZone.logger.info("module", "普通信息")
LinkZone.logger.error("module", "错误信息")
# 只传一个参数时，module 默认为当前插件名
LinkZone.logger.info("这条日志的 module 自动为当前插件名")
```

> 完整日志 API（快捷方法、结构化日志、条件日志、计时器、子日志等）详见插件开发文档。

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
async handleEvent(sender) {
    const config = await sender.getConfig();
    const apiKey = config.api_key;
    const maxRetries = config.max_retries || 3;
}
```

```python
def handle_event(self, sender):
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

## 青龙面板 API

通过 `LinkZone.qinglong` 访问青龙面板的全部 API。使用前需先通过管理接口配置青龙面板连接信息。

### 服务状态

```javascript
// Node.js
const { connected } = await LinkZone.qinglong.status();
const config = await LinkZone.qinglong.getConfig();
await LinkZone.qinglong.setConfig({
    url: 'http://192.168.1.100:5700',
    client_id: 'xxx',
    client_secret: 'xxx'
});
```

```python
# Python
result = LinkZone.qinglong.status()
connected = result.get("connected", False)
config = LinkZone.qinglong.get_config()
LinkZone.qinglong.set_config({
    "url": "http://192.168.1.100:5700",
    "client_id": "xxx",
    "client_secret": "xxx"
})
```

### 定时任务管理 (cron)

```javascript
// Node.js
const tasks = await LinkZone.qinglong.cron.list('搜索关键词');
const task = await LinkZone.qinglong.cron.get(taskId);
const newTask = await LinkZone.qinglong.cron.create({
    command: 'task extra/daily_bonus.js',
    schedule: '0 9 * * *',
    name: '每日签到',
    labels: ['签到']
});
await LinkZone.qinglong.cron.update({ id: task.id, schedule: '0 10 * * *' });
await LinkZone.qinglong.cron.delete([task.id]);
await LinkZone.qinglong.cron.run([task.id]);
await LinkZone.qinglong.cron.stop([task.id]);
await LinkZone.qinglong.cron.enable([task.id]);
await LinkZone.qinglong.cron.disable([task.id]);
const { content } = await LinkZone.qinglong.cron.log(String(task.id));
const logs = await LinkZone.qinglong.cron.logs(String(task.id));
await LinkZone.qinglong.cron.pin([task.id]);
await LinkZone.qinglong.cron.unpin([task.id]);
await LinkZone.qinglong.cron.addLabels([task.id], ['新标签']);
await LinkZone.qinglong.cron.deleteLabels([task.id], ['旧标签']);
await LinkZone.qinglong.cron.import();
```

```python
# Python
tasks = LinkZone.qinglong.cron.list("搜索关键词")
task = LinkZone.qinglong.cron.get(str(task_id))
new_task = LinkZone.qinglong.cron.create(
    command="task extra/daily_bonus.js",
    schedule="0 9 * * *",
    name="每日签到",
    labels=["签到"]
)
LinkZone.qinglong.cron.update(task["id"], schedule="0 10 * * *")
LinkZone.qinglong.cron.delete([task["id"]])
LinkZone.qinglong.cron.run([task["id"]])
LinkZone.qinglong.cron.stop([task["id"]])
LinkZone.qinglong.cron.enable([task["id"]])
LinkZone.qinglong.cron.disable([task["id"]])
result = LinkZone.qinglong.cron.log(str(task["id"]))
logs = LinkZone.qinglong.cron.logs(str(task["id"]))
LinkZone.qinglong.cron.pin([task["id"]])
LinkZone.qinglong.cron.unpin([task["id"]])
LinkZone.qinglong.cron.add_labels([task["id"]], ["新标签"])
LinkZone.qinglong.cron.delete_labels([task["id"]], ["旧标签"])
LinkZone.qinglong.cron.import_crons()
```

### 环境变量管理 (env)

```javascript
// Node.js
const envs = await LinkZone.qinglong.env.list('COOKIE');
await LinkZone.qinglong.env.create([
    { name: 'JD_COOKIE', value: 'pt_key=xxx;pt_pin=yyy;', remarks: '账号1' }
]);
await LinkZone.qinglong.env.update({ id: 1, name: 'JD_COOKIE', value: '新值' });
await LinkZone.qinglong.env.delete([1, 2]);
await LinkZone.qinglong.env.enable([1]);
await LinkZone.qinglong.env.disable([1]);
const env = await LinkZone.qinglong.env.get(1);
await LinkZone.qinglong.env.move(1, 0, 2);
await LinkZone.qinglong.env.updateName([1, 2], 'NEW_NAME');
```

```python
# Python
envs = LinkZone.qinglong.env.list("COOKIE")
LinkZone.qinglong.env.create([
    {"name": "JD_COOKIE", "value": "pt_key=xxx;pt_pin=yyy;", "remarks": "账号1"}
])
LinkZone.qinglong.env.update(1, "JD_COOKIE", "新值")
LinkZone.qinglong.env.delete([1, 2])
LinkZone.qinglong.env.enable([1])
LinkZone.qinglong.env.disable([1])
env = LinkZone.qinglong.env.get(1)
LinkZone.qinglong.env.move(1, 0, 2)
LinkZone.qinglong.env.update_name([1, 2], "NEW_NAME")
```

### 订阅管理 (subscription)

```javascript
// Node.js
const subs = await LinkZone.qinglong.subscription.list();
const sub = await LinkZone.qinglong.subscription.create({
    name: '京东脚本',
    url: 'https://github.com/example/jd_scripts.git',
    branch: 'main',
    schedule: '0 0 * * *'
});
await LinkZone.qinglong.subscription.update({ id: sub.id, schedule: '0 12 * * *' });
await LinkZone.qinglong.subscription.delete([sub.id]);
await LinkZone.qinglong.subscription.run([sub.id]);
await LinkZone.qinglong.subscription.stop([sub.id]);
await LinkZone.qinglong.subscription.enable([sub.id]);
await LinkZone.qinglong.subscription.disable([sub.id]);
const { content } = await LinkZone.qinglong.subscription.log(sub.id);
```

```python
# Python
subs = LinkZone.qinglong.subscription.list()
sub = LinkZone.qinglong.subscription.create(
    name="京东脚本",
    url="https://github.com/example/jd_scripts.git",
    branch="main",
    schedule="0 0 * * *"
)
LinkZone.qinglong.subscription.update(sub["id"], schedule="0 12 * * *")
LinkZone.qinglong.subscription.delete([sub["id"]])
LinkZone.qinglong.subscription.run([sub["id"]])
LinkZone.qinglong.subscription.stop([sub["id"]])
LinkZone.qinglong.subscription.enable([sub["id"]])
LinkZone.qinglong.subscription.disable([sub["id"]])
result = LinkZone.qinglong.subscription.log(sub["id"])
```

### 脚本管理 (script)

```javascript
// Node.js
const scripts = await LinkZone.qinglong.script.list();
const { content } = await LinkZone.qinglong.script.get('daily_bonus.js');
const detail = await LinkZone.qinglong.script.detail('daily_bonus.js');
await LinkZone.qinglong.script.save({
    name: 'my_script.js',
    content: 'console.log("Hello from LinkZone!")'
});
await LinkZone.qinglong.script.delete('my_script.js');
await LinkZone.qinglong.script.run('my_script.js');
await LinkZone.qinglong.script.stop('my_script.js');
await LinkZone.qinglong.script.rename('old.js', 'new.js');
```

```python
# Python
scripts = LinkZone.qinglong.script.list()
result = LinkZone.qinglong.script.get("daily_bonus.js")
detail = LinkZone.qinglong.script.detail("daily_bonus.js")
LinkZone.qinglong.script.save("my_script.js", 'print("Hello from LinkZone!")')
LinkZone.qinglong.script.delete("my_script.js")
LinkZone.qinglong.script.run("my_script.js")
LinkZone.qinglong.script.stop("my_script.js")
LinkZone.qinglong.script.rename("old.js", "new.js")
```

### 系统操作 (system)

```javascript
// Node.js
const { version } = await LinkZone.qinglong.system.info();
const update = await LinkZone.qinglong.system.checkUpdate();
await LinkZone.qinglong.system.update();
await LinkZone.qinglong.system.reload('config');
await LinkZone.qinglong.system.notify('任务完成', '所有签到任务已执行完毕');
await LinkZone.qinglong.system.commandRun('ql repo');
await LinkZone.qinglong.system.commandStop({ pid: 12345 });
const data = await LinkZone.qinglong.system.exportData();
```

```python
# Python
info = LinkZone.qinglong.system.info()
update = LinkZone.qinglong.system.check_update()
LinkZone.qinglong.system.update()
LinkZone.qinglong.system.reload("config")
LinkZone.qinglong.system.notify("任务完成", "所有签到任务已执行完毕")
LinkZone.qinglong.system.command_run("ql repo")
LinkZone.qinglong.system.command_stop(pid=12345)
data = LinkZone.qinglong.system.export_data()
```

### 依赖管理 (dependence)

```javascript
// Node.js
const deps = await LinkZone.qinglong.dependence.list('', 0); // type: 0=nodejs
await LinkZone.qinglong.dependence.create([
    { name: 'axios', type: 0, remark: 'HTTP 客户端' }
]);
await LinkZone.qinglong.dependence.delete([1, 2]);
await LinkZone.qinglong.dependence.forceDelete([1]);
await LinkZone.qinglong.dependence.reinstall([1]);
await LinkZone.qinglong.dependence.cancel([1]);
```

```python
# Python
deps = LinkZone.qinglong.dependence.list("", 0)  # type: 0=nodejs
LinkZone.qinglong.dependence.create([
    {"name": "requests", "type": 1, "remark": "HTTP 库"}
])
LinkZone.qinglong.dependence.delete([1, 2])
LinkZone.qinglong.dependence.force_delete([1])
LinkZone.qinglong.dependence.reinstall([1])
LinkZone.qinglong.dependence.cancel([1])
```

### 配置文件管理 (config)

```javascript
// Node.js
const files = await LinkZone.qinglong.config.list();
const { content } = await LinkZone.qinglong.config.get('config.sh');
await LinkZone.qinglong.config.save({
    name: 'config.sh',
    content: 'export JD_COOKIE="pt_key=xxx;pt_pin=yyy;"'
});
```

```python
# Python
files = LinkZone.qinglong.config.list()
result = LinkZone.qinglong.config.get("config.sh")
LinkZone.qinglong.config.save("config.sh", 'export JD_COOKIE="pt_key=xxx;pt_pin=yyy;"')
```

### 日志管理 (log)

```javascript
// Node.js
const logs = await LinkZone.qinglong.log.list();
const { content } = await LinkZone.qinglong.log.detail('run.log', '/ql/data/log');
await LinkZone.qinglong.log.delete({ filename: 'old.log', path: '/ql/data/log' });
```

```python
# Python
logs = LinkZone.qinglong.log.list()
result = LinkZone.qinglong.log.detail("run.log", "/ql/data/log")
LinkZone.qinglong.log.delete("old.log", "/ql/data/log")
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
async handleEvent(sender) {
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

    async handleEvent(sender) {
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
