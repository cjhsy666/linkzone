# 知识库

知识库是 AI 的 RAG（检索增强生成）系统，支持上传文档、自动分片、向量化存储和语义检索，让智能体在回答问题时参考外部文档。

## 智能体知识库配置

在管理后台 → 智能体管理中，编辑智能体的知识库配置：

```json
{
  "knowledge": {
    "enabled": true,
    "knowledge_base_ids": ["kb_001", "kb_002"],
    "max_results": 3,
    "cache_ttl": 300
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | bool | `false` | 是否启用知识库检索 |
| `knowledge_base_ids` | string[] | `[]` | 绑定的知识库 ID 列表 |
| `max_results` | int | `3` | 单次检索返回的最大结果数 |
| `cache_ttl` | int | `300` | 检索结果缓存时间（秒） |

> 知识库自身的检索参数（`top_k`、`score_threshold`、`search_type` 等）在知识库配置中设置，详见下文。

## 知识库配置（KBConfig）

每个知识库独立配置分片、检索参数和嵌入模型：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `chunk_size` | int | `500` | 文档分片大小（字符数） |
| `chunk_overlap` | int | `50` | 相邻分片重叠字符数 |
| `search_type` | string | `"hybrid"` | 检索方式：`vector` / `keyword` / `hybrid` |
| `top_k` | int | `3` | 检索返回的块数 |
| `score_threshold` | float | `0.7` | 相似度阈值，低于此值的结果被过滤 |
| `embedding_model` | string | `""` | 嵌入模型名 |
| `embedding_provider` | string | `""` | 嵌入服务提供方 |
| `cache_ttl` | int | `300` | 检索结果缓存时间（秒） |

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

在管理后台 → 知识库管理中创建知识库，填写名称和描述，并配置检索参数。

### 2. 上传文档

在知识库详情页上传文档，支持批量上传。框架会自动分片和向量化。

### 3. 为智能体绑定知识库

在智能体的 `knowledge.knowledge_base_ids` 中填入知识库 ID。绑定后，智能体在回答问题时会自动检索知识库中的相关内容。

## 文档管理

在管理后台 → 知识库管理中，可以：
- 查看知识库中的文档列表
- 上传新文档
- 删除文档
- 搜索测试（输入查询语句，查看检索结果）
