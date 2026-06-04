# 工具系统

工具系统允许智能体在对话中调用外部功能，如查询天气、执行代码、搜索网页等。基于 OpenAI Function Calling 规范，支持插件工具和 MCP 工具。

## 工具调用方式

AI 工具插件有两种调用方式：

### 1. 注入调用

插件设置 `ai_triggerable: true`，AI 通过 inject 工具将命令注入到消息流中触发插件。

```
用户消息 → AI 判断需要调用 → inject 注入命令 → 插件通过 handleMessage 处理 → 返回结果
```

特点：
- 插件复用已有的 `handleMessage` 逻辑
- AI 通过 `ai_trigger_format` 知道命令格式
- 适合已有命令式插件快速接入 AI

### 2. 直接调用

插件配置 `tool` 字段并提供 `executeTool` 方法，AI 通过 Function Calling 直接调用。

```
用户消息 → AI 判断需要调用 → Function Calling → executeTool(ctx, args) → 返回结构化结果
```

特点：
- AI 直接传入结构化参数，无需拼接命令
- 返回结构化 `ToolResult`，AI 可继续推理
- 支持链式调用、超时控制、调用次数限制
- 适合为 AI 专门设计的工具

### 对比

| | 注入调用 | 直接调用 |
|--|---------|---------|
| 配置字段 | `ai_triggerable: true` | `tool: { enabled: true, ... }` |
| 入口方法 | `handleMessage` | `executeTool` |
| 参数传递 | 命令文本 | 结构化 JSON |
| 返回结果 | 插件自行回复 | `ToolResult` 对象 |
| 链式调用 | 不支持 | 支持 |
| 适用场景 | 已有命令插件快速接入 | 为 AI 专门设计的工具 |

## 工具来源

### 插件工具

插件可以注册为 AI 工具，智能体在对话中自动调用。详见 [AI 工具插件](/plugin-dev/ai-tool)。

### MCP 工具

通过 MCP（Model Context Protocol）服务器提供的工具，在智能体配置中添加 MCP 服务器即可：

```json
{
  "tools": {
    "enabled": true,
    "mcp_servers": [
      {
        "name": "filesystem",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
      }
    ]
  }
}
```

## 配置

在管理后台 → 智能体管理中，编辑智能体的工具配置：

- **enabled**：是否启用工具
- **allowed_plugins**：限制可用的插件工具列表
- **mcp_servers**：MCP 服务器列表

## 工具属性

| 属性 | 说明 |
|------|------|
| `enabled` | 是否启用 |
| `usage` | 工具用途描述 |
| `when_to_use` | 何时使用此工具 |
| `parameters` | 参数定义 |
| `max_calls` | 单次对话最大调用次数 |
| `confirm` | 是否需要用户确认 |
| `cooldown` | 冷却时间（秒） |
| `timeout` | 超时时间（秒） |
| `chainable` | 是否可链式调用 |
