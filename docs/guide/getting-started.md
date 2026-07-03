# 快速开始

本页带你 5 分钟跑起 LinkZone。详细部署方式见 [安装部署](/guide/installation)。

## 环境要求

- **操作系统**：Linux / macOS / Windows
- **Node.js** 16+（可选，运行 Node.js 插件需要）
- **Python** 3.8+（可选，运行 Python 插件需要）

## 1. 下载

从官方渠道获取对应平台的二进制包，解压后进入目录：

```bash
tar -xzf linkzone-user-linux-amd64.tar.gz
cd linkzone
```

完整的平台版本列表见 [安装部署](/guide/installation#下载安装)。

## 2. 启动

```bash
# Linux / macOS
chmod +x linkzone-user
./linkzone-user

# Windows
linkzone-user-windows-amd64.exe
```

首次启动会自动创建工作目录、初始化数据库和默认配置，无需手动干预。

## 3. 验证运行

### 通过 Web 后台

启动后访问 `http://localhost:8080`，打开 Web 管理后台，可视化管理所有功能。

> 首次访问 Web 后台时，如配置了 `admin_token`，需要输入 Token 进行身份验证。

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

- [安装部署](/guide/installation) — systemd 守护进程、Docker 部署等
- [配置管理](/guide/configuration) — 端口、日志、运行时等配置说明
- [适配器系统](/features/adapter) — 连接 QQ、Web、小智等平台
- [插件开发](/plugin-dev/overview) — 开发自己的插件
