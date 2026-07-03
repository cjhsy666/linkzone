# 元信息定义

元信息（Metadata）描述了插件的基本属性、触发条件、行为模式等，框架根据元信息来注册和调度插件。

## 完整字段速查

### 基础信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 是 | - | 组件唯一标识，注册后不可重复 |
| `version` | string | 否 | `"1.0.0"` | 语义化版本号 |
| `description` | string | 否 | `""` | 组件描述 |
| `category` | string | 否 | `""` | 分类 |
| `author` | string | 否 | `""` | 作者 |
| `homepage` | string | 否 | `""` | 主页 |
| `license` | string | 否 | `""` | 许可证 |
| `icon` | string | 否 | `""` | 图标 |
| `tags` | string[] | 否 | `[]` | 标签 |
| `dependencies` | string[] | 否 | `[]` | 依赖的其他组件 |
| `platform` | string | 否 | `""` | 适配器平台标识（适配器必填） |

### 触发器

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `command` | string \| string[] | 否 | - | 命令触发简写，等价 `triggers: [{ type: 0, pattern }]` |
| `keyword` | string \| string[] | 否 | - | 关键词触发简写，等价 `triggers: [{ type: 1, pattern }]` |
| `regex` | string \| string[] | 否 | - | 正则触发简写，等价 `triggers: [{ type: 2, pattern }]` |
| `triggers` | Trigger[] | 否 | `[]` | 完整触发器列表（高级场景，如段触发） |
| `adapter_events` | string[] | 否 | `["message"]` | 订阅的适配器事件类型（六类）：`"meta"` / `"message"` / `"notice"` / `"request"` / `"interaction"` / `"raw"`。**默认值规则**：存在消息类触发器（command/keyword/regex/segment）时自动设为 `["message"]`；仅含事件触发器（`@event`，type=4）时不填，由 Go 端走兜底分支匹配非消息事件 |
| `subscribe` | string[] | 否 | `[]` | 订阅的框架内部事件列表。声明后，`onEvent(event)` 会在对应事件触发时被调用 |

> **简写示例**：`command: '/hello'` 等价于 `triggers: [{ type: 0, pattern: '/hello' }]`，`keyword: ['天气', 'weather']` 等价于两个 type:1 触发器。简写和 `triggers` 可以同时使用，SDK 会自动合并。

**框架内部事件列表**：

| 事件名 | 说明 | Data |
|--------|------|------|
| `bot.started` | 框架启动完成 | `null` |
| `bot.stopped` | 框架停止 | `null` |
| `bot.restart` | 框架重启 | `null` |
| `adapter.connected` | 适配器连接 | `{ adapter, platform, timestamp }` |
| `adapter.disconnected` | 适配器断开 | `{ adapter, platform, timestamp }` |
| `plugin.loaded` | 插件加载 | `{ name, unique_key, version, author, timestamp }` |
| `plugin.unloaded` | 插件卸载 | `{ unique_key, name, timestamp }` |
| `config.changed` | 配置变更 | config 对象 |
| `state.changed` | 组件状态变更 | `{ component, enabled, timestamp }` |
| `error.reported` | 错误上报 | error 对象 |
| `message.received` | 收到消息 | 消息 event 对象 |

### 行为与权限

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `priority` | number | 否 | `0` | 优先级，值越小越先执行 |
| `is_service` | boolean | 否 | `false` | 是否为服务插件（启动时调用 onStart，插件持续运行） |
| `permission_level` | number | 否 | `1` | 触发权限等级，范围 1-7。用户/群的等级 ≥ 插件等级才能触发。1-5 为普通用户，6-7 为管理员 |
| `listen_only` | boolean | 否 | `false` | 只听模式，可在只听群触发 |
| `stage` | number | 否 | `0` | 执行阶段（0=顺序 / 1=并行） |
| `adapters` | string[] | 否 | `[]` | 限定适配器平台（如 `['qq', 'web']`），留空=全部 |
| `is_public` | boolean | 否 | `false` | 是否上架插件市场 |
| `is_encrypted` | boolean | 否 | `true` | 是否加密 |
| `market` | boolean | 否 | `false` | 是否从市场安装 |

### 配置与监控

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `config_schema` | object | 否 | `{}` | 插件配置表单定义 |
| `autoMetrics` / `auto_metrics` | boolean | 否 | `true` | 是否自动上报消息处理耗时和错误（SDK 行为） |
| `extra` | object | 否 | `{}` | 扩展字段，存储自定义元数据 |

### 定时任务

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `cron` | string | 否 | `""` | Cron 表达式 |

Cron 表达式支持 **5 位标准格式**和 **6 位含秒格式**：

| 格式 | 字段 | 示例 |
|------|------|------|
| 5 位（推荐） | `分 时 日 月 周` | `0 9 * * *` |
| 6 位 | `秒 分 时 日 月 周` | `0 0 9 * * *` |

5 位表达式会自动补秒位为 `0`（整分执行），两种格式效果相同。

常用示例：

| 表达式 | 说明 |
|--------|------|
| `*/5 * * * *` | 每 5 分钟 |
| `0 * * * *` | 每小时 |
| `0 9 * * *` | 每天 9 点 |
| `0 9 * * 1` | 每周一 9 点 |
| `30 8,18 * * *` | 每天 8:30 和 18:30 |

### AI 配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `ai` | object | 否 | `null` | AI 配置对象，包含 `tool`（工具模式）和 `inject`（注入模式），两者可并存 |

**`ai` 对象结构**：

```javascript
ai: {
    // 工具模式：AI 通过 function calling 直接调用 executeTool
    tool: {
        parameters: [                             // 参数列表
            { name: 'city', type: 'string', description: '城市名', required: true }
        ],
        usage: '查询天气',                        // 使用说明（给 LLM 看）
        when_to_use: '用户询问天气时使用',         // 何时调用（给 LLM 看）
        continue: false,                          // 工具调用后是否继续对话（默认 false）
        chainable: true,                          // 是否可链式调用（默认 true，设为 false 终止 loop）
        max_calls: 0,                             // 单次对话最大调用次数（0=不限）
        confirm: false,                           // 是否需要用户确认后执行
        cooldown: 0,                              // 冷却时间（秒），用户级生效
        timeout: 0                                // 超时时间（秒）
    },

    // 注入模式：AI 通过全局 inject 工具注入命令，触发 handleEvent
    inject: {
        usage: 'qq点歌 七里香',                    // 使用示例（给 LLM 看）
        format: '{platform}点歌 {song}',           // 命令格式模板
        args: {                                   // 参数说明（一句话描述）
            platform: '音乐平台，可选：qq/网易云/汽水',
            song: '歌曲名称，如：晴天'
        }
    }
}
```

> 工具名称和描述自动使用插件的 `name` 和 `description`，无需在 `tool` 中重复指定。

**`ai.tool.parameters` 子字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 参数名 |
| `type` | string | 是 | 参数类型：`string`/`number`/`boolean`/`array`/`object` |
| `description` | string | 是 | 参数描述 |
| `required` | boolean | 否 | 是否必填，默认 `false` |
| `enum` | string[] | 否 | 枚举值列表 |
| `default` | any | 否 | 默认值 |
| `example` | string | 否 | 示例值 |

**`ai.inject.args` 写法规范**：

args 的值是一句话描述，写给 LLM 看，要包含「是什么 + 能填什么 + 默认什么」：

```javascript
args: {
    song: '歌曲名称，必填。只填歌名不填歌手，如：晴天',
    platform: '平台可选值：qq/网易云/汽水/抖音/酷我，默认咪咕'
}
```

> **两种模式对比**：
> - `tool` — LLM 有结构化参数，调用更精确，走 `executeTool`，不经过消息管道
> - `inject` — 走消息管道，其他插件可联动，经过权限检查，但 LLM 需构造命令字符串

### config_schema 详解

`config_schema` 定义插件的可配置项，框架据此在管理后台生成配置界面：

```javascript
// Node.js
config_schema: {
    api_key: {
        type: 'string',           // 类型：string / number / bool / select
        label: 'API Key',         // 显示名称
        default: '',              // 默认值
        description: '服务 API 密钥',  // 说明
        required: true            // 是否必填
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

```python
# Python
config_schema = {
    "api_key": {
        "type": "string",
        "label": "API Key",
        "default": "",
        "description": "服务 API 密钥",
        "required": True
    },
    "max_retries": {
        "type": "number",
        "label": "最大重试次数",
        "default": 3,
        "description": "API 请求最大重试次数"
    },
    "sandbox": {
        "type": "bool",
        "label": "沙箱模式",
        "default": False,
        "description": "是否使用沙箱环境"
    },
    "mode": {
        "type": "select",
        "label": "运行模式",
        "default": "websocket",
        "description": "连接方式",
        "options": [
            {"label": "WebSocket", "value": "websocket"},
            {"label": "HTTP 长轮询", "value": "long_polling"}
        ]
    }
}
```

框架会自动为所有组件追加 `log_level` 配置项。

## 注释语法对照

在插件文件头部使用注释声明元信息，框架会自动解析：

| 注解 | 对应字段 | 示例 |
|------|---------|------|
| `@name` | name | `@name my-plugin` |
| `@version` | version | `@version 1.0.0` |
| `@description` | description | `@description 插件说明` |
| `@author` | author | `@author LinkZone Team` |
| `@category` | category | `@category 工具` |
| `@icon` | icon | `@icon 🌤️` |
| `@license` | license | `@license MIT` |
| `@homepage` | homepage | `@homepage https://example.com` |
| `@tags` | tags | `@tags 天气,查询` |
| `@dependencies` | dependencies | `@dependencies utils,http` |
| `@adapters` | adapters | `@adapters qq,web` |
| `@platform` | platform | `@platform qq` |
| `@priority` | priority | `@priority 10` |
| `@permission-level` | permission_level | `@permission-level 6`（数字 1-7） |
| `@stage` | stage | `@stage 1` |
| `@service` | is_service | `@service true` |
| `@cron` | cron | `@cron 0 8 * * *` |
| `@public true` | is_public | `@public true` |
| `@encrypted false` | is_encrypted | `@encrypted false` |
| `@listen-only true` | listen_only | `@listen-only true` |
| `@config-schema` | config_schema | `@config-schema {"key":{"type":"string"}}` |
| `@extra` | extra | `@extra {"key":"value"}` |
| `@command` | triggers (type:0) | `@command /hello` |
| `@keyword` | triggers (type:1) | `@keyword 天气` |
| `@rule` | triggers (type:2) | `@rule ^\\d+$` |
| `@segment` | triggers (type:3) | `@segment image` |
| `@subscribe` | subscribe | `@subscribe adapter.connected,config.changed` |
| `@ai-triggerable` | ai.inject（标记启用注入模式） | `@ai-triggerable true` |
| `@ai-trigger-usage` | ai.inject.usage | `@ai-trigger-usage qq点歌 七里香` |
| `@ai-trigger-format` | ai.inject.format | `@ai-trigger-format {platform}点歌 {song}` |
| `@ai-trigger-args` | ai.inject.args | `@ai-trigger-args {"song":"歌曲名称"}` |

> 注释语法只支持 `ai.inject`（注入模式），不支持声明 `ai.tool`（直接调用模式）。如需启用 tool 模式，必须在 metadata 中显式声明 `ai.tool` 对象。

## 示例

### 最小化插件

```javascript
// Node.js
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

```python
# Python
metadata = {
    "name": "echo",
    "version": "1.0.0",
    "description": "回声插件",
    "triggers": [{"type": 0, "pattern": "/echo"}]
}

def handle_event(sender):
    sender.reply(sender.get_message())
```

### 完整配置插件

```javascript
// Node.js
class WeatherPlugin extends Plugin {
    async handleEvent(sender) {
        const city = await sender.param(0);
        await sender.reply(`${city}今天晴，25°C`);
    }

    async executeTool(sender, args) {
        const { city, days } = args;
        return { success: true, content: `${city}今天晴，25°C` };
    }
}

WeatherPlugin.metadata = {
    name: 'weather',
    version: '1.2.0',
    description: '天气查询插件',
    category: '工具',
    author: 'LinkZone Team',
    tags: ['天气', '查询'],
    triggers: [
        { type: 0, pattern: '/weather' },
        { type: 1, pattern: '天气' }
    ],
    adapter_events: ['message'],
    priority: 10,
    permission_level: 1,
    adapters: ['qq', 'web'],
    is_service: true,
    ai: {
        tool: {
            parameters: [
                { name: 'city', type: 'string', description: '城市名称', required: true },
                { name: 'days', type: 'number', description: '预报天数', required: false, default: 1 }
            ],
            usage: '查询指定城市的天气信息',
            when_to_use: '当用户询问天气、气温、是否下雨等问题时'
        },
        inject: {
            usage: '查询天气信息',
            format: '/weather {city}',
            args: { city: '城市名称' }
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

```python
# Python
class WeatherPlugin(Plugin):
    def handle_event(self, sender):
        city = sender.param(0)
        sender.reply(f"{city}今天晴，25°C")

    def execute_tool(self, sender, args):
        city = args.get("city")
        days = args.get("days", 1)
        return {"success": True, "content": f"{city}今天晴，25°C"}

WeatherPlugin.metadata = {
    "name": "weather",
    "version": "1.2.0",
    "description": "天气查询插件",
    "category": "工具",
    "author": "LinkZone Team",
    "tags": ["天气", "查询"],
    "triggers": [
        {"type": 0, "pattern": "/weather"},
        {"type": 1, "pattern": "天气"}
    ],
    "adapter_events": ["message"],
    "priority": 10,
    "permission_level": 1,
    "adapters": ["qq", "web"],
    "is_service": True,
    "ai": {
        "tool": {
            "parameters": [
                {"name": "city", "type": "string", "description": "城市名称", "required": True},
                {"name": "days", "type": "number", "description": "预报天数", "required": False, "default": 1}
            ],
            "usage": "查询指定城市的天气信息",
            "when_to_use": "当用户询问天气、气温、是否下雨等问题时"
        },
        "inject": {
            "usage": "查询天气信息",
            "format": "/weather {city}",
            "args": {"city": "城市名称"}
        }
    },
    "config_schema": {
        "api_key": {
            "type": "string",
            "label": "API Key",
            "required": True
        }
    }
}
```
