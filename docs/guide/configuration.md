# 配置管理

LinkZone 的配置文件位于 `data/config.yaml`，采用 YAML 数组格式存储。每个配置项包含 `key`、`value`、`type` 和 `comment` 四个字段。

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
- **value**：配置值，以字符串形式存储
- **type**：值类型（string / int / bool / json）
- **comment**：配置说明

首次启动时，框架会自动生成默认配置文件。后续版本升级新增的配置项也会自动合并到现有配置中。

## 全部配置项详解

### 核心配置

#### system.core.log_level

- **类型**：`string`
- **默认值**：`info`
- **可选值**：`debug` / `info` / `warn` / `error`
- **支持热更新**：是
- **说明**：控制框架的日志输出级别。

| 级别 | 说明 | 适用场景 |
|------|------|----------|
| `debug` | 输出所有调试信息 | 开发调试、排查问题 |
| `info` | 输出一般信息（默认） | 日常运行 |
| `warn` | 仅输出警告和错误 | 生产环境 |
| `error` | 仅输出错误 | 最小化日志 |

```yaml
- key: system.core.log_level
  value: info
  type: string
  comment: '日志级别 (可选: debug, info, warn, error)'
```

#### system.core.bot_name

- **类型**：`string`
- **默认值**：`LinkZone`
- **说明**：机器人的名称，用于在日志和界面中显示。

```yaml
- key: system.core.bot_name
  value: LinkZone
  type: string
  comment: 机器人名称
```

### 服务器配置

#### system.server.http_port

- **类型**：`string`
- **默认值**：`:8080`
- **说明**：HTTP 服务器监听的地址和端口。格式为 `:端口`（监听所有网卡）或 `IP:端口`（监听指定网卡）。

```yaml
# 监听所有网卡的 8080 端口（默认）
- key: system.server.http_port
  value: ":8080"

# 监听所有网卡的 9090 端口
- key: system.server.http_port
  value: ":9090"

# 仅监听本地回环地址
- key: system.server.http_port
  value: "127.0.0.1:8080"

# 监听 IPv6
- key: system.server.http_port
  value: "[::]:8080"
```

#### system.server.admin_token

- **类型**：`string`
- **默认值**：`""`（空）
- **说明**：Web 后台管理 API 的 Bearer Token。**强烈建议设置一个复杂字符串**，用于保护管理接口的安全。设置后，访问 Web 后台和调用管理 API 时需要验证此 Token。

```yaml
- key: system.server.admin_token
  value: "your-secure-random-token-here"
  type: string
  comment: Web 后台管理 API 的 Bearer Token
```

设置后，访问 Web 后台时需要输入此 Token 进行身份验证。

#### system.server.external_url

- **类型**：`string`
- **默认值**：`""`（空）
- **说明**：服务器的外部访问地址。当框架部署在有反向代理或 NAT 的环境中时，需要配置此地址，用于生成图片等资源的公网 URL。

```yaml
# 有域名的情况
- key: system.server.external_url
  value: "http://example.com"

# 有端口的情况
- key: system.server.external_url
  value: "http://example.com:8080"

# 使用 HTTPS
- key: system.server.external_url
  value: "https://example.com"
```

如果不需要生成外部可访问的 URL，可以留空。

### 许可证配置

#### system.license.key

- **类型**：`string`
- **默认值**：`""`（User Edition 内置默认密钥，开箱即用）
- **说明**：许可证密钥，从授权服务器获取。User Edition 内置默认密钥，无需手动配置即可启动。

```yaml
- key: system.license.key
  value: "你的许可证密钥"
  type: string
  comment: 许可证密钥 (从授权服务器获取)
```

许可证决定了你的可用功能范围：

| 许可证版本 | 功能范围 |
|-----------|---------|
| `community` | 基础功能、CLI 适配器，最多 10 个插件、2 个适配器 |
| `pro` | 完整功能、Web 管理、API 访问、远程插件，无插件和适配器数量限制 |
| `enterprise` | 全部功能，无任何限制 |

#### system.license.server_url

- **类型**：`string`
- **默认值**：`""`（空）
- **说明**：授权服务器地址。一般不需要配置，框架会使用内置的默认地址。只有在特殊网络环境下才需要手动指定。

```yaml
- key: system.license.server_url
  value: "https://license.example.com"
  type: string
  comment: '授权服务器地址 (例如: https://license.example.com,一般不需要配置)'
```

### 存储配置

#### system.storage.batch_size

- **类型**：`int`
- **默认值**：`100`
- **支持热更新**：否（需重启）
- **说明**：数据库批量写入的大小。当写入操作累积到指定数量时，一次性写入磁盘。值越大，写入性能越好，但异常退出时可能丢失更多数据。

```yaml
- key: system.storage.batch_size
  value: "100"
  type: int
  comment: 数据库批量写入的大小
```

#### system.storage.batch_interval_ms

- **类型**：`int`
- **默认值**：`1000`
- **支持热更新**：否（需重启）
- **说明**：数据库批量写入的最大等待间隔（毫秒）。即使未达到 `batch_size`，超过此间隔也会强制写入。确保数据不会长时间停留在内存中。

```yaml
- key: system.storage.batch_interval_ms
  value: "1000"
  type: int
  comment: 数据库批量写入的最大等待间隔 (毫秒)
```

### IPC 通信配置

#### system.socket.path

- **类型**：`string`
- **默认值**：`data/runtime/linkzone.sock`
- **说明**：IPC 通信地址，用于框架核心与外部运行时（Node.js / Python）之间的进程间通信。路径相对于框架根目录。

```yaml
- key: system.socket.path
  value: "data/runtime/linkzone.sock"
  type: string
  comment: IPC 通信地址 (相对于框架根目录)
```

一般不需要修改，除非遇到 Socket 文件冲突的情况。

### 运行时配置

#### system.runtimes.enabled

- **类型**：`bool`
- **默认值**：`false`
- **说明**：是否启用外置组件运行时（Node.js / Python）。**默认关闭**，如果你需要使用 Node.js 或 Python 插件，需要设置为 `true`。

```yaml
- key: system.runtimes.enabled
  value: "true"
  type: bool
  comment: 是否启用外置组件运行时 (Node.js/Python等, 默认关闭)
```

启用运行时的前提条件：
- 已安装 Node.js 16+（Node.js 插件需要）
- 已安装 Python 3.8+（Python 插件需要）
- `ecosystems/` 目录已解压（首次启动自动完成）

#### system.runtimes.config

- **类型**：`json`
- **默认值**：见下方
- **说明**：外部语言运行时的详细配置，定义了每个运行时的名称、语言、入口文件和插件目录。

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

每个运行时配置的字段说明：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 运行时名称，唯一标识 |
| `enabled` | bool | 是否启用此运行时 |
| `run_type` | string | 运行类型，目前固定为 `unified` |
| `language` | string | 编程语言（`node` / `python`） |
| `entrypoint` | string | 运行时入口文件路径 |
| `plugin_dir` | string | 插件目录路径 |
| `adapter_dir` | string | 适配器目录路径 |

如果你只需要 Node.js 插件，可以将 Python 运行时的 `enabled` 设为 `false`，反之亦然。

## 配置热更新

框架内置配置监听机制，修改 `data/config.yaml` 保存后自动检测变更：

| 配置项 | 是否支持热更新 | 说明 |
|--------|---------------|------|
| `system.core.log_level` | 是 | 日志级别变更立即生效 |
| `system.core.bot_name` | 是 | 名称变更立即生效 |
| `system.server.admin_token` | 是 | Token 变更立即生效 |
| `system.server.http_port` | 否 | 需重启生效 |
| `system.server.external_url` | 是 | 地址变更立即生效 |
| `system.storage.batch_size` | 否 | 需重启生效 |
| `system.storage.batch_interval_ms` | 否 | 需重启生效 |
| `system.runtimes.enabled` | 否 | 需重启生效 |
| `system.runtimes.config` | 否 | 需重启生效 |
| `system.license.key` | 否 | 需重启生效 |
| `system.socket.path` | 否 | 需重启生效 |

## 通过 Web 后台管理配置

在管理后台 → 系统设置中，可以可视化管理所有配置项，修改后即时生效（需要重启的配置项会有提示）。

## 配置文件示例

以下是一个完整的 User Edition 配置文件示例：

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
- key: system.socket.path
  value: data/runtime/linkzone.sock
  type: string
  comment: IPC 通信地址 (相对于框架根目录)
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
- key: system.license.key
  value: "你的许可证密钥"
  type: string
  comment: 许可证密钥 (从授权服务器获取)
- key: system.license.server_url
  value: ""
  type: string
  comment: '授权服务器地址 (例如: https://license.example.com,一般不需要配置)'
```
