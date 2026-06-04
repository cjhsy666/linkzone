# LLM 配置

LinkZone 支持 30+ 大语言模型供应商，通过统一接口调用，无需为不同供应商修改代码。

## 支持的供应商

### 国际

| 提供商 | 标识 | 模型示例 | 说明 |
|--------|------|---------|------|
| OpenAI | `openai` | GPT-4o, GPT-4.1, o3, o4-mini | 官方 API |
| Anthropic | `claude` | Claude Opus 4, Claude Sonnet 4 | 独立协议 |
| Google | `gemini` | Gemini 2.5 Pro, Gemini 2.5 Flash | 独立协议 |
| Azure OpenAI | `azure` | GPT-4o, GPT-4.1 | Azure 托管 |
| OpenAI Responses | `openai-responses` | GPT-4o, o3 | Responses API |
| Mistral | `mistral` | Mistral Large, Codestral | 官方 API |
| Cohere | `cohere` | Command R+, Rerank | 官方 API |
| xAI | `xai` | Grok-3, Grok-2 | 官方 API |

### 国内

| 提供商 | 标识 | 模型示例 | 说明 |
|--------|------|---------|------|
| DeepSeek | `deepseek` | DeepSeek-V3, DeepSeek-R1 | 推理模型 |
| 通义千问 | `qwen` | Qwen-Max, Qwen-Plus, QwQ | 阿里云 |
| 豆包 | `doubao` | Doubao-1.5-Pro, Doubao-1.5-Thinking | 字节跳动 |
| 智谱 AI | `zhipu` | GLM-4-Plus, GLM-4V-Plus | 智谱 |
| 讯飞星火 | `spark` | 4.0Ultra, General V3.5 | 讯飞 |
| 腾讯混元 | `hunyuan` | Hunyuan-Turbos, Hunyuan-Pro | 腾讯 |
| 文心一言 | `ernie` | ERNIE-4.0, ERNIE-3.5 | 百度 |
| Moonshot | `moonshot` | Moonshot-V1-8K/32K/128K | Kimi |
| MiniMax | `minimax` | MiniMax-Text-01 | MiniMax |
| 零一万物 | `yi` | Yi-Lightning, Yi-Large | 零一万物 |
| 百川 | `baichuan` | Baichuan4, Baichuan3-Turbo | 百川 |
| 阶跃星辰 | `stepfun` | Step-2-16K, Step-1-8K | 阶跃星辰 |
| 360 智脑 | `ai360` | 360GPT2-Pro | 360 |

### 推理平台

| 提供商 | 标识 | 模型示例 | 说明 |
|--------|------|---------|------|
| Groq | `groq` | Llama-3.3-70B, Mixtral | 超高速推理 |
| SiliconFlow | `siliconflow` | DeepSeek-V3, Qwen2.5-72B | 硅基流动 |
| Together AI | `together` | Llama-3.3-70B, Qwen2.5-72B | 开源模型推理 |
| Fireworks AI | `fireworks` | Llama-3.3-70B, Qwen2.5-72B | 高速推理 |
| Novita AI | `novita` | Llama-3.3-70B, DeepSeek-R1 | 推理与图片生成 |
| Replicate | `replicate` | Llama-3.3-70B | 云端推理 |
| Cloudflare AI | `cloudflare` | Llama-3.3-70B, Qwen2.5-72B | Workers AI |

### 其他

| 提供商 | 标识 | 模型示例 | 说明 |
|--------|------|---------|------|
| OpenRouter | `openrouter` | GPT-4o, Claude, Gemini | 多模型聚合路由 |
| Ollama | `ollama` | 自定义 | 本地模型推理 |

## 配置方式

LLM 通过 Upstream（上游）机制管理。每个 Upstream 代表一个 LLM 供应商的接入配置，包含 API 地址、密钥、可用模型等。

### 通过 API 添加 Upstream

```bash
# 添加 DeepSeek
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DeepSeek",
    "provider": "openai",
    "base_url": "https://api.deepseek.com/v1",
    "api_key": "sk-xxx",
    "models": ["deepseek-chat", "deepseek-reasoner"],
    "enabled": true,
    "priority": 100
  }'

# 添加 OpenAI
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenAI",
    "provider": "openai",
    "base_url": "https://api.openai.com/v1",
    "api_key": "sk-xxx",
    "models": ["gpt-4o", "gpt-4o-mini"],
    "enabled": true,
    "priority": 90
  }'
```

### Upstream 配置字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 上游名称，用于展示 |
| `provider` | string | 是 | 供应商标识（如 `openai`、`claude`、`gemini`） |
| `base_url` | string | 是 | API 地址 |
| `api_key` | string | 是 | API 密钥 |
| `models` | []string | 是 | 支持的模型列表 |
| `enabled` | bool | 否 | 是否启用（默认 `true`） |
| `priority` | int | 否 | 优先级，数值越大越优先（默认 `100`） |
| `weight` | int | 否 | 负载均衡权重（默认 `100`） |
| `timeout` | int | 否 | 超时时间秒数（默认 `30`） |
| `rpm` | int | 否 | 每分钟请求限制 |
| `tpm` | int | 否 | 每分钟 Token 限制 |
| `default_model` | string | 否 | 默认模型 |
| `disabled_models` | map | 否 | 禁用的模型 |
| `model_mapping` | map | 否 | 模型名称映射 |

### 智能体级别配置

每个智能体可以在 `runtime` 配置中指定使用的模型：

```json
{
  "runtime": {
    "default": {
      "model": "deepseek-chat",
      "temperature": 0.7,
      "max_tokens": 2048,
      "enable_tools": true,
      "max_tool_loops": 5,
      "timeout_seconds": 60
    },
    "scenes": {
      "chat": { "temperature": 0.7, "max_tokens": 2048 },
      "task": { "temperature": 0.3, "max_tokens": 1024 }
    }
  }
}
```

### 摘要模型

长期记忆功能使用独立的摘要模型，建议使用更便宜的模型：

```json
{
  "memory": {
    "summary_model": "deepseek-chat",
    "summary_enabled": true
  }
}
```

## 常见供应商配置示例

### DeepSeek

```bash
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DeepSeek",
    "provider": "openai",
    "base_url": "https://api.deepseek.com/v1",
    "api_key": "sk-xxx",
    "models": ["deepseek-chat", "deepseek-reasoner"]
  }'
```

### OpenAI

```bash
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenAI",
    "provider": "openai",
    "base_url": "https://api.openai.com/v1",
    "api_key": "sk-xxx",
    "models": ["gpt-4o", "gpt-4o-mini"]
  }'
```

### Ollama（本地模型）

```bash
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ollama",
    "provider": "openai",
    "base_url": "http://localhost:11434/v1",
    "api_key": "ollama",
    "models": ["qwen2.5:7b"]
  }'
```

### Azure OpenAI

```bash
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Azure OpenAI",
    "provider": "azure",
    "base_url": "https://your-resource.openai.azure.com",
    "api_key": "xxx",
    "models": ["gpt-4o"]
  }'
```

## 管理 Upstream

```bash
# 列出所有 Upstream
curl http://localhost:8080/api/v1/admin/llm/upstreams \
  -H "Authorization: Bearer your-admin-token"

# 获取 Upstream 详情
curl http://localhost:8080/api/v1/admin/llm/upstreams/{id} \
  -H "Authorization: Bearer your-admin-token"

# 更新 Upstream
curl -X PUT http://localhost:8080/api/v1/admin/llm/upstreams/{id} \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sk-new-key"}'

# 删除 Upstream
curl -X DELETE http://localhost:8080/api/v1/admin/llm/upstreams/{id} \
  -H "Authorization: Bearer your-admin-token"

# 测试 Upstream 连通性
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams/{id}/test \
  -H "Authorization: Bearer your-admin-token"

# 自动获取 Upstream 支持的模型列表
curl -X POST http://localhost:8080/api/v1/admin/llm/upstreams/{id}/fetch-models \
  -H "Authorization: Bearer your-admin-token"
```

## 模型路由

当智能体请求某个模型时，框架按以下规则路由：

1. 查找所有启用的、支持该模型的 Upstream
2. 按优先级排序（priority 越大越优先）
3. 同优先级按权重负载均衡
4. 熔断器打开的 Upstream 自动跳过
5. 请求失败自动重试下一个 Upstream

## 模型回退

可以为模型设置回退链，当主模型不可用时自动降级：

```bash
# 设置回退：gpt-4o → deepseek-chat → gpt-4o-mini
curl -X POST http://localhost:8080/api/v1/admin/llm/fallbacks \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "fallbacks": ["deepseek-chat", "gpt-4o-mini"]}'
```

## 查看可用模型

```bash
curl http://localhost:8080/api/v1/admin/llm/models \
  -H "Authorization: Bearer your-admin-token"
```
