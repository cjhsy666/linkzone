# AI 工具插件

AI 工具插件允许智能体在对话中自动调用插件功能。当用户的需求匹配工具描述时，LLM 会自动选择并调用对应工具。

## 两种调用模式

### 注入调用（Injectable）

适合已有命令式插件，只需设置 `ai_triggerable: true`，AI 会通过 inject 工具将命令注入到消息流中，触发插件的 `handleMessage` 方法。

```javascript
metadata: {
    name: 'smarthome',
    ai_triggerable: true,
    ai_trigger_usage: '控制智能家居设备',
    ai_trigger_format: '{operation}{device}',
    ai_trigger_args: {
        operation: '操作：开/关/切换',
        device: '设备名称'
    }
}
```

AI 看到用户说"开客厅灯"时，会自动注入命令 `开客厅灯`，触发插件的 `handleMessage`。

### 直接调用（Tool）

适合为 AI 专门设计的工具，配置 `tool` 字段并提供 `executeTool` 方法，AI 通过 Function Calling 直接传入结构化参数。

```javascript
metadata: {
    name: 'weather',
    tool: {
        enabled: true,
        usage: '查询天气信息',
        when_to_use: '当用户询问天气、气温等问题时',
        parameters: [
            { name: 'city', type: 'string', description: '城市名称', required: true },
            { name: 'days', type: 'number', description: '预报天数', required: false, default: 1 }
        ],
        continue: true,
        max_calls: 3
    }
}
```

AI 看到用户问"北京天气怎么样"时，会直接调用 `executeTool(ctx, { city: '北京', days: 1 })`。

### 如何选择

| 场景 | 推荐模式 |
|------|---------|
| 已有命令插件，想让 AI 也能触发 | 注入调用 |
| 为 AI 专门开发新工具 | 直接调用 |
| 需要链式调用多个工具 | 直接调用 |
| 需要结构化参数和返回值 | 直接调用 |
| 简单的命令触发即可 | 注入调用 |

## 注入调用配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `ai_triggerable` | boolean | 设为 `true` 启用注入调用 |
| `ai_trigger_usage` | string | 工具用途描述，帮助 AI 判断何时使用 |
| `ai_trigger_format` | string | 命令格式模板，如 `{operation}{device}` |
| `ai_trigger_args` | object | 参数说明，如 `{ operation: "操作类型" }` |

## 直接调用配置

### ToolConfig 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enabled` | boolean | 是 | 是否启用工具 |
| `parameters` | ToolParameter[] | 是 | 参数定义 |
| `usage` | string | 是 | 工具用途描述 |
| `when_to_use` | string | 否 | 何时使用此工具 |
| `continue` | boolean | 否 | 调用后是否继续对话 |
| `chainable` | boolean | 否 | 是否可链式调用 |
| `max_calls` | number | 否 | 单次对话最大调用次数 |
| `confirm` | boolean | 否 | 是否需要用户确认 |
| `cooldown` | number | 否 | 冷却时间（秒） |
| `timeout` | number | 否 | 超时时间（秒） |

### ToolParameter 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 参数名 |
| `type` | string | 是 | 参数类型（string / number / boolean / array） |
| `description` | string | 是 | 参数描述 |
| `required` | boolean | 是 | 是否必填 |
| `enum` | string[] | 否 | 可选值列表 |
| `default` | any | 否 | 默认值 |
| `example` | string | 否 | 示例值 |

## 完整示例

### 注入调用示例（Node.js）

```javascript
module.exports = {
    metadata: {
        name: 'translate',
        version: '1.0.0',
        description: '翻译工具',
        triggers: [{ type: 0, pattern: '/translate' }],
        event_types: ['message'],
        ai_triggerable: true,
        ai_trigger_usage: '翻译文本',
        ai_trigger_format: '/translate {text}',
        ai_trigger_args: { text: '要翻译的文本' }
    },
    async handleMessage(sender) {
        const text = await sender.param(0);
        // 翻译逻辑...
        await sender.reply(`翻译结果: ${text}`);
    }
};
```

### 直接调用示例（Node.js）

```javascript
module.exports = {
    metadata: {
        name: 'weather',
        version: '1.0.0',
        description: '天气查询工具',
        triggers: [{ type: 0, pattern: '/weather' }],
        event_types: ['message'],
        tool: {
            enabled: true,
            usage: '查询指定城市的天气信息',
            when_to_use: '当用户询问天气、气温、是否下雨等问题时',
            parameters: [
                {
                    name: 'city',
                    type: 'string',
                    description: '城市名称',
                    required: true,
                    example: '北京'
                },
                {
                    name: 'days',
                    type: 'number',
                    description: '预报天数',
                    required: false,
                    default: 1
                }
            ],
            continue: true,
            max_calls: 3
        }
    },
    async handleMessage(sender) {
        const city = await sender.param(0);
        const result = await this.queryWeather(city);
        await sender.reply(result);
    },
    async executeTool(ctx, args) {
        const { city, days } = args;
        const result = await this.queryWeather(city, days);
        return {
            success: true,
            content: result
        };
    },
    async queryWeather(city, days = 1) {
        return `${city}今天晴，25°C`;
    }
};
```

### 直接调用示例（Python）

```python
metadata = {
    "name": "weather",
    "version": "1.0.0",
    "description": "天气查询工具",
    "triggers": [{"type": 0, "pattern": "/weather"}],
    "event_types": ["message"],
    "tool": {
        "enabled": True,
        "usage": "查询指定城市的天气信息",
        "when_to_use": "当用户询问天气、气温、是否下雨等问题时",
        "parameters": [
            {"name": "city", "type": "string", "description": "城市名称", "required": True},
            {"name": "days", "type": "number", "description": "预报天数", "required": False, "default": 1}
        ],
        "continue": True,
        "max_calls": 3
    }
}

async def handle_message(sender):
    city = await sender.param(0)
    result = await query_weather(city)
    await sender.reply(result)

async def execute_tool(ctx, args):
    city = args["city"]
    days = args.get("days", 1)
    result = await query_weather(city, days)
    return {"success": True, "content": result}

async def query_weather(city, days=1):
    return f"{city}今天晴，25°C"
```

## ToolResult 格式

`executeTool` 方法必须返回 `ToolResult` 对象：

```javascript
{
    success: true,          // 是否成功
    content: "结果文本",     // 结果内容（LLM 会读取此内容）
    data: {},               // 可选的结构化数据
    error: "",              // 错误信息（success=false 时）
    continue: true          // 可选，覆盖是否继续对话
}
```

## 工具权限

工具的 `permission_level` 控制哪些用户可以触发：

```javascript
metadata: {
    permission_level: 5,  // VIP 及以上用户才能通过 AI 调用
    tool: { ... }
}
```

## 工具执行上下文

`executeTool` 的 `ctx` 参数提供执行上下文：

```javascript
async executeTool(ctx, args) {
    console.log(ctx.agent_id);    // 智能体 ID
    console.log(ctx.user_id);     // 用户 ID
    console.log(ctx.group_id);    // 群组 ID
    console.log(ctx.platform);    // 平台
}
```
