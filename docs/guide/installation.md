# 安装部署

## 下载安装

### 1. 下载二进制文件

从官方渠道获取对应平台的二进制包：

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

首次启动会自动创建工作目录、初始化数据库和默认配置。

## 部署方式

### 直接运行

最简单的方式，适合开发测试：

```bash
./linkzone-user
```

### 守护进程（systemd）

适合生产环境：

```systemd
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

#### 方式一：docker run

```bash
docker run -d \
  --name linkzone \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /root/Linkzone:/app/Linkzone \
  -v /etc/machine-id:/etc/machine-id:ro \
  -e TZ=Asia/Shanghai \
  crpi-y4y1rse5movp8mob.cn-hangzhou.personal.cr.aliyuncs.com/linkzone/linkzone:latest
```

#### 方式二：docker-compose

创建 `docker-compose.yml`：

```yaml
services:
  linkzone:
    image: crpi-y4y1rse5movp8mob.cn-hangzhou.personal.cr.aliyuncs.com/linkzone/linkzone:latest
    container_name: linkzone
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - /root/Linkzone:/app/Linkzone
      - /etc/machine-id:/etc/machine-id:ro
    environment:
      - TZ=Asia/Shanghai
```

启动：

```bash
docker compose up -d
```

访问：`http://<服务器IP>:8080`

> `/etc/machine-id` 是宿主机标识，用于授权验证，请勿删除。

## 目录结构

```
linkzone/
├── linkzone-user          # 可执行文件
├── data/                  # 数据目录
│   ├── config.yaml        # 主配置文件
│   ├── linkzone.db        # 数据库文件
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

HTTP 端口可在配置文件中修改，详见 [配置管理](/guide/configuration)。

## 重启与关闭

```bash
# CLI
> system shutdown    # 关闭
> system restart     # 重启

# Web 后台：系统管理 → 关闭/重启
```

## 常见问题

### 端口被占用

修改 `data/config.yaml` 中的端口配置：

```yaml
- key: system.server.http_port
  value: ":9090"
```

### 目录权限问题

确保 `data/` 目录有读写权限：

```bash
chmod 755 data/
```

### 运行时初始化失败

Node.js 或 Python 运行时初始化失败不影响核心功能运行，但插件系统将不可用。请确保已安装对应运行时环境（Node.js 16+ / Python 3.8+）。
