# AI 工具插件

AI 工具插件允许智能体在对话中自动调用插件功能。当用户的需求匹配工具描述时，LLM 会自动选择并调用对应工具。

## 概述

AI 工具插件的工作流程：

```
用户消息 → 智能体 → LLM 判断需要调用工具 → 选择工具 → 执行工具 → 返回结果 → LLM 生成回复
```

## 工具配置

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
| `type` | string | 是 | 参数类型（string / number / boolean） |
| `description` | string | 是 | 参数描述 |
| `required` | boolean | 是 | 是否必填 |
| `enum` | string[] | 否 | 可选值列表 |
| `default` | any | 否 | 默认值 |
| `example` | string | 否 | 示例值 |

## 注册 AI 工具

### Node.js

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
        },
        ai_triggerable: true,
        ai_trigger_usage: '查询天气信息',
        ai_trigger_format: '/weather {city}',
        ai_trigger_args: { city: '城市名称' }
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
        // 实际查询逻辑
        return `${city}今天晴，25°C`;
    }
};
```

### Python

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
        "continue": True
    },
    "ai_triggerable": True,
    "ai_trigger_usage": "查询天气信息",
    "ai_trigger_format": "/weather {city}",
    "ai_trigger_args": {"city": "城市名称"}
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

## OpenAI Function Calling 格式

框架会自动将 `ToolConfig` 转换为 OpenAI Function Calling 格式：

```json
{
    "type": "function",
    "function": {
        "name": "weather",
        "description": "查询指定城市的天气信息",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称"
                },
                "days": {
                    "type": "number",
                    "description": "预报天数",
                    "default": 1
                }
            },
            "required": ["city"]
        }
    }
}
```

## AI 触发说明

`ai_triggerable`、`ai_trigger_usage`、`ai_trigger_format`、`ai_trigger_args` 字段帮助 LLM 理解何时以及如何使用此工具：

- **ai_triggerable**：设为 `true` 后，此工具会出现在智能体的工具列表中
- **ai_trigger_usage**：描述工具的用途，帮助 LLM 判断是否需要调用
- **ai_trigger_format**：命令格式模板，如 `/weather {city}`
- **ai_trigger_args**：参数说明，如 `{ city: "城市名称" }`

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
    // ctx 包含调用者信息
    console.log(ctx.agent_id);    // 智能体 ID
    console.log(ctx.user_id);     // 用户 ID
    console.log(ctx.group_id);    // 群组 ID
    console.log(ctx.platform);    // 平台
}
```
