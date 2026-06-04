# 工具系统

工具系统允许智能体在对话中调用外部功能，如查询天气、执行代码、搜索网页等。基于 OpenAI Function Calling 规范，支持插件工具和 MCP 工具。

## 工具来源

### 插件工具

插件可以注册为 AI 工具，智能体在对话中自动调用。详见 [AI 工具插件](/plugin-dev/ai-tool)。

```javascript
metadata: {
    tool: {
        enabled: true,
        usage: '查询天气',
        parameters: [
            { name: 'city', type: 'string', required: true }
        ]
    }
}
```

### MCP 工具

通过 MCP（Model Context Protocol）服务器提供的工具：

```json
{
  "tools": {
    "enabled": true,
    "mcp_servers": [
      {
        "name": "filesystem",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
      },
      {
        "name": "web",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-fetch"]
      }
    ]
  }
}
```

## 配置

```json
{
  "tools": {
    "enabled": true,
    "allowed_plugins": ["weather", "translate"],
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

## 工具属性

| 属性 | 说明 |
|------|------|
| `enabled` | 是否启用 |
| `usage` | 工具用途描述 |
| `parameters` | 参数定义 |
| `max_calls` | 单次对话最大调用次数 |
| `confirm` | 是否需要用户确认 |
| `cooldown` | 冷却时间（秒） |
| `timeout` | 超时时间（秒） |
| `chainable` | 是否可链式调用 |
