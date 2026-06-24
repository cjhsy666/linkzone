# 插件开发概述

LinkZone 支持 Node.js 和 Python 两种语言开发插件。插件通过 SDK 与框架核心通信，可以处理消息、注册命令、调用框架 API 等。

## 全局变量

运行时已将 SDK 对象注入为全局变量，插件代码中**无需任何 require/import**，直接使用即可。

### Node.js

| 全局变量 | 说明 |
|----------|------|
| `Plugin` | 插件基类 |
| `Adapter` | 适配器基类 |
| `Sender` | 消息上下文类 |
| `LZDB` | 命名空间数据库类 |
| `LinkZone` | 全局模块（工具函数、消息段、数据库、日志、事件、HTTP、WebSocket 等） |
| `sleep` | 异步等待函数 `sleep(ms): Promise<void>` |

> `randomInt(min, max)` 未注入为全局变量，需通过 `LinkZone.randomInt(min, max)` 调用。

### Python

| 全局变量 | 说明 |
|----------|------|
| `Plugin` | 插件基类 |
| `Adapter` | 适配器基类 |
| `Sender` | 消息上下文类 |
| `LZDB` | 命名空间数据库类 |
| `LinkZone` | 全局模块 |
| `Database` | 数据库辅助类 |
| `sleep` | 等待函数（毫秒） |
| `random_int` | 随机整数函数 |

## 插件结构

### Node.js

```
plugins/
  my-plugin/
    hello.js          # 插件入口
```

> 每个 `.js` 文件就是一个独立组件。插件必须放在 `plugins/` 的**子目录**中，直接放在 `plugins/` 根目录下不会被加载。插件目录递归扫描，适配器目录只扫描一层。

### Python

```
plugins/
  my-plugin/
    hello.py          # 插件入口
```

> 每个 `.py` 文件就是一个独立插件。Runtime 递归扫描 `plugins/` 下所有子目录中的 `.py` 文件，放在根目录或子目录中均可。

## 第一个插件

### Node.js（类式，推荐）

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

> **重要**：类式插件的 metadata 必须以**静态属性**形式提供（`MyPlugin.metadata = {...}`），不要在 constructor 里调用 `super({...})` 传 metadata，runtime 不会读取 constructor 内的 metadata，导致插件被跳过。

### Python（类式，推荐）

```python
class HelloPlugin(Plugin):
    def __init__(self):
        super().__init__({
            "name": "hello",
            "version": "1.0.0",
            "description": "问候插件",
            "triggers": [{"type": 0, "pattern": "/hello"}],
            "event_types": ["message"]
        })

    def handle_message(self, sender):
        sender.reply(f"你好，{sender.get_sender_name()}！")
```

## 函数式插件

### Node.js

```javascript
module.exports = {
    metadata: {
        name: 'hello',
        version: '1.0.0',
        description: '问候插件',
        triggers: [{ type: 0, pattern: '/hello' }],
        event_types: ['message']
    },
    async handleMessage(sender) {
        await sender.reply(`你好，${sender.getSenderName()}！`);
    }
};
```

也可使用 `createPlugin` 工厂函数：

```javascript
module.exports = createPlugin({
    name: 'hello',
    version: '1.0.0',
    description: '问候插件',
    triggers: [{ type: 0, pattern: '/hello' }],
    event_types: ['message']
}, async (sender) => {
    await sender.reply(`你好，${sender.getSenderName()}！`);
});
```

### Python

```python
metadata = {
    "name": "hello",
    "version": "1.0.0",
    "description": "问候插件",
    "triggers": [{"type": 0, "pattern": "/hello"}],
    "event_types": ["message"]
}

def handle_message(sender):
    sender.reply(f"你好，{sender.get_sender_name()}！")
```

## 注解式插件

### Node.js

```javascript
/**
 * @name hello
 * @version 1.0.0
 * @description 问候插件
 * @command /hello
 */
module.exports = async function(sender) {
    await sender.reply(`你好，${sender.getSenderName()}！`);
};
```

### Python

```python
"""
@name hello
@version 1.0.0
@description 问候插件
@command /hello
"""

def handle_message(sender):
    sender.reply(f"你好，{sender.get_sender_name()}！")
```

## 插件生命周期

插件支持以下生命周期钩子，按调用顺序排列：

| 钩子 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 启动 | 插件启动时调用（连接服务、开始工作） | `onStart()` | `on_start()` |
| 停止 | 插件停止时调用（清理资源） | `onStop()` | `on_stop()` |
| 消息处理 | 收到消息时调用 | `handleMessage(sender)` | `handle_message(sender)` |
| 框架事件 | 收到框架内部事件时调用 | `onEvent(event)` | `on_event(event)` |
| 定时任务 | Cron 触发时调用 | `onCron()` | `on_cron()` |
| AI 工具调用 | AI 直接调用时 | `executeTool(sender, args)` | `execute_tool(sender, args)` |

> `executeTool` 的 sender 参数可能为 null/None（当工具不是由消息触发时），使用前务必做空值检查。

### 生命周期流程

框架根据元信息自动推断插件的运行模式，**开发者无需手动配置**：

**服务插件**（`is_service: true`）：
```
注册 → 启动(onStart) → [运行中，监听消息/cron/event] → 停止(onStop)
```

**普通插件**（有触发能力）：
```
注册 → [等待触发] → handleMessage → [等待下次触发]
```

**工具库**（无触发能力）：
```
注册 → [不启动、不触发、不实例化]
```

- **onStart**：插件正式开始工作，可以启动连接、注册定时任务等。仅在 `is_service: true` 时被调用。
- **onStop**：插件被停止时调用，应清理定时器、关闭连接等。
- **工具库模式**：runtime 不会创建实例，不会调用任何钩子。如需初始化，应在模块顶层执行。工具库模式不能使用 `this.db`/`self.db`，只能用 `LZDB`。

### 自动推断规则

框架根据以下条件自动推断运行模式：

| 条件 | 框架行为 |
|------|---------|
| `is_service: true` | 启动时调 `onStart()`，插件持续运行 |
| 有 `command`/`keyword`/`regex`/`triggers`/`cron`/`ai` | 按需触发 handler |
| 无任何触发能力 | 只注册元信息，不实例化 |

## 插件放置位置

将插件文件放入 `ecosystems/nodejs/plugins/` 或 `ecosystems/python/plugins/` 目录，框架会自动发现并加载。

## 热重载

插件文件修改后框架自动检测并重新加载，无需重启。如需禁用，设置环境变量 `LINKZONE_HOT_RELOAD=false`。

热重载行为：
- **普通插件**：检测到文件变更后自动卸载旧实例、加载新代码
- **服务插件**：调用 `onStop()` → 卸载旧实例 → 加载新代码 → 调用 `onStart()`
- **工具库**：下次被 require 时使用新代码

## 错误处理与流程控制

### 消息处理结果

插件 `handleMessage` 的返回值不影响后续插件链的执行。框架在消息处理完成后始终标记为已处理。

### Sender 流程控制

在消息处理中，可以通过 Sender 方法控制执行流程：

```javascript
// Node.js（异步，需 await）
await sender.abort();
await sender.continue();
```

```python
# Python（同步）
sender.abort()
sender.continue_()  # Python 中 continue 是关键字，方法名加下划线
```

### AI 工具错误处理

`executeTool` 应返回结构化的 `ToolResult`：

```javascript
// 成功
return { success: true, content: '结果文本' };

// 失败
return { success: false, error: '错误描述' };
```

框架会根据 `success` 字段决定是否让 AI 继续推理或报告错误。

## 下一步

- [元信息定义](/plugin-dev/metadata) — 完整的元信息字段说明
- [触发器](/plugin-dev/triggers) — 各种触发方式详解
- [Sender API](/plugin-dev/sender-api) — 消息上下文 API
- [Plugin API](/plugin-dev/plugin-api) — 插件自身 API（含扩展系统）
- [AI 工具插件](/plugin-dev/ai-tool) — 注册 AI 可调用的工具
- [LZDB 数据库](/plugin-dev/lzdb) — 插件数据存储
