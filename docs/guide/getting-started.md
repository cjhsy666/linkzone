# 快速开始

## 环境准备

在开始之前，请确保你的系统满足以下要求：

- **操作系统**：Linux / macOS / Windows（全平台支持）
- **架构**：AMD64 / ARM64
- **Node.js** 16+（用于 Node.js 插件运行时）
- **Python** 3.8+（可选，用于 Python 插件运行时）

## 安装

### 1. 下载

从官方渠道获取 LinkZone User Edition 二进制文件，选择适合你平台的版本：

| 平台 | 架构 | 文件名 |
|------|------|--------|
| Linux | AMD64 | `linkzone-user-linux-amd64` |
| Linux | ARM64 | `linkzone-user-linux-arm64` |
| macOS | AMD64 | `linkzone-user-darwin-amd64` |
| macOS | ARM64 (Apple Silicon) | `linkzone-user-darwin-arm64` |
| Windows | AMD64 | `linkzone-user-windows-amd64.exe` |
| Windows | ARM64 | `linkzone-user-windows-arm64.exe` |

下载后解压并进入目录：

```bash
tar -xzf linkzone-user-linux-amd64.tar.gz
cd linkzone
```

### 2. 启动

```bash
# Linux / macOS
chmod +x linkzone-user
./linkzone-user

# Windows
linkzone-user-windows-amd64.exe
```

启动后，框架会自动：
- 初始化工作目录和存储
- 验证许可证（User Edition 内置默认密钥，开箱即用）
- 解压并初始化运行时生态（Node.js / Python）
- 加载内置组件和适配器
- 启动 HTTP 服务器（默认端口 8080）
- 启动 CLI 交互界面

## 验证运行

### 通过 Web 后台

启动后访问 `http://localhost:8080`，打开 Web 管理后台，可以可视化管理所有功能。

### 通过 CLI 交互

启动后可直接在终端输入命令：

```
> help
Available commands:
  help          Show this help
  agents        Manage agents
  channels      Manage channels
  components    Manage components
  smarthome     Manage smart home devices
  system        Manage system settings
  users         Manage users
```

## 下一步

- [安装部署](/guide/installation) — 了解更多部署方式
- [配置管理](/guide/configuration) — 详细配置说明
- [适配器系统](/features/adapter) — 连接各种通信渠道
- [插件开发](/plugin-dev/overview) — 开发自己的插件
