# 系统 API

LinkZone 提供 RESTful API 用于管理和操作框架。所有管理 API 需要认证。

## 基础信息

- **基础 URL**：`http://localhost:8080/api/v1`
- **认证方式**：Bearer Token（`system.server.admin_token` 配置项）
- **内容类型**：`application/json`

## 公开接口

### 健康检查

```
GET /health
```

### 系统状态

```
GET /status
```

### 登录

```
POST /login
```

### 许可证状态

```
GET /license/status
```

### 刷新许可证

```
POST /license/refresh
```

## 系统管理

### 获取系统统计

```
GET /admin/system/stats
```

### 获取系统信息

```
GET /admin/system/info
```

### 重启系统

```
POST /admin/system/restart
```

### 强制 GC

```
POST /admin/system/gc
```

## 配置管理

### 获取所有配置

```
GET /admin/configs
```

### 获取指定配置

```
GET /admin/configs/{key}
```

### 更新配置

```
PUT /admin/configs/{key}
```

请求体：

```json
{
    "key": "system.core.log_level",
    "value": "debug"
}
```

### 批量更新配置

```
POST /admin/configs/batch
```

### 删除配置

```
DELETE /admin/configs/{key}
```

## 监控

### 获取健康状态

```
GET /admin/monitor/health
```

### 获取事件总线指标

```
GET /admin/monitor/metrics/event-bus
```

### 获取组件指标

```
GET /admin/monitor/metrics/components
```

### 获取详细指标

```
GET /admin/monitor/metrics/detailed
```

### 获取错误统计

```
GET /admin/monitor/errors
GET /admin/monitor/errors/stats
```

### 获取状态报告

```
GET /admin/monitor/state
```

### 获取断开连接的组件

```
GET /admin/monitor/disconnected
```

## 组件管理

### 获取组件列表

```
GET /admin/components
```

### 获取组件详情

```
GET /admin/components/{name}
```

### 执行组件动作

```
POST /admin/components/{name}/action
```

请求体：

```json
{
    "action": "start"
}
```

支持的动作：`start`、`stop`、`reload`

### 获取组件配置

```
GET /admin/components/{name}/config
```

### 更新组件配置

```
PUT /admin/components/{name}/config
```

### 获取组件触发器

```
GET /admin/components/{name}/triggers
```

## 运行时管理

### 获取运行时列表

```
GET /admin/system/runtime/list
```

### 重启运行时

```
POST /admin/system/runtime/{name}/restart
```

### 获取运行时状态

```
GET /admin/system/runtime/{name}/status
```

## 定时任务管理

### 获取定时任务列表

```
GET /admin/scheduler/jobs
```

### 创建定时任务

```
POST /admin/scheduler/jobs
```

### 获取定时任务详情

```
GET /admin/scheduler/jobs/{id}
```

### 更新定时任务

```
PATCH /admin/scheduler/jobs/{id}
```

### 删除定时任务

```
DELETE /admin/scheduler/jobs/{id}
```

### 手动触发定时任务

```
POST /admin/scheduler/jobs/{id}/trigger
```

### 启用/禁用定时任务

```
POST /admin/scheduler/jobs/{id}/enable
POST /admin/scheduler/jobs/{id}/disable
```

## LLM 管理

### 获取模型列表

```
GET /admin/llm/models
```

### 获取 Upstream 列表

```
GET /admin/llm/upstreams
```

### 创建 Upstream

```
POST /admin/llm/upstreams
```

### 更新 Upstream

```
PUT /admin/llm/upstreams/{id}
```

### 删除 Upstream

```
DELETE /admin/llm/upstreams/{id}
```

### 测试 Upstream 连通性

```
POST /admin/llm/upstreams/{id}/test
```

### 自动获取模型列表

```
POST /admin/llm/upstreams/{id}/fetch-models
```

### 设置模型回退

```
POST /admin/llm/fallbacks
```

### 删除模型回退

```
DELETE /admin/llm/fallbacks/{model}
```
