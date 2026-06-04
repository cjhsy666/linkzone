# AI 配置

AI 是 LinkZone 框架内的一个核心服务，负责 LLM 对话、技能匹配、知识库检索、工具调用等。当消息被路由到智能体时，由 AI 服务处理。

## 核心能力

| 能力 | 说明 |
|------|------|
| LLM 对话 | 支持 30+ 供应商，统一接口调用 |
| 技能系统 | 可扩展的 AI 技能，支持规则/LLM/混合匹配 |
| 知识库 RAG | 文档检索增强生成，支持多种文档格式 |
| 工具调用 | Function Calling / Tool Use，插件即工具 |
| 多模态 | 图片、音频、视频理解 |
| 情感分析 | 识别用户情绪，调整回复风格 |
| 人设管理 | 可定制的 AI 角色和性格 |
| 上下文记忆 | 短期上下文 + 长期记忆 + 用户画像 |

## 快速配置

AI 功能通过智能体配置启用。通过 API 或 Web 后台创建智能体：

```bash
curl -X POST http://localhost:8080/api/v1/admin/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "default",
    "config": {
      "enabled": true,
      "personality": {
        "name": "小助手",
        "custom_identity": "你是一个友好的AI助手"
      },
      "runtime": {
        "default": {
          "model": "deepseek-chat",
          "temperature": 0.7
        }
      }
    }
  }'
```

配置完成后，在群组中 @机器人 或发送消息即可触发 AI 对话。

## 与其他功能联动

- **AI + 插件**：插件可注册为 AI 工具，AI 自主决定何时调用插件功能
- **AI + 智能家居**：AI 可通过智能家居插件控制设备（"帮我把客厅灯打开"）
- **AI + API 暴露**：通过 OpenAI/Anthropic 兼容 API，外部客户端可直接接入框架 AI 能力

## 详细配置

- [LLM 配置](/ai/llm) — 支持的供应商和配置方式
- [技能系统](/ai/skill) — 创建和管理 AI 技能
- [知识库](/ai/knowledge) — 文档检索增强生成
- [工具系统](/ai/tool) — Function Calling 配置
- [上下文与记忆](/ai/memory) — 对话上下文和长期记忆
- [多模态](/ai/multimodal) — 图片、音频、视频理解
