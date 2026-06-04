# 插件 API

## 插件管理

### 获取插件列表

```
GET /admin/plugins
```

### 获取插件详情

```
GET /admin/plugins/{name}
```

### 启用插件

```
POST /admin/plugins/{name}/enable
```

### 禁用插件

```
POST /admin/plugins/{name}/disable
```

### 重载插件

```
POST /admin/plugins/{name}/reload
```

### 执行插件动作

```
POST /admin/plugins/{name}/action
```

请求体：

```json
{
    "action": "custom_action",
    "params": {}
}
```

## 适配器管理

### 获取适配器列表

```
GET /admin/adapters
```

### 获取适配器详情

```
GET /admin/adapters/{name}
```

### 启用适配器

```
POST /admin/adapters/{name}/enable
```

### 禁用适配器

```
POST /admin/adapters/{name}/disable
```

### 重载适配器

```
POST /admin/adapters/{name}/reload
```

## 技能管理

### 获取技能列表

```
GET /admin/skills
```

### 获取技能详情

```
GET /admin/skills/{name}
```

### 启用技能

```
POST /admin/skills/{name}/enable
```

### 禁用技能

```
POST /admin/skills/{name}/disable
```

## 知识库管理

### 获取知识库列表

```
GET /admin/knowledge
```

### 创建知识库

```
POST /admin/knowledge
```

请求体：

```json
{
    "name": "my_knowledge",
    "description": "我的知识库",
    "embedding_model": "text-embedding-3-small"
}
```

### 获取知识库详情

```
GET /admin/knowledge/{id}
```

### 更新知识库

```
PUT /admin/knowledge/{id}
```

### 删除知识库

```
DELETE /admin/knowledge/{id}
```

### 上传文档

```
POST /admin/knowledge/{id}/documents
```

Content-Type: `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | file | 文档文件（支持 txt、md、pdf） |

### 获取文档列表

```
GET /admin/knowledge/{id}/documents
```

### 删除文档

```
DELETE /admin/knowledge/{id}/documents/{doc_id}
```

### 搜索知识库

```
POST /admin/knowledge/{id}/search
```

请求体：

```json
{
    "query": "搜索内容",
    "top_k": 5
}
```
