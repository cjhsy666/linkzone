# 技能系统

技能是 AI 的可扩展能力单元，每个技能定义了特定的 AI 能力和触发条件，如代码生成、翻译、数据分析等。

## 匹配策略

智能体级别的匹配策略在 `skills.match_strategy` 中配置：

| 策略 | 标识 | 说明 |
|------|------|------|
| 规则匹配 | `rule` | 基于关键词/正则，速度快、确定性高 |
| LLM 匹配 | `llm` | 使用 LLM 判断是否激活，更灵活 |
| 混合匹配 | `hybrid` | 先尝试规则匹配，未命中再用 LLM |

## 智能体技能配置

在管理后台 → 智能体管理中，编辑智能体的技能配置：

```json
{
  "skills": {
    "enabled": true,
    "allow_all": true,
    "match_strategy": "hybrid"
  }
}
```

如需限制可用技能：

```json
{
  "skills": {
    "enabled": true,
    "allow_all": false,
    "allowed": ["translator", "code_review"],
    "match_strategy": "hybrid"
  }
}
```

## 技能定义结构

每个技能包含以下顶层字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 技能唯一 ID |
| `name` | string | 技能名称 |
| `description` | string | 描述（LLM 匹配时作为判断依据） |
| `version` | int | 版本号 |
| `enabled` | bool | 是否启用 |
| `match` | MatchSpec | 匹配条件 |
| `behavior` | BehaviorSpec | 行为模式 |
| `llm` | LLMSpec | LLM 参数覆盖 |
| `capabilities` | CapabilitySpec | 能力声明（工具/知识库） |
| `execution` | ExecutionSpec | 执行路由 |
| `policy` | PolicySpec | 策略（独占/可见性/冷却/等级） |
| `prompt_overrides` | map[string]string | 提示词覆盖 |

### match（匹配条件）

| 字段 | 类型 | 说明 |
|------|------|------|
| `keywords` | string[] | 关键词列表（消息包含任一即命中） |
| `regex` | string[] | 正则表达式列表 |
| `intents` | string[] | 意图标签列表 |
| `follow_up_keywords` | string[] | 追问关键词 |
| `follow_up_regex` | string[] | 追问正则 |
| `follow_up_max_turns` | int | 追问最大轮数 |
| `scenes` | string[] | 适用场景（chat/assist/task） |
| `platforms` | string[] | 限定平台 |
| `moods` | string[] | 情绪匹配 |
| `min_confidence` | float | 最小置信度（LLM 匹配时使用） |

### behavior（行为模式）

| 字段 | 类型 | 说明 |
|------|------|------|
| `mode` | string | 影响方式：`enhance`（增强）/ `postprocess`（后处理） |
| `priority` | int | 优先级（值越小越先） |

### execution（执行路由）

| 字段 | 类型 | 说明 |
|------|------|------|
| `route` | string | 路由：`chat`（直接聊天）/ `assist`（辅助模式）/ `task`（任务模式） |
| `timeout_sec` | int | 超时时间（秒） |
| `task_template` | string | Task 模板（route=task 时使用） |

### capabilities（能力声明）

| 字段 | 类型 | 说明 |
|------|------|------|
| `domain` | string | 领域标识 |
| `allowed_tools` | string[] | 允许使用的工具列表 |
| `enable_knowledge` | bool | 是否启用知识库 |
| `knowledge_base_ids` | string[] | 知识库 ID 列表 |

### policy（策略）

| 字段 | 类型 | 说明 |
|------|------|------|
| `exclusive` | bool | 是否独占（命中后不再匹配其他技能） |
| `visibility` | string | 可见性：`public` / `private` / `owner` / `tenant` / `system` |
| `cooldown_sec` | int | 冷却时间（秒） |
| `level` | int | 等级要求（用户/群等级需 ≥ 此值） |

## 技能定义示例

```json
{
  "id": "code_review",
  "name": "代码审查",
  "description": "当用户分享代码并希望得到审查时激活",
  "enabled": true,
  "match": {
    "keywords": ["代码", "审查", "review"],
    "regex": ["```\\w+"]
  },
  "behavior": {
    "mode": "enhance",
    "priority": 10
  },
  "execution": {
    "route": "chat",
    "timeout_sec": 60
  },
  "capabilities": {
    "domain": "development"
  },
  "policy": {
    "exclusive": false,
    "visibility": "public",
    "level": 1
  },
  "prompt_overrides": {
    "system": "你是一个专业的代码审查员。请分析用户提供的代码，指出潜在 Bug、性能问题、代码风格建议和安全隐患。"
  }
}
```

## 管理技能

在管理后台 → 技能管理中，可以：
- 查看所有技能列表
- 创建自定义技能
- 启用/禁用技能
- 为智能体绑定/解绑技能
