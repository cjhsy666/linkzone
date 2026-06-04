# 多模态

LinkZone 支持多模态 AI 交互，包括图片理解、音频处理和视频分析。

## 配置

```json
{
  "multimodal": {
    "enabled": true,
    "enable_image": true,
    "enable_audio": true,
    "enable_video": false,
    "image_model": "",
    "max_image_size": 5120,
    "image_wait_seconds": 3
  }
}
```

## 图片理解

启用后，用户发送图片时智能体可以理解图片内容：

- 图片描述：描述图片内容
- OCR：识别图片中的文字
- 图片分析：分析图表、截图等
- 视觉问答：基于图片内容回答问题

## 音频处理

- 语音识别：小智适配器内置 ASR（阿里云语音服务）
- 语音合成：智能体回复可通过 TTS 转换为语音

## 支持的模型

多模态功能需要使用支持视觉/音频的模型：

| 模型 | 图片 | 音频 |
|------|------|------|
| GPT-4o | ✅ | ✅ |
| Claude 3.5 Sonnet | ✅ | ❌ |
| Gemini Pro Vision | ✅ | ✅ |
| Qwen-VL | ✅ | ❌ |
