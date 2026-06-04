# 知识库

知识库是 AI 的 RAG（检索增强生成）系统，支持上传文档、自动分片、向量化存储和语义检索，让智能体在回答问题时参考外部文档。

## 智能体知识库配置

在智能体配置中启用知识库：

```json
{
  "knowledge": {
    "enabled": true,
    "top_k": 5,
    "score_threshold": 0.7,
    "max_context_length": 2000,
    "rerank_enabled": false
  }
}
```

## 支持的文档格式

| 格式 | 扩展名 |
|------|--------|
| PDF | `.pdf` |
| Word | `.docx` |
| Markdown | `.md` |
| 纯文本 | `.txt` |
| CSV | `.csv` |
| HTML | `.html` |

## 使用步骤

### 1. 创建知识库

```bash
curl -X POST http://localhost:8080/api/v1/admin/knowledge \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "产品文档",
    "description": "产品相关文档和FAQ"
  }'
```

### 2. 上传文档

```bash
curl -X POST http://localhost:8080/api/v1/admin/knowledge/{id}/documents \
  -H "Authorization: Bearer your-admin-token" \
  -F "file=@document.pdf"
```

### 3. 为智能体绑定知识库

绑定后，智能体在回答问题时会自动检索知识库中的相关内容。

## 文档管理

```bash
# 列出文档
curl http://localhost:8080/api/v1/admin/knowledge/{id}/documents \
  -H "Authorization: Bearer your-admin-token"

# 删除文档
curl -X DELETE http://localhost:8080/api/v1/admin/knowledge/{id}/documents/{doc_id} \
  -H "Authorization: Bearer your-admin-token"

# 搜索知识库
curl -X POST http://localhost:8080/api/v1/admin/knowledge/{id}/search \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"query": "如何配置适配器", "top_k": 5}'
```
