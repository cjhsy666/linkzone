# 工具系统

工具系统允许智能体在对话中调用外部功能，如查询天气、执行代码、搜索网页等。基于 OpenAI Function Calling 规范，支持插件工具和 MCP 工具。

## 工具调用方式

AI 工具插件有两种调用方式，均通过插件元信息（metadata）的 `ai` 字段配置：

### 1. 注入调用（inject）

插件在 metadata 中配置 `ai.inject` 对象，AI 通过全局 inject 工具将命令注入到消息流中触发插件。

特点：
- 插件复用已有的 `handleEvent` 逻辑，无需新增方法
- AI 根据 `ai.inject.format` 构造命令字符串
- 走完整消息管道，经过权限检查，其他插件可联动
- 适合已有命令式插件快速接入 AI

### 2. 直接调用（tool）

插件在 metadata 中配置 `ai.tool` 对象并提供 `executeTool` 方法，AI 通过 Function Calling 直接调用。

特点：
- AI 直接传入结构化参数，无需拼接命令
- 返回结构化 `ToolResult`，AI 可继续推理
- 支持链式调用、超时控制、调用次数限制
- 适合为 AI 专门设计的工具

### 对比

| | 注入调用（inject） | 直接调用（tool） |
|--|---------|---------|
| 配置字段 | `ai.inject` | `ai.tool` |
| 入口方法 | `handleEvent` | `executeTool` |
| 参数传递 | 命令文本（AI 按 `format` 拼接） | 结构化 JSON |
| 返回结果 | 插件通过 `sender.reply()` 自行回复 | `ToolResult` 对象 |
| 链式调用 | 不支持 | 支持 |
| 消息管道 | 经过（含权限检查、其他插件联动） | 不经过 |
| 适用场景 | 已有命令插件快速接入 | 为 AI 专门设计的工具 |

> 两种模式可并存：同时声明 `ai.tool` 和 `ai.inject` 即可。详见 [AI 工具插件](/plugin-dev/ai-tool)。

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

## 智能体工具配置

在管理后台 → 智能体管理中，编辑智能体的工具配置：

- **enabled**：是否启用工具
- **allowed_plugins**：限制可用的插件工具列表
- **mcp_servers**：MCP 服务器列表

## 工具属性（`ai.tool`）

`ai.tool` 对象的字段：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `parameters` | Parameter[] | `[]` | 参数定义列表 |
| `usage` | string | `""` | 工具用途描述（给 LLM 看） |
| `when_to_use` | string | `""` | 何时使用此工具（给 LLM 看） |
| `continue` | boolean | `false` | 工具调用后是否继续对话 |
| `chainable` | boolean | `true` | 是否可链式调用（false 表示调用后立即终止 loop） |
| `max_calls` | number | `0` | 单次对话最大调用次数（0=不限） |
| `confirm` | boolean | `false` | 是否需要用户确认后执行 |
| `cooldown` | number | `0` | 冷却时间（秒），用户级生效 |
| `timeout` | number | `0` | 超时时间（秒） |

> 工具名称和描述自动使用插件的 `name` 和 `description`，无需在 `ai.tool` 中重复指定。完整字段说明详见 [元信息定义](/plugin-dev/metadata#ai-配置)。
