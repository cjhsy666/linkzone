# 插件系统

插件是扩展 LinkZone 功能的核心机制。框架内置多种插件，同时支持用户通过 Node.js / Python 开发自定义插件。

## 内置插件

| 插件 | 说明 |
|------|------|
| `admin` | 管理员操作 |
| `official` | 官方功能 |
| `monitor` | 系统监控 |
| `repeater` | 复读机 |
| `runtime_manager` | 运行时管理（Node.js / Python） |
| `member_monitor` | 群成员监控 |
| `ban_monitor` | 禁言监控 |
| `cron_manager` | 定时任务管理 |
| `smarthome` | 智能家居控制 |
| `qq_smarthome_panel` | QQ 智能家居面板 |
| `user_profile` | 用户画像 |
| `agent_factory` | 智能体工厂 |
| `rebate` | 返利转链 |
| `rebate_admin` | 返利管理 |
| `rebate_user` | 返利用户端 |
| `order_track` | 订单跟单 |
| `manual_sync` | 手动同步 |
| `claudecode` | Claude Code 集成 |
| `framework_manager` | 框架管理工具（AI 可直接操作框架所有功能） |

## 插件触发方式

插件通过触发器来决定何时响应消息：

| 触发类型 | 说明 | 示例 |
|---------|------|------|
| 命令 | 以 `/` 开头的指令 | `/hello` |
| 关键词 | 消息包含指定文字 | `天气` |
| 正则 | 匹配正则表达式 | `^\d+$` |
| 段消息 | 匹配特定消息段类型（图片、@ 等） | 图片消息 |
| AI 工具 | 由智能体在对话中自动调用 | 查询天气 |

## 权限等级

| 等级 | 说明 |
|------|------|
| 1 | 普通用户及以上（默认） |
| 2 | Lv2 用户及以上 |
| 3 | Lv3 用户及以上 |
| 4 | Lv4 用户及以上 |
| 5 | Lv5 用户及以上 |
| 6 | 管理员及以上 |
| 7 | 超级管理员 |

## 开发自定义插件

详见 [插件开发](/plugin-dev/overview) 章节。
