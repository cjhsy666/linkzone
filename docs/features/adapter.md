# 适配器系统

适配器是 LinkZone 与外部通信平台之间的桥梁，负责接收外部消息和发送回复消息。

## 适配器的作用

```
外部平台 ←→ 适配器 ←→ Bot 核心
```

- **接收消息**：从外部平台（QQ、Web、小智等）接收消息，转换为框架统一格式
- **发送消息**：将框架处理后的回复发送回外部平台

## 如何配置适配器

适配器的配置通过 Web 管理后台进行。进入 **管理后台 → 适配器** 页面，点击对应适配器即可查看和修改配置项。

每个适配器都有一个 `enabled` 开关，控制是否启用该适配器。配置键格式为 `adapters.<适配器名>.enabled`，默认为 `true`（启用）。

::: tip 配置方式
适配器的业务配置项（如 API Key、Token 等）在 Web 后台的适配器详情页中直接填写，无需手动编辑配置文件。
:::

## 内置适配器一览

| 适配器 | 名称 | 平台 | 说明 |
|--------|------|------|------|
| QQ (OneBot) | `qq` | QQ | 通过 OneBot v11 协议连接 QQ 客户端 |
| QQ 官方 | `qqofficial` | QQ | 通过 QQ 官方 Bot API 连接 |
| Web | `web` | Web | Web 端 WebSocket 通信，用于测试 |
| CLI | `cli` | 终端 | 命令行交互 |
| 小智 | `xiaozhi` | IoT | 小智音箱语音交互，支持 ASR/TTS |
| OpenAI | `openai` | API | 暴露 OpenAI 兼容 Chat API |
| OpenAI Direct | `openai-direct` | API | 完整暴露 LLM 服务所有能力 |
| Anthropic | `anthropic` | API | 暴露 Anthropic Messages API |

---

## QQ (OneBot) 适配器

通过 OneBot v11 协议连接 QQ 客户端（如 go-cqhttp、Lagrange 等），支持群聊和私聊消息收发。

### 工作原理

QQ 客户端（OneBot 实现）作为 WebSocket 客户端，主动连接 LinkZone 的 `/onebot/ws` 端点。连接时需携带 `x-self-id` 请求头标识机器人账号。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `access_token` | string | `""` | OneBot 连接的 Access Token，留空则不鉴权 |
| `api_timeout` | number | `10` | OneBot API 请求的超时时间（秒） |
| `max_cache_size` | number | `1000` | 消息去重 LRU 缓存最大条目数，建议 500-2000 |
| `message_ttl` | number | `3000` | 相同消息的去重时间窗口（毫秒） |

### 使用步骤

1. 部署 OneBot v11 实现端（如 Lagrange.Core、go-cqhttp 等）
2. 在 OneBot 实现端配置反向 WebSocket，地址指向 LinkZone 的 `/onebot/ws`
3. 在 LinkZone 管理后台配置 `access_token`（与 OneBot 端保持一致）
4. 启动 OneBot 实现端，连接成功后日志会显示 `✓ QQ OneBot 机器人 xxx 已连接`

### OneBot 实现端配置示例（Lagrange）

```yaml
# Lagrange 配置示例
Implementations:
  - Protocol: ReverseWebsocket
    Config:
      ReverseWebsocketHost: "127.0.0.1"
      ReverseWebsocketPort: 8080
      ReverseWebsocketPath: "/onebot/ws"
      AccessToken: "your-access-token"
```

---

## QQ 官方适配器

通过 QQ 官方机器人 API（WebSocket 模式）连接，支持群聊 @ 消息和 C2C 单聊。

### 工作原理

LinkZone 主动连接 QQ 官方 WebSocket 网关，接收事件并调用 REST API 回复消息。支持自动重连、Token 刷新和消息去重。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `app_id` | string | `""` | QQ 机器人应用的 AppID（必填） |
| `app_secret` | string | `""` | QQ 机器人应用的 AppSecret / ClientSecret（必填） |
| `intents` | number | `0` | 事件订阅位，0 表示使用默认值（群聊 + C2C + 频道私信） |
| `sandbox` | bool | `false` | 是否使用沙箱环境 |

### 使用步骤

1. 前往 [QQ 开放平台](https://q.qq.com/) 创建机器人应用
2. 获取 AppID 和 AppSecret
3. 在 LinkZone 管理后台填入 `app_id` 和 `app_secret`
4. 根据需要选择是否开启沙箱模式
5. 启动适配器，日志显示 `WebSocket 网关连接成功` 即表示正常

::: warning 注意
- AppID 和 AppSecret 未配置时，适配器将以待连接状态启动，不会连接网关
- 机器人被封禁后会停止重连，需检查开发者后台
- 群聊消息需要 @ 机器人才能触发
:::

---

## Web 适配器

Web 端通信适配器，主要用于框架功能测试。通过 WebSocket 和 HTTP 接口与前端交互。

### 工作原理

前端通过 WebSocket 连接 `/api/v1/web/ws`，或通过 HTTP POST `/api/v1/web/event` 发送消息。支持群聊广播和私聊定向发送，前端可传递用户等级使权限系统生效。

### 配置项

Web 适配器无需额外配置，开箱即用。

### 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/web/ws` | GET | WebSocket 连接，可选 `client_id` 查询参数 |
| `/api/v1/web/event` | POST | HTTP 消息发送接口 |

### WebSocket 消息格式

发送消息事件：

```json
{
  "type": "message",
  "platform": "web",
  "sender_id": "user1",
  "message": "你好",
  "receiver_type": "private",
  "extra": {
    "level": 5
  }
}
```

群聊消息需设置 `receiver_type: "group"` 并指定 `group_id`。`extra.level` 字段可设置用户权限等级（1-7）。

---

## CLI 适配器

命令行交互适配器，在终端中直接与机器人对话，适合开发调试。

### 工作原理

启动后监听标准输入，将每行输入作为一条消息发送给框架处理，回复直接输出到终端。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `prompt` | string | `"> "` | 命令行提示符 |

### 使用方式

启动 LinkZone 后，如果终端是交互式的（TTY），CLI 适配器会自动进入输入循环。直接输入文字即可与机器人对话。

::: tip
在非交互式终端（如 Docker 后台运行、systemd 服务）中，CLI 适配器会跳过输入循环，不影响其他适配器运行。
:::

---

## 小智适配器

小智音箱适配器，作为 WebSocket 服务端接受小智设备接入，支持语音交互（ASR/TTS）、情感状态和 MCP 协议。

### 工作原理

小智设备通过 OTA 接口获取连接信息，然后通过 WebSocket 接入 LinkZone。设备发送的音频数据通过阿里云 ASR 转为文字，框架处理后将回复通过阿里云 TTS 合成为音频推送给设备。支持语音打断。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `access_token` | string | `""` | 设备接入鉴权 Token，留空则不鉴权 |
| `websocket_url` | string | `""` | OTA 响应中告知设备的 WebSocket 连接地址 |
| `websocket_token` | string | `""` | OTA 响应中下发给设备的接入 Token |
| `firmware_version` | string | `""` | 最新固件版本号，留空则不下发固件更新信息 |
| `firmware_url` | string | `""` | 固件 bin 文件的下载 URL |
| `auto_update` | bool | `true` | 是否向设备推送固件更新 |
| `asr_access_key_id` | string | `""` | 阿里云 RAM AccessKey ID |
| `asr_access_key_secret` | string | `""` | 阿里云 RAM AccessKey Secret |
| `asr_app_key` | string | `""` | 阿里云智能语音交互项目 AppKey |
| `tts_app_key` | string | `""` | 阿里云 TTS AppKey，留空则复用 ASR AppKey |
| `default_user_id` | string | `"user_default"` | 未接入声纹识别时的默认用户 ID |

### 使用步骤

1. 在阿里云开通智能语音交互服务，创建 ASR 和 TTS 项目，获取 AccessKey 和 AppKey
2. 在 LinkZone 管理后台填入阿里云相关配置（`asr_access_key_id`、`asr_access_key_secret`、`asr_app_key`）
3. 配置 `access_token` 用于设备鉴权（建议设置）
4. 配置 `websocket_url` 为设备可访问的 LinkZone 地址（如 `ws://192.168.1.100:8080/api/v1/xiaozhi/ws`）
5. 在小智设备的 OTA 服务器中配置 LinkZone 的 OTA 接口地址
6. 设备连接成功后日志会显示 `✓ 小智设备 [xxx] 已接入`

### 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/xiaozhi/ota` | POST | 设备 OTA 检查接口 |
| `/api/v1/xiaozhi/ws` | GET/POST | 设备 WebSocket 连接接口 |

::: warning 注意
- ASR 配置不完整时，语音识别功能不可用，设备发送的音频无法转为文字
- `access_token` 未配置时，所有设备均可接入，建议在生产环境中设置
- `websocket_url` 未配置时，OTA 响应中将返回空地址，设备无法自动获取连接地址
:::

---

## OpenAI 适配器

暴露 OpenAI 兼容的 Chat Completions API，允许外部客户端（如 ChatGPT-Next-Web、LobeChat 等）通过标准 OpenAI API 格式与 LinkZone 对话。

### 工作原理

外部客户端发送 OpenAI 格式的请求，适配器将其转为框架事件处理，框架回复后再转换为 OpenAI 格式返回。支持流式（SSE）和非流式响应。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `api_key` | string | `""` | 请求鉴权 API Key，留空则不校验 |
| `timeout` | number | `60` | 等待框架响应的超时时间（秒） |
| `model_name` | string | `"linkzone-bot"` | 返回给客户端的模型名称 |
| `markdown_mode` | string | `"rich"` | 多媒体内容的 Markdown 渲染模式 |
| `image_alt_text` | string | `"图片"` | 图片的默认 alt 文本 |

`markdown_mode` 可选值：

| 值 | 说明 |
|----|------|
| `rich` | 完整 Markdown 图片语法 `![alt](url)` |
| `simple` | 简单链接格式 |
| `html` | HTML img 标签 |
| `mixed` | Markdown + 链接 |

### 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/openai/v1/chat/completions` | POST | Chat Completions 接口（支持流式） |
| `/openai/v1/models` | GET | 模型列表接口 |

### 使用步骤

1. 在 LinkZone 管理后台配置 `api_key`（建议设置，防止未授权访问）
2. 根据需要修改 `model_name`（客户端请求的 model 字段会作为会话标识）
3. 在外部客户端中配置 API 地址为 `http://<LinkZone地址>:8080/openai/v1`
4. 填入配置的 API Key

### 客户端配置示例（ChatGPT-Next-Web）

```
API 地址: http://192.168.1.100:8080/openai/v1
API Key:  你在LinkZone中配置的api_key
模型:     linkzone-bot
```

---

## OpenAI Direct 适配器

完整暴露 LinkZone 内部 LLM 服务的能力，不仅支持 Chat Completions，还支持 Embeddings、图片生成、语音合成（TTS）、语音识别（ASR）、Rerank 等全部 LLM 功能。适合作为 AI 网关使用。

### 工作原理

直接将请求转发给 LinkZone 内部的 LLM 服务处理，支持多上游管理、模型回退、熔断器等高级功能。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `api_key` | string | `""` | 请求鉴权 API Key，留空则不校验 |
| `timeout` | number | `60` | 等待 LLM 服务响应的超时时间（秒） |

### 接口说明

**标准 OpenAI 接口：**

| 接口 | 方法 | 说明 |
|------|------|------|
| `/openai-direct/v1/chat/completions` | POST | Chat Completions（支持流式） |
| `/openai-direct/v1/models` | GET | 模型列表 |
| `/openai-direct/v1/models/:model` | GET | 获取单个模型信息 |
| `/openai-direct/v1/embeddings` | POST | 文本向量化 |
| `/openai-direct/v1/images/generations` | POST | 图片生成 |
| `/openai-direct/v1/images/edits` | POST | 图片编辑 |
| `/openai-direct/v1/images/variations` | POST | 图片变体 |
| `/openai-direct/v1/audio/speech` | POST | 语音合成（TTS） |
| `/openai-direct/v1/audio/transcriptions` | POST | 语音识别（ASR） |
| `/openai-direct/v1/audio/translations` | POST | 音频翻译 |
| `/openai-direct/v1/rerank` | POST | 文本重排序 |
| `/openai-direct/v1/moderations` | POST | 内容审核 |

**管理接口（需鉴权）：**

| 接口 | 方法 | 说明 |
|------|------|------|
| `/openai-direct/mgmt/upstreams` | POST | 注册上游 LLM 服务 |
| `/openai-direct/mgmt/upstreams` | GET | 列出所有上游 |
| `/openai-direct/mgmt/upstreams/:id` | DELETE | 删除上游 |
| `/openai-direct/mgmt/fallbacks` | POST | 添加模型回退规则 |
| `/openai-direct/mgmt/breakers/:id/reset` | POST | 重置熔断器 |
| `/openai-direct/mgmt/health` | GET | 上游健康状态 |
| `/openai-direct/mgmt/stats` | GET | 使用统计 |

### 使用步骤

1. 在 LinkZone 管理后台配置 `api_key`
2. 通过管理接口注册上游 LLM 服务
3. 在客户端中配置 API 地址为 `http://<LinkZone地址>:8080/openai-direct/v1`

---

## Anthropic 适配器

暴露 Anthropic Messages API 兼容接口，支持 Claude Code 等工具通过标准 Anthropic API 格式与 LinkZone 交互。

### 工作原理

将 Anthropic 格式的请求转换为内部 LLM 请求格式，支持模型别名映射、Tool Use（函数调用）和流式响应。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `api_key` | string | `""` | 请求鉴权 API Key，留空则不校验 |
| `timeout` | number | `120` | 等待 LLM 服务响应的超时时间（秒） |
| `default_max_tokens` | number | `4096` | 请求未指定 max_tokens 时的默认值 |
| `export_model_name` | string | `"linkzone"` | 对外暴露的统一模型名，客户端使用此名称发起请求 |
| `target_model` | select | `""` | 导出模型实际指向的底层模型名，选项从已注册模型列表动态获取 |

### 模型别名机制

`export_model_name` 和 `target_model` 配合使用实现模型别名：

- 客户端请求 `export_model_name`（如 `linkzone`）时，实际转发给 `target_model`（如 `claude-3-5-sonnet`）
- 如果 `target_model` 为空，则不替换模型名，原样透传
- 请求中的模型名不等于 `export_model_name` 时，也原样透传

### 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/anthropic/v1/messages` | POST | Messages 接口（支持流式） |
| `/anthropic/v1/models` | GET | 模型列表 |

**管理接口（需鉴权）：**

| 接口 | 方法 | 说明 |
|------|------|------|
| `/anthropic/v1/mgmt/upstreams` | POST/GET | 注册/列出上游 |
| `/anthropic/v1/mgmt/upstreams/:id` | DELETE | 删除上游 |
| `/anthropic/v1/mgmt/fallbacks` | POST | 添加回退规则 |
| `/anthropic/v1/mgmt/breakers/:id/reset` | POST | 重置熔断器 |
| `/anthropic/v1/mgmt/health` | GET | 健康状态 |
| `/anthropic/v1/mgmt/stats` | GET | 使用统计 |

### 使用步骤

1. 在 LinkZone 管理后台配置 `api_key`
2. 设置 `export_model_name`（如 `linkzone`）和 `target_model`（选择实际要使用的模型）
3. 在 Claude Code 等工具中配置 API 地址和 Key

### Claude Code 配置示例

```bash
export ANTHROPIC_BASE_URL=http://192.168.1.100:8080/anthropic
export ANTHROPIC_API_KEY=你在LinkZone中配置的api_key
```

---

## 开发自定义适配器

如果你需要接入框架未支持的平台，可以开发外置适配器。详见 [外置适配器开发](/plugin-dev/adapter-dev)。
