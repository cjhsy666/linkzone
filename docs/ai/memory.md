# 上下文与记忆

记忆系统让智能体在对话中保持上下文连贯，并跨对话记住用户特征。

## 配置

在管理后台 → 智能体管理中，编辑智能体的记忆配置：

```json
{
  "memory": {
    "max_short_term": 50,
    "long_term_enabled": true,
    "enable_user_profile": true,
    "summary_enabled": false,
    "summary_model": "gpt-4o-mini"
  }
}
```

## 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max_short_term` | int | `50` | 短期记忆最大条数 |
| `short_term_ttl` | int | `3600` | 短期记忆 TTL（秒） |
| `short_term_max_tokens` | int | `4000` | 短期记忆最大 Token |
| `long_term_enabled` | bool | `true` | 是否启用长期记忆 |
| `enable_user_profile` | bool | `true` | 是否启用用户画像 |
| `enable_group_culture` | bool | `true` | 是否启用群文化 |
| `global_memory` | bool | `false` | 是否启用全局记忆 |
| `global_memory_blacklist` | []string | `[]` | 全局记忆黑名单（用户/群 ID） |
| `summary_enabled` | bool | `false` | 是否启用自动摘要 |
| `summary_threshold` | int | `50` | 触发摘要的消息条数 |
| `summary_model` | string | `""` | 摘要使用的模型（建议用便宜模型） |
| `summary_max_tokens` | int | `500` | 摘要最大 Token |
| `shared_context_ttl` | int | `1800` | 共享上下文 TTL（秒） |

## 功能说明

### 短期记忆

存储当前对话的消息历史。当对话消息超过 `max_short_term` 时，较早的消息会被自动压缩为摘要。

### 长期记忆

启用后，每轮对话结束自动生成摘要并存储。新对话开始时，框架会检索相关的长期记忆注入上下文。

### 用户画像

启用后，框架自动从对话中提取用户特征（兴趣偏好、沟通风格等），在后续对话中参考。

### 群文化

启用后，框架会学习群组的常用表达和氛围，让回复更贴合群风格。

## 管理记忆

在管理后台 → 智能体管理中，可以：
- 查看智能体的上下文状态
- 清除指定群组的上下文
- 强制生成摘要
