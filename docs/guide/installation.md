# 安装部署

## 下载安装

### 1. 下载二进制文件

从官方渠道获取对应平台的二进制包。LinkZone 基于 Go 语言开发，支持全平台：

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

### 2. 赋予执行权限

Linux / macOS 需要赋予执行权限：

```bash
chmod +x linkzone-user
```

### 3. 首次运行

```bash
# Linux / macOS
./linkzone-user

# Windows
linkzone-user-windows-amd64.exe
```

首次启动时，框架会自动：
- 创建工作目录（`data/`、`logs/`、`plugins/`、`skills/`、`public/`）
- 初始化 BadgerDB 存储
- 解压内置的运行时生态（Node.js / Python SDK）
- 生成默认配置文件 `data/config.yaml`

## 部署方式

### 直接运行

最简单的方式，适合开发测试：

```bash
./linkzone-user
```

### 守护进程

通过 systemd 管理进程，适合生产环境：

```ini
# /etc/systemd/system/linkzone.service
[Unit]
Description=LinkZone Bot Framework
After=network.target

[Service]
Type=simple
User=linkzone
WorkingDirectory=/opt/linkzone
ExecStart=/opt/linkzone/linkzone-user
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable linkzone
sudo systemctl start linkzone
sudo systemctl status linkzone
```

### Docker 部署

```dockerfile
FROM alpine:latest
RUN apk add --no-cache nodejs python3
WORKDIR /app
COPY linkzone-user .
COPY data/ ./data/
RUN chmod +x linkzone-user
EXPOSE 8080
CMD ["./linkzone-user"]
```

```bash
docker build -t linkzone .
docker run -d -p 8080:8080 -v /path/to/data:/app/data linkzone
```

## 目录结构

运行后，LinkZone 会创建以下目录结构：

```
linkzone/
├── linkzone-user          # 可执行文件
├── data/                  # 数据目录
│   ├── config.yaml        # 主配置文件
│   ├── linkzone.db        # BadgerDB 数据文件
│   └── runtime/           # 运行时通信文件
├── logs/                  # 日志目录
├── plugins/               # 用户插件目录
├── skills/                # 技能配置目录
├── public/                # 静态资源
└── ecosystems/            # 运行时生态（自动解压）
    ├── nodejs/            # Node.js 运行时和 SDK
    └── python/            # Python 运行时和 SDK
```

## 端口说明

| 端口 | 协议 | 说明 |
|------|------|------|
| 8080 | HTTP | Web 管理界面和 RESTful API |
| - | Unix Socket | 内部进程通信（默认 `data/runtime/linkzone.sock`） |

HTTP 端口和 Socket 路径均可在配置文件中修改。

## 启动流程

LinkZone 启动时的初始化顺序：

1. **初始化工作目录** — 创建 `data/`、`logs/` 等必要目录
2. **初始化存储** — 初始化 BadgerDB、加载配置
3. **初始化 LLM 服务** — 加载 LLM 供应商配置
4. **初始化智能体** — 创建智能体管理器
5. **注册组件** — 注册适配器、内置插件等
6. **启动服务** — 启动 HTTP 服务器、Bot 核心、Unix Socket、运行时管理器
7. **事件监听** — 监听系统信号（SIGINT/SIGTERM）

## 重启与关闭

### 正常关闭

通过 CLI 命令或 Web 后台触发优雅关闭：

```bash
# CLI
> system shutdown

# Web 后台：系统管理 → 关闭
```

### 重启

```bash
# CLI
> system restart

# Web 后台：系统管理 → 重启
```

重启时，框架会优雅关闭所有服务，然后通过 `syscall.Exec` 替换当前进程实现热重启。

## 常见问题

### 端口被占用

修改 `data/config.yaml` 中的端口配置：

```yaml
- key: system.server.http_port
  value: ":9090"
```

### 存储初始化失败

检查 `data/` 目录的读写权限：

```bash
chmod 755 data/
```

### 运行时初始化失败

Node.js 或 Python 运行时初始化失败不影响核心功能运行，但插件系统将不可用。确保已安装对应运行时环境。
