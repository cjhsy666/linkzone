# 插件开发概述

LinkZone 支持 Node.js 和 Python 两种语言开发插件。插件通过 SDK 与框架核心通信，可以处理消息、注册命令、调用框架 API 等。

## 插件结构

### Node.js 插件

```
plugins/
  my-plugin/
    index.js          # 插件入口
    package.json      # 可选，声明依赖
```

### Python 插件

```
plugins/
  my-plugin/
    hello.py          # 插件入口
```

## 第一个插件

### Node.js

```javascript
const { Plugin } = require('linkzone-sdk');

class HelloPlugin extends Plugin {
    constructor() {
        super({
            name: 'hello',
            version: '1.0.0',
            description: '问候插件',
            triggers: [{ type: 0, pattern: '/hello' }],
            event_types: ['message']
        });
    }

    async handleMessage(sender) {
        await sender.reply(`你好，${sender.getSenderName()}！`);
    }
}

module.exports = HelloPlugin;
```

### Python

```python
from linkzone import Plugin, create_plugin

class HelloPlugin(Plugin):
    def __init__(self):
        super().__init__({
            "name": "hello",
            "version": "1.0.0",
            "description": "问候插件",
            "triggers": [{"type": 0, "pattern": "/hello"}],
            "event_types": ["message"]
        })

    async def handle_message(self, sender):
        await sender.reply(f"你好，{sender.get_sender_name()}！")

create_plugin(HelloPlugin)
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
const { createPlugin } = require('linkzone-sdk');

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

async def handle_message(sender):
    await sender.reply(f"你好，{sender.get_sender_name()}！")
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

async def handle_message(sender):
    await sender.reply(f"你好，{sender.get_sender_name()}！")
```

## 插件生命周期

插件支持以下生命周期钩子，按调用顺序排列：

| 钩子 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 加载 | 插件加载时调用（注册、初始化资源） | `onLoad()` | `on_load()` |
| 启动 | 插件启动时调用（连接服务、开始工作） | `onStart()` | `on_start()` |
| 重载 | 配置变更时调用（热更新） | `onReload()` | `on_reload()` |
| 停止 | 插件停止时调用（清理资源） | `onStop()` | `on_stop()` |
| 卸载 | 插件卸载时调用（释放所有资源） | `onUnload()` | `on_unload()` |
| 消息处理 | 收到消息时调用 | `handleMessage(sender)` | `handle_message(sender)` |
| 事件处理 | 收到事件时调用 | `handleEvent(sender)` | `handle_event(sender)` |
| 定时任务 | Cron 触发时调用 | `onCron()` | `on_cron()` |

### 生命周期流程

```
加载(onLoad) → 启动(onStart) → [运行中] → 停止(onStop) → 卸载(onUnload)
                      ↑                ↓
                      └── 重载(onReload) ┘
```

- **onLoad**：插件被框架发现并加载时调用，适合做静态资源初始化。此时插件尚未启动，不应执行业务逻辑。
- **onStart**：插件正式开始工作，可以启动连接、注册定时任务等。
- **onReload**：运行期间配置变更时调用，可在不重启插件的情况下更新行为。
- **onStop**：插件被停止时调用，应清理定时器、关闭连接等。
- **onUnload**：插件被卸载时调用，释放所有资源。之后插件不会再被启动。

## 插件放置位置

将插件文件放入 `ecosystems/nodejs/plugins/` 或 `ecosystems/python/plugins/` 目录，框架会自动发现并加载。

## 热重载

修改插件文件后，框架会自动检测变更并重新加载插件，无需重启。

## 错误处理与流程控制

### 消息处理结果

插件 `handleMessage` 的返回值影响后续插件链的执行：

| 返回值 | 行为 |
|--------|------|
| `nil` / 无返回 | 继续执行下一个插件 |
| `ErrNotHandled` | 本插件不处理，继续执行下一个插件 |
| `ErrStopPropagation` | 停止传播，后续插件不再执行 |

### Sender 流程控制

在消息处理中，可以通过 Sender 方法控制执行流程：

```javascript
// 中止后续插件执行
sender.abort();

// 显式继续执行后续插件
sender.continue();
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
