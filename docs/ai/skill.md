# 技能系统

技能是 AI 的可扩展能力单元，每个技能定义了特定的 AI 能力和触发条件，如代码生成、翻译、数据分析等。

## 匹配策略

| 策略 | 标识 | 说明 |
|------|------|------|
| 规则匹配 | `rule` | 基于预定义规则，速度快、确定性高 |
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

## 技能定义

### 规则匹配

```json
{
  "id": "code_review",
  "name": "代码审查",
  "match_strategy": "rule",
  "rules": [
    {"field": "message", "operator": "contains", "value": "代码"},
    {"field": "message", "operator": "regex", "value": "```\\w+"}
  ],
  "prompt": "你是一个专业的代码审查员。请分析用户提供的代码，指出潜在 Bug、性能问题、代码风格建议和安全隐患。"
}
```

支持的运算符：`contains`（包含）、`regex`（正则）、`prefix`（前缀）、`exact`（精确）

### LLM 匹配

```json
{
  "id": "creative_writing",
  "name": "创意写作",
  "match_strategy": "llm",
  "description": "当用户需要写故事、诗歌、文案等创意内容时激活",
  "prompt": "你是一个创意写作专家。"
}
```

### 混合匹配

```json
{
  "id": "data_analysis",
  "name": "数据分析",
  "match_strategy": "hybrid",
  "rules": [
    {"field": "message", "operator": "contains", "value": "数据"}
  ],
  "description": "当用户需要分析数据、生成图表时激活"
}
```

## 技能关联工具

技能可以关联工具，激活时自动启用：

```json
{
  "id": "web_search",
  "name": "网络搜索",
  "tools": ["search_engine", "web_scraper"]
}
```

## 管理技能

在管理后台 → 技能管理中，可以：
- 查看所有技能列表
- 创建自定义技能
- 启用/禁用技能
