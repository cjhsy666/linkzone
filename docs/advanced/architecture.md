# 功能概览

LinkZone 是一个多渠道智能机器人框架，支持 QQ、Web、小智等多种平台接入，内置 AI 对话、智能家居控制、插件扩展等能力。

## 核心功能

| 功能 | 说明 |
|------|------|
| 多渠道接入 | QQ（OneBot / 官方）、Web、CLI、小智音箱，统一消息格式 |
| AI 对话 | 接入 OpenAI、Anthropic、DeepSeek 等 30+ LLM 供应商，支持技能、知识库、工具调用 |
| 智能家居 | 通过 Home Assistant 控制灯光、空调、窗帘等 25+ 种设备 |
| 插件扩展 | 支持 Node.js / Python 开发自定义插件，热重载 |
| LLM API 暴露 | 提供 OpenAI 兼容和 Anthropic 兼容 API，外部客户端可直接接入 |
| 消息转发 | 跨平台消息转发，支持脚本自定义转发逻辑 |
| 定时任务 | Cron 定时推送、消息注入 |
| 多智能体 | 多个 AI 角色独立配置，按群组/用户路由 |

## 消息处理流程

```
外部消息 → 适配器接收 → Bot 核心处理 → 分发到对应服务
  ├── 匹配插件 → 插件处理（命令/关键词/智能家居等）
  ├── 匹配智能体 → AI 处理（LLM 对话/技能/工具调用）
  └── 无匹配 → 忽略
处理完成 → 通过适配器回复消息
```

## 支持的 LLM 供应商

### 国际

OpenAI、Anthropic (Claude)、Google (Gemini)、Azure OpenAI、Mistral、Cohere、xAI (Grok)

### 国内

DeepSeek、通义千问、豆包、智谱 AI、讯飞星火、腾讯混元、文心一言、Moonshot (Kimi)、MiniMax、零一万物、百川、阶跃星辰、360 智脑

### 推理平台

Groq、SiliconFlow、Together AI、Fireworks AI、Novita AI、Replicate、Cloudflare AI

### 其他

OpenRouter（聚合路由）、Ollama（本地推理）

## 支持的智能家居设备

灯光、开关/插座、空调/温控、窗帘/遮阳、风扇/新风、媒体播放器（电视/音箱/投影仪）、门锁、摄像头/门铃、扫地机、加湿器/除湿机、热水器、警报器、阀门、安防面板、割草机、厨房设备（破壁机/电饭煲/烤箱等）、传感器等 25+ 种类型

## 内置插件

| 插件 | 说明 |
|------|------|
| admin | 管理员操作 |
| official | 官方功能 |
| monitor | 系统监控 |
| repeater | 复读机 |
| runtime_manager | 运行时管理（Node.js / Python） |
| member_monitor | 群成员监控 |
| ban_monitor | 禁言监控 |
| cron_manager | 定时任务管理 |
| smarthome | 智能家居控制 |
| qq_smarthome_panel | QQ 智能家居面板 |
| user_profile | 用户画像 |
| agent_factory | 智能体工厂 |
| rebate | 返利转链 |
| rebate_admin | 返利管理 |
| rebate_user | 返利用户端 |
| order_track | 订单跟单 |
| manual_sync | 手动同步 |
| claudecode | Claude Code 集成 |
| framework_manager | 框架管理工具 |
