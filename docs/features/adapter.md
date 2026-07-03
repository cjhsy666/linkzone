# 适配器系统

适配器是 LinkZone 与外部通信平台之间的桥梁，负责接收外部消息和发送回复消息。

## 配置方式

适配器的配置通过 Web 管理后台进行。进入 **管理后台 → 适配器** 页面，点击对应适配器即可查看和修改配置项。

每个适配器都有一个 `enabled` 开关，控制是否启用该适配器。

::: tip 配置方式
适配器的业务配置项（如 API Key、Token 等）在 Web 后台的适配器详情页中直接填写，无需手动编辑配置文件。
:::

## 内置适配器

| 适配器 | 标识 | 平台 | 说明 |
|--------|------|------|------|
| QQ (OneBot) | `qq` | QQ | 通过 OneBot v11 协议连接 QQ 客户端 |
| QQ 官方 | `qqofficial` | QQ | 通过 QQ 官方 Bot API 连接 |
| Web | `web` | Web | Web 端通信，用于测试 |
| CLI | `cli` | 终端 | 命令行交互 |
| 小智 | `xiaozhi` | IoT | 小智音箱语音交互 |
| OpenAI | `openai` | API | 暴露 OpenAI 兼容 Chat API |
| OpenAI Direct | `openai-direct` | API | 完整暴露 LLM 服务所有能力 |
| Anthropic | `anthropic` | API | 暴露 Anthropic Messages API |

---

## QQ (OneBot) 适配器

通过 OneBot v11 协议连接 QQ 客户端（如 go-cqhttp、Lagrange 等），支持群聊和私聊消息收发。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `access_token` | string | `""` | OneBot 连接的 Access Token，留空则不鉴权 |
| `api_timeout` | number | `10` | OneBot API 请求的超时时间（秒） |
| `max_cache_size` | number | `1000` | 消息去重缓存最大条目数 |
| `message_ttl` | number | `3000` | 相同消息的去重时间窗口（毫秒） |

### 使用步骤

1. 部署 OneBot v11 实现端（如 Lagrange.Core、go-cqhttp 等）
2. 在 OneBot 实现端配置反向 WebSocket，地址指向 LinkZone 的 `/onebot/ws`
3. 在 LinkZone 管理后台配置 `access_token`（与 OneBot 端保持一致）
4. 启动 OneBot 实现端，连接成功后日志会显示 `✓ QQ OneBot 机器人 xxx 已连接`

### OneBot 实现端配置示例（Lagrange）

```yaml
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

通过 QQ 官方机器人 API 连接，支持群聊 @ 消息和 C2C 单聊。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `app_id` | string | `""` | QQ 机器人应用的 AppID（必填） |
| `app_secret` | string | `""` | QQ 机器人应用的 AppSecret（必填） |
| `intents` | number | `0` | 事件订阅位，0 表示使用默认值 |
| `sandbox` | bool | `false` | 是否使用沙箱环境 |

### 使用步骤

1. 前往 [QQ 开放平台](https://q.qq.com/) 创建机器人应用
2. 获取 AppID 和 AppSecret
3. 在 LinkZone 管理后台填入 `app_id` 和 `app_secret`
4. 根据需要选择是否开启沙箱模式
5. 启动适配器，日志显示 `WebSocket 网关连接成功` 即表示正常

::: warning 注意
- 群聊消息需要 @ 机器人才能触发
- 机器人被封禁后会停止重连，需检查开发者后台
:::

---

## Web 适配器

Web 端通信适配器，主要用于框架功能测试。开箱即用，无需额外配置。

### 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/web/ws` | GET | WebSocket 连接 |
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

小智音箱适配器，支持语音交互（ASR/TTS）、情感状态和 MCP 协议。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `access_token` | string | `""` | 设备接入鉴权 Token，留空则不鉴权 |
| `websocket_url` | string | `""` | OTA 响应中告知设备的 WebSocket 连接地址 |
| `websocket_token` | string | `""` | OTA 响应中下发给设备的接入 Token |
| `firmware_version` | string | `""` | 最新固件版本号，留空则不下发固件更新 |
| `firmware_url` | string | `""` | 固件 bin 文件的下载 URL |
| `auto_update` | bool | `true` | 是否向设备推送固件更新 |
| `asr_access_key_id` | string | `""` | 阿里云 RAM AccessKey ID |
| `asr_access_key_secret` | string | `""` | 阿里云 RAM AccessKey Secret |
| `asr_app_key` | string | `""` | 阿里云智能语音交互项目 AppKey |
| `tts_app_key` | string | `""` | 阿里云 TTS AppKey，留空则复用 ASR AppKey |
| `default_user_id` | string | `"user_default"` | 未接入声纹识别时的默认用户 ID |

### 使用步骤

1. 在阿里云开通智能语音交互服务，创建 ASR 和 TTS 项目，获取 AccessKey 和 AppKey
2. 在 LinkZone 管理后台填入阿里云相关配置
3. 配置 `access_token` 用于设备鉴权（建议设置）
4. 配置 `websocket_url` 为设备可访问的 LinkZone 地址（如 `ws://192.168.1.100:8080/api/v1/xiaozhi/ws`）
5. 在小智设备的 OTA 服务器中配置 LinkZone 的 OTA 接口地址
6. 设备连接成功后日志会显示 `✓ 小智设备 [xxx] 已接入`

::: warning 注意
- ASR 配置不完整时，语音识别功能不可用
- `access_token` 未配置时，所有设备均可接入，建议在生产环境中设置
- `websocket_url` 未配置时，设备无法自动获取连接地址
:::

---

## OpenAI 适配器

暴露 OpenAI 兼容的 Chat Completions API，允许外部客户端（如 ChatGPT-Next-Web、LobeChat 等）通过标准 OpenAI API 格式与 LinkZone 对话。

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

### 使用步骤

1. 在 LinkZone 管理后台配置 `api_key`（建议设置，防止未授权访问）
2. 根据需要修改 `model_name`
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

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `api_key` | string | `""` | 请求鉴权 API Key，留空则不校验 |
| `timeout` | number | `60` | 等待 LLM 服务响应的超时时间（秒） |

### 使用步骤

1. 在 LinkZone 管理后台配置 `api_key`
2. 在管理后台 → LLM 管理中注册上游 LLM 服务
3. 在客户端中配置 API 地址为 `http://<LinkZone地址>:8080/openai-direct/v1`

### 支持的接口

| 接口 | 说明 |
|------|------|
| `/openai-direct/v1/chat/completions` | Chat Completions（支持流式） |
| `/openai-direct/v1/models` | 模型列表 |
| `/openai-direct/v1/embeddings` | 文本向量化 |
| `/openai-direct/v1/images/generations` | 图片生成 |
| `/openai-direct/v1/images/edits` | 图片编辑 |
| `/openai-direct/v1/audio/speech` | 语音合成（TTS） |
| `/openai-direct/v1/audio/transcriptions` | 语音识别（ASR） |
| `/openai-direct/v1/rerank` | 文本重排序 |
| `/openai-direct/v1/moderations` | 内容审核 |

> 上游服务的管理（注册、回退规则、熔断器重置等）通过 Web 后台 → LLM 管理完成。

---

## Anthropic 适配器

暴露 Anthropic Messages API 兼容接口，支持 Claude Code 等工具通过标准 Anthropic API 格式与 LinkZone 交互。

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `api_key` | string | `""` | 请求鉴权 API Key，留空则不校验 |
| `timeout` | number | `120` | 等待 LLM 服务响应的超时时间（秒） |
| `default_max_tokens` | number | `4096` | 请求未指定 max_tokens 时的默认值 |
| `export_model_name` | string | `"linkzone"` | 对外暴露的统一模型名 |
| `target_model` | select | `""` | 导出模型实际指向的底层模型名 |

### 模型别名

`export_model_name` 和 `target_model` 配合使用实现模型别名：

- 客户端请求 `export_model_name`（如 `linkzone`）时，实际转发给 `target_model`（如 `claude-3-5-sonnet`）
- 如果 `target_model` 为空，则原样透传

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
