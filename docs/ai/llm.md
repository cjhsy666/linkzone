# LLM 配置

LinkZone 支持 30+ 大语言模型供应商，通过统一接口调用，无需为不同供应商修改代码。

## 支持的供应商

| 供应商标识 | 说明 | 示例模型 |
|--------|------|---------|
| `openai` | OpenAI 官方 API | GPT-4o, GPT-4.1, o3 |
| `claude` | Anthropic Claude | Claude Opus 4, Claude Sonnet 4 |
| `gemini` | Google Gemini | Gemini 2.5 Pro, Gemini 2.5 Flash |
| `azure` | Azure OpenAI | GPT-4o, GPT-4.1 |
| `deepseek` | DeepSeek | DeepSeek-V3, DeepSeek-R1 |
| `qwen` | 通义千问（阿里云） | Qwen-Max, Qwen-Plus, QwQ |
| `doubao` | 豆包（字节跳动） | Doubao-1.5-Pro |
| `zhipu` | 智谱 AI | GLM-4-Plus, GLM-4V-Plus |
| `spark` | 讯飞星火 | 4.0Ultra |
| `hunyuan` | 腾讯混元 | Hunyuan-Turbos |
| `ernie` | 文心一言（百度） | ERNIE-4.0 |
| `moonshot` | Moonshot (Kimi) | Moonshot-V1-128K |
| `minimax` | MiniMax | MiniMax-Text-01 |
| `yi` | 零一万物 | Yi-Lightning |
| `baichuan` | 百川 | Baichuan4 |
| `stepfun` | 阶跃星辰 | Step-2-16K |
| `ai360` | 360 智脑 | 360GPT2-Pro |
| `mistral` | Mistral | Mistral Large |
| `cohere` | Cohere | Command R+ |
| `xai` | xAI (Grok) | Grok-3 |
| `groq` | Groq 超高速推理 | Llama-3.3-70B |
| `siliconflow` | 硅基流动 | DeepSeek-V3, Qwen2.5-72B |
| `together` | Together AI | Llama-3.3-70B |
| `fireworks` | Fireworks AI | Llama-3.3-70B |
| `novita` | Novita AI | DeepSeek-R1 |
| `replicate` | Replicate | Llama-3.3-70B |
| `cloudflare` | Cloudflare Workers AI | Llama-3.3-70B |
| `openrouter` | OpenRouter 聚合路由 | 多模型 |
| `ollama` | Ollama 本地推理 | 自定义 |

## 配置方式

LLM 通过 Upstream（上游）机制管理。每个 Upstream 代表一个 LLM 供应商的接入配置，包含 API 地址、密钥、可用模型等。

### 通过 Web 后台配置

在管理后台 → LLM 管理中，可以：
- 添加、编辑、删除 Upstream
- 测试 Upstream 连通性
- 自动获取供应商支持的模型列表
- 配置模型回退链
- 查看所有可用模型

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
| `default_model` | string | 否 | 默认模型 |
| `model_mapping` | map | 否 | 模型名称映射 |

## 常见供应商配置示例

### DeepSeek

| 字段 | 值 |
|------|-----|
| provider | `openai` |
| base_url | `https://api.deepseek.com/v1` |
| api_key | 你的 DeepSeek API Key |
| models | `deepseek-chat`, `deepseek-reasoner` |

### OpenAI

| 字段 | 值 |
|------|-----|
| provider | `openai` |
| base_url | `https://api.openai.com/v1` |
| api_key | 你的 OpenAI API Key |
| models | `gpt-4o`, `gpt-4o-mini` |

### Ollama（本地模型）

| 字段 | 值 |
|------|-----|
| provider | `openai` |
| base_url | `http://localhost:11434/v1` |
| api_key | `ollama` |
| models | 你本地运行的模型名 |

### Azure OpenAI

| 字段 | 值 |
|------|-----|
| provider | `azure` |
| base_url | `https://你的资源名.openai.azure.com` |
| api_key | 你的 Azure Key |
| models | `gpt-4o` |

## 智能体级别配置

每个智能体可以在 `runtime` 配置中指定使用的模型，在管理后台 → 智能体管理中编辑：

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

## 模型回退

可以为模型设置回退链，当主模型不可用时自动降级。在管理后台 → LLM 管理中配置回退链，例如：

`gpt-4o` → `deepseek-chat` → `gpt-4o-mini`
