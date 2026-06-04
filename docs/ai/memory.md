# 上下文与记忆

记忆系统为智能体提供上下文管理和长期记忆能力，确保对话的连贯性和个性化。

## 记忆层次

| 层次 | 说明 |
|------|------|
| 短期上下文 | 当前对话的即时上下文 |
| 长期记忆 | 跨对话的持久化记忆 |
| 用户画像 | 用户的偏好和特征 |

## 配置

```json
{
  "memory": {
    "max_short_term": 50,
    "long_term_enabled": true,
    "enable_user_profile": true,
    "summary_model": "gpt-4o-mini",
    "summary_enabled": false
  }
}
```

## 短期上下文

存储当前对话的消息历史。当对话超过 `max_context_size` 时，框架自动将较早的消息压缩为摘要，节省 Token。

## 长期记忆

启用后，每轮对话结束自动生成摘要并存储。新对话开始时，框架会检索相关的长期记忆注入上下文。

## 用户画像

启用后，框架自动从对话中提取用户特征（兴趣偏好、沟通风格、情感倾向等），在后续对话中参考。

## 管理记忆

```bash
# 查看智能体上下文
curl http://localhost:8080/api/v1/admin/agents/my_agent/context?group_id=group123 \
  -H "Authorization: Bearer your-admin-token"

# 清除上下文
curl -X DELETE http://localhost:8080/api/v1/admin/agents/my_agent/context?group_id=group123 \
  -H "Authorization: Bearer your-admin-token"

# 强制生成摘要
curl -X POST http://localhost:8080/api/v1/admin/agents/my_agent/context/summary/force?group_id=group123 \
  -H "Authorization: Bearer your-admin-token"
```
