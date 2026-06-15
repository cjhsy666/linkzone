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
| `owner` | string | 否 | `"nodejs-runtime"` | 组件所有者 |
| `platform` | string | 否 | `""` | 适配器平台标识（适配器必填） |

### 触发器

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `triggers` | Trigger[] | 否 | `[]` | 触发器列表 |
| `event_types` | string[] | 否 | `["message"]` | 订阅的事件类型：`"message"` / `"notice"` / `"meta"`。有触发器时自动设为 `["message"]` |

### 行为与权限

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `priority` | number | 否 | `0` | 优先级，值越小越先执行 |
| `is_service` | boolean | 否 | `false` | 是否为服务插件（自动设为 persistent 模式） |
| `permission_level` | number | 否 | `1` | 触发权限等级，范围 1-7。用户/群的等级 ≥ 插件等级才能触发。1-5 为普通用户，6-7 为管理员 |
| `listen_only` | boolean | 否 | `false` | 只听模式，可在只听群触发 |
| `stage` | number | 否 | `0` | 执行阶段（0=顺序 / 1=并行） |
| `adapters` | string[] | 否 | `[]` | 限定适配器平台（如 `['qq', 'web']`），留空=全部 |
| `lifecycle_mode` | string | 否 | 自动推断 | 生命周期模式 |
| `is_public` | boolean | 否 | `false` | 是否上架插件市场 |
| `is_encrypted` | boolean | 否 | `true` | 是否加密 |

### 生命周期模式

| 值 | 说明 | 适用场景 |
|-----|------|---------|
| `"transient"` | 瞬态，按需启动，处理完消息后空闲 | 命令、关键词、定时任务等普通插件 |
| `"persistent"` | 持久，启动后一直运行，适合后台服务 | 监控、轮询、长连接服务 |
| `"loaded"` | 只加载注册元信息，不实例化、不启动 | 工具库、被其他插件 require 的辅助模块 |

**自动推断规则**（未显式指定 `lifecycle_mode` 时，默认为 `transient`）：

| 条件 | 建议设置 |
|------|---------|
| `is_service: true` | `persistent` |
| 工具库/辅助模块，不需要处理消息 | `loaded` |
| 普通插件（命令、关键词、定时任务） | `transient`（默认值） |

> **注意**：loaded 模式的插件 runtime **不会创建实例，不会调用任何钩子**（包括 `onStart`）。如需初始化，应在模块顶层执行。loaded 模式插件不能使用 `this.db`/`self.db`，只能用 `LZDB`。

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

### AI 触发

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `tool` | ToolConfig | 否 | `null` | AI 工具配置（直接调用模式） |
| `ai_triggerable` | boolean | 否 | `false` | 是否可被 AI 触发（注入调用模式） |
| `ai_trigger_usage` | string | 否 | `""` | AI 触发时的使用说明 |
| `ai_trigger_format` | string | 否 | `""` | 命令格式模板 |
| `ai_trigger_args` | object | 否 | `{}` | 参数说明 |

### 注释语法对照

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
| `@owner` | owner | `@owner nodejs-runtime` |
| `@platform` | platform | `@platform qq` |
| `@priority` | priority | `@priority 10` |
| `@permission-level` | permission_level | `@permission-level 6`（数字 1-7） |
| `@stage` | stage | `@stage 1` |
| `@lifecycle` | lifecycle_mode | `@lifecycle persistent` |
| `@service` | is_service | `@service true` |
| `@cron` | cron | `@cron 0 8 * * *` |
| `@public true` | is_public | `@public true` |
| `@encrypted false` | is_encrypted | `@encrypted false` |
| `@listen-only true` | listen_only | `@listen-only true` |
| `@config-schema` | config_schema | `@config-schema {"key":{"type":"string"}}` |
| `@extra` | extra | `@extra {"key":"value"}` |
| `@ai-triggerable` | ai_triggerable | `@ai-triggerable true` |
| `@ai-trigger-usage` | ai_trigger_usage | `@ai-trigger-usage 查询天气` |
| `@ai-trigger-format` | ai_trigger_format | `@ai-trigger-format /weather <城市>` |
| `@ai-trigger-args` | ai_trigger_args | `@ai-trigger-args {"city":{"type":"string","required":true}}` |
| `@tool` | tool | `@tool` 后接 JSON 块 |

### config_schema 详解

`config_schema` 定义插件的可配置项，框架据此在管理后台生成配置界面：

```javascript
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

框架会自动为所有组件追加 `log_level` 配置项。

## 示例

### 最小化插件

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

### 完整配置插件

```javascript
class WeatherPlugin extends Plugin {
    async handleMessage(sender) {
        const city = await sender.param(0);
        // 查询天气...
        await sender.reply(`${city}今天晴，25°C`);
    }

    async executeTool(sender, args) {
        const { city, days } = args;
        // 查询天气...
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
    event_types: ['message'],
    priority: 10,
    permission_level: 1,
    adapters: ['qq', 'web'],
    lifecycle_mode: 'persistent',
    tool: {
        enabled: true,
        usage: '查询指定城市的天气信息',
        when_to_use: '当用户询问天气、气温、是否下雨等问题时',
        parameters: [
            { name: 'city', type: 'string', description: '城市名称', required: true },
            { name: 'days', type: 'number', description: '预报天数', required: false, default: 1 }
        ]
    },
    ai_triggerable: true,
    ai_trigger_usage: '查询天气信息',
    ai_trigger_format: '/weather {city}',
    ai_trigger_args: { city: '城市名称' }
};

module.exports = WeatherPlugin;
```
