# 元信息定义

元信息（Metadata）描述了插件的基本属性、触发条件、行为模式等，框架根据元信息来注册和调度插件。

## 完整字段速查

### 基础信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 是 | - | 组件唯一标识，注册后不可重复 |
| `version` | string | 否 | `""` | 语义化版本号 |
| `description` | string | 否 | `""` | 组件描述 |
| `category` | string | 否 | `""` | 分类 |
| `author` | string | 否 | `""` | 作者 |
| `homepage` | string | 否 | `""` | 主页 |
| `license` | string | 否 | `""` | 许可证 |
| `icon` | string | 否 | `""` | 图标 |
| `tags` | string[] | 否 | `[]` | 标签 |
| `dependencies` | string[] | 否 | `[]` | 依赖的其他组件 |

### 触发器

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `triggers` | Trigger[] | 否 | `[]` | 触发器列表 |
| `event_types` | string[] | 否 | `["message"]` | 订阅的事件类型 |

### 行为与权限

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `priority` | number | 否 | `0` | 优先级，值越小越先执行 |
| `is_service` | boolean | 否 | `false` | 是否为服务插件 |
| `permission_level` | number | 否 | `1` | 权限等级要求（1-7，6=管理员，7=超级管理员） |
| `listen_only` | boolean | 否 | `false` | 只听模式，可在只听群触发 |
| `stage` | number | 否 | `0` | 执行阶段（0=顺序 / 1=并行） |
| `adapters` | string[] | 否 | `[]` | 限定适配器平台 |
| `owner` | string | 否 | `"nodejs-runtime"` | 所有者 |
| `lifecycle_mode` | string | 否 | 自动推断 | 生命周期模式 |
| `is_public` | boolean | 否 | `false` | 是否上架插件市场 |
| `is_encrypted` | boolean | 否 | `true` | 是否加密（默认加密，设为 `false` 表示开源插件） |

### 配置与监控

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `config_schema` | object | 否 | `{}` | 插件配置表单定义，用户可在 Web 后台填写 |
| `extra` | object | 否 | `{}` | 扩展字段，存储自定义元数据 |

### AI 触发

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `tool` | ToolConfig | 否 | `null` | AI 工具配置 |
| `ai_triggerable` | boolean | 否 | `false` | 是否可被 AI 触发 |
| `ai_trigger_usage` | string | 否 | `""` | AI 触发时的使用说明 |
| `ai_trigger_format` | string | 否 | `""` | 命令格式模板 |
| `ai_trigger_args` | object | 否 | `{}` | 参数说明 |

### 生命周期模式

| 值 | 说明 | 自动推断条件 |
|-----|------|-------------|
| `"transient"` | 瞬态，按需启动 | 有触发器、事件类型或 cron 时 |
| `"persistent"` | 持久，一直运行 | `is_service = true` 时 |
| `"loaded"` | 只加载，不启动 | 无触发器、非服务、无 cron 时 |

### 注释语法对照

在插件文件头部使用注释声明元信息，框架会自动解析：

| 注释 | 对应字段 | 示例 |
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
| `@priority` | priority | `@priority 10` |
| `@permission-level` | permission_level | `@permission-level 1` |
| `@stage` | stage | `@stage parallel` |
| `@lifecycle` | lifecycle_mode | `@lifecycle persistent` |
| `@service` | is_service | `@service true` |
| `@cron` | cron | `@cron 0 8 * * *` |
| `@public true` | is_public | `@public true` |
| `@encrypted false` | is_encrypted | `@encrypted false` |
| `@listen-only true` | listen_only | `@listen-only true` |
| `@config-schema` | config_schema | `@config-schema {"key":{"type":"string"}}` |
| `@tool` | tool | 见 AI 工具插件章节 |

### 定时任务

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `cron` | string | 否 | `""` | Cron 表达式 |

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
module.exports = {
    metadata: {
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
    },
    async handleMessage(sender) {
        const city = await sender.param(0);
        // 查询天气...
        await sender.reply(`${city}今天晴，25°C`);
    },
    async executeTool(ctx, args) {
        const { city, days } = args;
        // 查询天气...
        return { success: true, content: `${city}今天晴，25°C` };
    }
};
```
