# LinkZone

多渠道智能机器人框架 — QQ / Web / 小智多渠道接入，AI 对话 / 智能家居 / 插件扩展一站式搞定。

## 特性

- **多渠道接入** — 内置 QQ（OneBot / 官方）、Web、CLI、小智音箱等适配器，统一消息格式，一套逻辑全平台运行
- **AI 对话** — 支持 OpenAI、DeepSeek 等 30+ LLM 供应商，内置技能系统、知识库 RAG、工具调用、多模态、情感分析
- **智能家居** — 通过 Home Assistant 控制灯光、空调、窗帘、门锁等 25+ 种设备，支持自然语言控制
- **插件扩展** — 支持 Node.js / Python 开发自定义插件，热重载、AI 工具注册、定时任务、数据存储一应俱全
- **LLM API 暴露** — 提供 OpenAI 兼容和 Anthropic 兼容 API，ChatBox、Claude Code 等客户端可直接接入
- **多智能体** — 多个 AI 角色独立配置，按群组/用户路由，各自拥有人设、记忆、技能和工具

## 快速开始

### 下载

从 [Releases](https://github.com/cjhsy666/linkzone/releases) 下载对应平台的二进制文件。

### 启动

```bash
# Linux / macOS
chmod +x linkzone-user
./linkzone-user

# Windows
linkzone-user-windows-amd64-pure.exe
```

启动后访问 `http://localhost:8080` 打开 Web 管理后台。

### 配置 AI

1. 在管理后台 → LLM 管理中添加 Upstream（如 DeepSeek、OpenAI）
2. 在管理后台 → 智能体管理中创建智能体，配置人设和模型
3. 在群组中 @机器人 或发送消息即可触发 AI 对话

## 文档

完整文档请访问：[docs.cjhsy.xyz](https://docs.cjhsy.xyz)（或 [linkzone-1t8.pages.dev](https://linkzone-1t8.pages.dev)）

## 支持的 LLM 供应商

**国际**：OpenAI、Anthropic、Google Gemini、Azure OpenAI、Mistral、xAI、Cohere

**国内**：DeepSeek、通义千问、豆包、智谱 AI、讯飞星火、腾讯混元、文心一言、Moonshot、MiniMax、百川、阶跃星辰

**推理平台**：Groq、SiliconFlow、Together AI、Fireworks AI、Novita AI、Cloudflare AI

**其他**：OpenRouter、Ollama（本地模型）

## 许可证

MIT License
