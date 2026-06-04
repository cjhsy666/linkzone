# 智能体 API

## 智能体管理

### 获取智能体列表

```
GET /admin/agents
```

### 创建智能体

```
POST /admin/agents
```

请求体：

```json
{
    "id": "my_agent",
    "config": {
        "enabled": true,
        "personality": {
            "name": "小助手"
        },
        "runtime": {
            "default": {
                "model": "deepseek-chat"
            }
        }
    }
}
```

### 获取智能体详情

```
GET /admin/agents/{id}
```

### 更新智能体

```
PUT /admin/agents/{id}
```

### 删除智能体

```
DELETE /admin/agents/{id}
```

### 启用智能体

```
POST /admin/agents/{id}/enable
```

### 禁用智能体

```
POST /admin/agents/{id}/disable
```

## 群组绑定

### 获取智能体绑定的群组

```
GET /admin/agents/{id}/groups
```

### 绑定群组

```
POST /admin/agents/{id}/groups
```

请求体：

```json
{
    "platform": "qq",
    "group_id": "group123"
}
```

### 解绑群组

```
DELETE /admin/agents/{id}/groups
```

请求体：

```json
{
    "platform": "qq",
    "group_id": "group123"
}
```

## 上下文管理

### 获取智能体上下文

```
GET /admin/agents/{id}/context
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `group_id` | string | 群组 ID |
| `user_id` | string | 用户 ID |

### 清除上下文

```
DELETE /admin/agents/{id}/context
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `group_id` | string | 群组 ID |
| `user_id` | string | 用户 ID |

### 强制生成摘要

```
POST /admin/agents/{id}/context/summary/force
```

查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `group_id` | string | 群组 ID |
