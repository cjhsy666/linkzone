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

插件支持以下生命周期钩子：

| 钩子 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 启动 | 插件启动时调用 | `onStart()` | `on_start()` |
| 停止 | 插件停止时调用 | `onStop()` | `on_stop()` |
| 消息处理 | 收到消息时调用 | `handleMessage(sender)` | `handle_message(sender)` |
| 事件处理 | 收到事件时调用 | `handleEvent(sender)` | `handle_event(sender)` |
| 定时任务 | Cron 触发时调用 | `onCron()` | `on_cron()` |

## 插件放置位置

将插件文件放入 `ecosystems/nodejs/plugins/` 或 `ecosystems/python/plugins/` 目录，框架会自动发现并加载。

## 热重载

修改插件文件后，框架会自动检测变更并重新加载插件，无需重启。

## 下一步

- [元信息定义](/plugin-dev/metadata) — 完整的元信息字段说明
- [触发器](/plugin-dev/triggers) — 各种触发方式详解
- [Sender API](/plugin-dev/sender-api) — 消息上下文 API
- [Plugin API](/plugin-dev/plugin-api) — 插件自身 API
- [AI 工具插件](/plugin-dev/ai-tool) — 注册 AI 可调用的工具
