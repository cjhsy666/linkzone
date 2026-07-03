# 智能体配置

智能体是 LinkZone 中负责 AI 对话的核心模块。每个智能体拥有独立的人设、模型配置、记忆、技能和工具。

## 配置入口

智能体通过 Web 后台进行配置：打开 **管理后台 → 智能体管理**，即可创建、编辑和管理智能体。

配置修改后即时生效，无需重启。

## 人设配置（personality）

人设决定智能体的"性格"和"说话方式"：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 智能体名称 |
| `custom_identity` | string | 自定义身份描述 |
| `custom_role_bounds` | string | 角色边界 |
| `backstory` | string | 背景故事 |
| `relationship_style` | string | 关系风格 |
| `speech_style` | string | 说话风格 |
| `humor_style` | string | 幽默风格 |
| `response_length` | string | 回复长度偏好 |
| `proactive_rules` | string | 主动发言规则 |
| `taboo_topics` | []string | 禁忌话题 |
| `behavior_rules` | string | 行为规则 |
| `custom_constraints` | string | 自定义约束 |
| `custom_safety` | string | 自定义安全规则 |
| `traits` | []string | 性格特征，如 `["友善", "幽默", "随和"]` |
| `emojis` | []string | 常用表情，如 `["😂", "👍"]` |
| `catchphrase` | []string | 口头禅，如 `["确实", "有道理"]` |
| `visual_style` | string | 视觉描述风格 |
| `examples` | []DialogueExample | 对话示例 |
| `disabled_sections` | []string | 禁用的提示词段，可精确控制提示词构建 |

**示例：**

```json
{
  "personality": {
    "name": "小助手",
    "custom_identity": "你是一个友好的AI助手",
    "speech_style": "口语化、简短、偶尔用表情",
    "traits": ["友善", "幽默", "随和"],
    "emojis": ["😂", "🤣", "👍"],
    "catchphrase": ["确实", "有道理"],
    "examples": [
      { "user": "你好", "bot": "嗨！有什么我可以帮你的吗？" },
      { "user": "今天天气怎么样", "bot": "让我帮你查一下~" }
    ]
  }
}
```

## 模型配置（runtime）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `default.model` | string | `"gpt-4o-mini"` | 默认模型 |
| `default.temperature` | float | `0.7` | 温度参数 |
| `default.max_tokens` | int | `2048` | 最大输出 Token |
| `default.enable_tools` | bool | `true` | 是否启用工具调用 |
| `default.enable_stream` | bool | `false` | 是否启用流式输出 |
| `default.max_tool_loops` | int | `5` | 最大工具调用循环次数 |
| `default.timeout_seconds` | int | `60` | 超时时间（秒） |
| `default.fallback` | object | `null` | 兜底回复配置（`{enabled, replies}`） |
| `scenes` | map | — | 场景化模型配置 |

可以为不同场景设置不同的模型参数：

```json
{
  "runtime": {
    "default": {
      "model": "deepseek-chat",
      "temperature": 0.7,
      "max_tokens": 2048
    },
    "scenes": {
      "chat": { "temperature": 0.7, "max_tokens": 2048 },
      "assist": { "temperature": 0.6, "max_tokens": 2048 },
      "task": { "temperature": 0.3, "max_tokens": 1024 }
    }
  }
}
```

## 聊天配置（chat）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `talk_value` | float | `0.15` | 说话概率（0~1） |
| `mentioned_reply` | bool | `true` | 被 @ 时是否回复 |
| `max_context_size` | int | `30` | 最大上下文长度 |
| `planner_smooth` | int | `3` | 规划平滑值，控制回复节奏 |
| `think_mode` | string | `"dynamic"` | 思考模式 |
| `enable_talk_value_rules` | bool | `false` | 是否启用按规则调整说话概率 |
| `talk_value_rules` | TalkValueRule[] | `[]` | 说话概率调整规则（启用后生效） |
| `min_delay` | int | `500` | 最小回复延迟（毫秒） |
| `max_delay` | int | `3000` | 最大回复延迟（毫秒） |
| `min_interval` | int | `10000` | 最小发言间隔（毫秒） |
| `trigger_words` | []string | `[]` | 触发词列表 |
| `active_hours` | []int | `[9..22]` | 活跃时段 |
| `silent_threshold` | int | `20` | 沉默阈值，连续 N 条消息未触发后进入沉默 |
| `rate_limit_rps` | float | `2` | 限流 RPS（0 不限） |
| `rate_limit_burst` | int | `5` | 限流突发量 |
| `message_merge_wait` | int | `5000` | 消息合并等待时间（毫秒） |
| `message_merge_max` | int | `10` | 消息合并最大条数 |
| `private` | PrivateChatConfig | — | 私聊配置（见下表） |

私聊配置（`chat.private`）：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | `false` | 是否允许私聊 |
| `allowed_users` | []string | `[]` | 允许私聊的用户列表（空=全部允许） |
| `blocked_users` | []string | `[]` | 拉黑的用户列表 |
| `always_reply` | bool | `true` | 是否总是回复私聊 |
| `talk_value` | float | `1` | 私聊话痨值（通常为 1，总是回复） |

## 记忆配置（memory）

详细字段见 [上下文与记忆](/ai/memory)。

## 工具配置（tools）

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | bool | 是否启用工具 |
| `allowed_plugins` | []string | 允许的插件工具列表（空=全部） |
| `mcp_servers` | []MCPServerConfig | MCP 服务器配置 |

MCP 服务器配置：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 服务器名称 |
| `command` | string | 启动命令 |
| `args` | []string | 命令参数 |
| `env` | []string | 环境变量 |

详见 [工具系统](/ai/tool)。

## 技能配置（skills）

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | bool | 是否启用技能 |
| `allow_all` | bool | 允许所有技能 |
| `allowed` | []string | 允许的技能列表 |
| `match_strategy` | string | 匹配策略（rule/llm/hybrid） |
| `debug` | bool | 是否开启技能调试日志 |

详见 [技能系统](/ai/skill)。

## 多模态配置（multimodal）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | `true` | 是否启用多模态 |
| `enable_image` | bool | `true` | 图片理解 |
| `enable_audio` | bool | `true` | 音频理解 |
| `enable_video` | bool | `true` | 视频理解 |
| `image_model` | string | `""` | 图片理解模型（空则使用默认模型） |
| `max_image_size` | int | `5120` | 图片最大大小（KB） |
| `image_wait_seconds` | int | `3` | 图片等待时间（秒） |

详见 [多模态](/ai/multimodal)。

## 表情配置（expression）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable_sticker` | bool | `true` | 是否启用表情包 |
| `sticker_rate` | float | `0.1` | 表情包发送概率 |
| `emoji_chance` | float | `0.4` | Emoji 发送概率 |
| `max_reg_num` | int | `100` | 表情包最大注册数量 |
| `steal_emoji` | bool | `true` | 是否偷取群内表情 |
| `emoji_inline` | bool | `true` | 是否内联 Emoji |
| `expression_groups` | string[][] | `[]` | 表情分组（用于按场景选择不同表情组） |

## 群组绑定智能体

在管理后台 → 群组管理中，可以为每个群组：

- **绑定** 一个智能体（仅该智能体响应）
- **启用** 多个智能体（启用的智能体均可响应）
- 不做任何配置时，使用系统默认智能体

一条消息需要 AI 响应时，框架按以下优先级选择智能体：

1. 群官方绑定智能体
2. 群启用的智能体列表
3. 用户群组上下文偏好
4. 系统默认智能体
