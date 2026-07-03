# 配置管理

LinkZone 的配置文件位于 `data/config.yaml`，采用 YAML 数组格式存储。所有配置项也可在 Web 后台 → 系统设置中可视化管理。

## 配置文件格式

```yaml
- key: system.core.log_level
  value: info
  type: string
  comment: '日志级别 (可选: debug, info, warn, error)'

- key: system.server.http_port
  value: ":8080"
  type: string
  comment: HTTP 服务器监听的地址和端口
```

- **key**：配置项的唯一标识，使用 `.` 分隔层级
- **value**：配置值（以字符串形式存储）
- **type**：值类型（`string` / `int` / `bool` / `json`）
- **comment**：配置说明

首次启动时自动生成默认配置。版本升级新增的配置项会自动合并到现有配置中。

## 常用配置

### 日志级别

```yaml
- key: system.core.log_level
  value: info
  type: string
  comment: '日志级别 (可选: debug, info, warn, error)'
```

| 级别 | 适用场景 |
|------|----------|
| `debug` | 开发调试、排查问题 |
| `info` | 日常运行（默认） |
| `warn` | 生产环境 |
| `error` | 最小化日志 |

支持热更新，修改后立即生效。

### HTTP 端口

```yaml
- key: system.server.http_port
  value: ":8080"
  type: string
  comment: HTTP 服务器监听的地址和端口
```

格式说明：
- `:8080` — 监听所有网卡的 8080 端口（默认）
- `127.0.0.1:8080` — 仅监听本地回环
- `[::]:8080` — 监听 IPv6

> 需要重启生效。

### 管理后台 Token

```yaml
- key: system.server.admin_token
  value: "your-secure-random-token-here"
  type: string
  comment: Web 后台管理 API 的 Bearer Token
```

**强烈建议设置一个复杂字符串**，用于保护管理接口。设置后访问 Web 后台需要输入此 Token。支持热更新。

### 外部访问地址

```yaml
- key: system.server.external_url
  value: "http://example.com:8080"
  type: string
  comment: '服务器外部访问地址 (用于生成图片等资源的公网URL)'
```

当框架部署在有反向代理或 NAT 的环境中时需要配置，用于生成外部可访问的 URL。留空则不生成外部 URL。支持热更新。

### 机器人名称

```yaml
- key: system.core.bot_name
  value: LinkZone
  type: string
  comment: 机器人名称
```

用于日志和界面显示。支持热更新。

### IPC 通信地址

```yaml
- key: system.socket.path
  value: Linkzone/data/runtime/linkzone.sock
  type: string
  comment: IPC 通信地址 (相对于框架根目录)
```

框架核心与外置运行时（Node.js/Python）通过 Unix Socket 通信。如需调整路径可修改此项。

> 需要重启生效。

### 许可证密钥

```yaml
- key: system.license.key
  value: ""
  type: string
  comment: 许可证密钥 (从授权服务器获取)
```

用于激活商业版功能。个人使用可留空。支持热更新。

## 运行时配置

如果你需要使用 Node.js 或 Python 插件，必须启用外置运行时：

```yaml
- key: system.runtimes.enabled
  value: "true"
  type: bool
  comment: 是否启用外置组件运行时 (Node.js/Python等, 默认关闭)
```

启用前提：
- 已安装 Node.js 16+（Node.js 插件需要）
- 已安装 Python 3.8+（Python 插件需要）
- `ecosystems/` 目录已解压（首次启动自动完成）

### 运行时详细配置

```yaml
- key: system.runtimes.config
  value: |-
    [
      {
        "name": "nodejs-runtime",
        "enabled": true,
        "run_type": "unified",
        "language": "node",
        "entrypoint": "ecosystems/nodejs/runtime.js",
        "plugin_dir": "ecosystems/nodejs/plugins",
        "adapter_dir": "ecosystems/nodejs/adapters"
      },
      {
        "name": "python-runtime",
        "enabled": true,
        "run_type": "unified",
        "language": "python",
        "entrypoint": "runtime.py",
        "plugin_dir": "plugins",
        "adapter_dir": "adapters"
      }
    ]
  type: json
  comment: 外部语言运行时配置
```

如果你只需要 Node.js 插件，可将 Python 运行时的 `enabled` 设为 `false`，反之亦然。

> 运行时配置需重启生效。

## 存储配置

```yaml
# 批量写入大小（写入操作累积到指定数量时写入磁盘）
- key: system.storage.batch_size
  value: "100"
  type: int
  comment: 数据库批量写入的大小

# 批量写入最大等待间隔（毫秒）
- key: system.storage.batch_interval_ms
  value: "1000"
  type: int
  comment: 数据库批量写入的最大等待间隔 (毫秒)
```

> 存储配置需重启生效。

## 热更新支持

| 配置项 | 热更新 |
|--------|--------|
| `system.core.log_level` | ✅ |
| `system.core.bot_name` | ✅ |
| `system.server.admin_token` | ✅ |
| `system.server.external_url` | ✅ |
| `system.license.key` | ✅ |
| `system.server.http_port` | ❌ 需重启 |
| `system.socket.path` | ❌ 需重启 |
| `system.storage.batch_size` | ❌ 需重启 |
| `system.storage.batch_interval_ms` | ❌ 需重启 |
| `system.runtimes.enabled` | ❌ 需重启 |
| `system.runtimes.config` | ❌ 需重启 |

## 通过 Web 后台管理

在管理后台 → 系统设置中，可以可视化管理所有配置项，修改后即时生效（需要重启的配置项会有提示）。

## 完整配置示例

```yaml
- key: system.core.log_level
  value: info
  type: string
  comment: '日志级别 (可选: debug, info, warn, error)'
- key: system.core.bot_name
  value: LinkZone
  type: string
  comment: 机器人名称
- key: system.server.http_port
  value: ":8080"
  type: string
  comment: HTTP 服务器监听的地址和端口
- key: system.server.admin_token
  value: "my-secure-token-12345"
  type: string
  comment: Web 后台管理 API 的 Bearer Token
- key: system.server.external_url
  value: ""
  type: string
  comment: '服务器外部访问地址 (例如: http://example.com，用于生成图片公网URL)'
- key: system.storage.batch_size
  value: "100"
  type: int
  comment: 数据库批量写入的大小
- key: system.storage.batch_interval_ms
  value: "1000"
  type: int
  comment: 数据库批量写入的最大等待间隔 (毫秒)
- key: system.runtimes.enabled
  value: "true"
  type: bool
  comment: 是否启用外置组件运行时 (Node.js/Python等, 默认关闭)
- key: system.runtimes.config
  value: |-
    [
      {
        "name": "nodejs-runtime",
        "enabled": true,
        "run_type": "unified",
        "language": "node",
        "entrypoint": "ecosystems/nodejs/runtime.js",
        "plugin_dir": "ecosystems/nodejs/plugins",
        "adapter_dir": "ecosystems/nodejs/adapters"
      },
      {
        "name": "python-runtime",
        "enabled": true,
        "run_type": "unified",
        "language": "python",
        "entrypoint": "runtime.py",
        "plugin_dir": "plugins",
        "adapter_dir": "adapters"
      }
    ]
  type: json
  comment: 外部语言运行时配置
```
