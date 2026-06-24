# 触发器

触发器（Trigger）定义了插件被激活的条件。当消息匹配某个触发器时，框架会将消息分发给对应的插件处理。

## 触发器类型

| type | 名称 | 说明 |
|------|------|------|
| `0` | 命令触发 | 精确匹配命令前缀（如 `/hello`） |
| `1` | 关键词触发 | 消息中包含指定关键词 |
| `2` | 正则触发 | 消息匹配正则表达式 |
| `3` | 段匹配触发 | 消息段（CQ码/消息段）匹配 |

## 命令触发（type: 0）

精确匹配以指定前缀开头的命令：

```javascript
// Node.js
triggers: [
    { type: 0, pattern: '/hello' }
]
```

```python
# Python
"triggers": [{"type": 0, "pattern": "/hello"}]
```

匹配规则：
- 消息以 `pattern` 开头即匹配
- 支持参数：`/hello 世界` → 命令 `/hello`，参数 `世界`
- 通过 `sender.param(0)` / `sender.param(0)` 获取参数

### 命令触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `0` |
| `pattern` | string | 是 | 命令前缀（如 `/hello`） |

## 关键词触发（type: 1）

消息中包含指定关键词即触发：

```javascript
// Node.js
triggers: [
    { type: 1, pattern: '你好' }
]
```

```python
# Python
"triggers": [{"type": 1, "pattern": "你好"}]
```

匹配规则：
- 消息文本中**包含** `pattern` 子串即匹配
- 大小写不敏感（可选，由框架配置决定）

### 关键词触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `1` |
| `pattern` | string | 是 | 关键词 |

## 正则触发（type: 2）

使用正则表达式匹配消息：

```javascript
// Node.js
triggers: [
    { type: 2, pattern: '^抽奖\\s*(\\d+)' }
]
```

```python
# Python
"triggers": [{"type": 2, "pattern": r"^抽奖\s*(\d+)"}]
```

匹配规则：
- 使用 JavaScript 正则语法（Node.js）/ Python 正则语法（Python）
- 匹配时自动提取捕获组，可通过 `sender` 的捕获组方法访问

### 正则触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `2` |
| `pattern` | string | 是 | 正则表达式字符串 |

### 捕获组访问

正则匹配成功后，捕获组会自动设置到 Sender 上：

```javascript
// Node.js
// 触发器: { type: 2, pattern: '^抽奖\\s*(\\d+)' }
// 消息: "抽奖 5"
async handleMessage(sender) {
    const count = await sender.param(0); // "5"
}
```

```python
# Python
# 触发器: {"type": 2, "pattern": r"^抽奖\s*(\d+)"}
# 消息: "抽奖 5"
def handle_message(sender):
    count = sender.param(0)  # "5"
```

## 段匹配触发（type: 3）

匹配消息中的特定消息段（如图片、@等）：

```javascript
// Node.js
triggers: [
    { type: 3, segment: 'image', segment_mode: 0 }   // 匹配包含图片的消息
]
```

```python
# Python
"triggers": [{"type": 3, "segment": "image", "segment_mode": 0}]
```

### 段匹配触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `3` |
| `segment` | string | 是 | 消息段类型名称 |
| `segment_mode` | number | 否 | 匹配模式（默认 0） |
| `segment_field` | string | 否 | 指定字段名（segment_mode 1/2 时必填） |
| `pattern` | string | 否 | 匹配模式（segment_mode 1/2/3 时必填） |

### segment_mode 说明

| mode | 名称 | 说明 |
|------|------|------|
| `0` | type_only | 仅匹配段类型 |
| `1` | field_exact | 段类型 + 指定字段精确匹配 |
| `2` | field_regex | 段类型 + 指定字段正则匹配 |
| `3` | display_regex | 段类型 + 显示文本正则匹配 |

### 段匹配示例

```javascript
// Node.js
// 匹配所有图片
triggers: [{ type: 3, segment: 'image', segment_mode: 0 }]

// 匹配包含特定 URL 的图片（字段精确匹配）
triggers: [{ type: 3, segment: 'image', segment_field: 'url', pattern: 'example.com', segment_mode: 1 }]

// 匹配 URL 符合正则的图片（字段正则匹配）
triggers: [{ type: 3, segment: 'image', segment_field: 'url', pattern: 'example\\.com', segment_mode: 2 }]
```

```python
# Python
# 匹配所有图片
"triggers": [{"type": 3, "segment": "image", "segment_mode": 0}]

# 匹配包含特定 URL 的图片（字段精确匹配）
"triggers": [{"type": 3, "segment": "image", "segment_field": "url", "pattern": "example.com", "segment_mode": 1}]

# 匹配 URL 符合正则的图片（字段正则匹配）
"triggers": [{"type": 3, "segment": "image", "segment_field": "url", "pattern": "example\\.com", "segment_mode": 2}]
```

### 注解式段触发

```javascript
// Node.js
// @segment image                           // 匹配所有图片
// @segment image.url=example.com           // 匹配特定 URL
// @segment image.url~https?://             // 匹配 URL 正则
// @segment image|example\\.com             // 匹配显示文本正则
```

```python
# Python
"""
@segment image                           # 匹配所有图片
@segment image.url=example.com           # 匹配特定 URL
@segment image.url~https?://             # 匹配 URL 正则
@segment image|example\\.com             # 匹配显示文本正则
"""
```

常见段匹配 pattern：

| pattern | 说明 |
|---------|------|
| `image` | 图片消息 |
| `at` | @消息 |
| `face` | 表情消息 |
| `voice` | 语音消息 |
| `video` | 视频消息 |
| `file` | 文件消息 |
| `json` | JSON卡片 |
| `xml` | XML卡片 |
| `forward` | 合并转发 |

## 多触发器

一个插件可以定义多个触发器，满足任一即触发：

```javascript
// Node.js
triggers: [
    { type: 0, pattern: '/weather' },
    { type: 1, pattern: '天气' },
    { type: 2, pattern: '今天.*温度' }
]
```

```python
# Python
"triggers": [
    {"type": 0, "pattern": "/weather"},
    {"type": 1, "pattern": "天气"},
    {"type": 2, "pattern": "今天.*温度"}
]
```

## 无触发器插件

不定义触发器的插件不会响应消息，但仍然可以：
- 通过 `cron` 执行定时任务
- 通过 `ai.tool` 被 AI 调用
- 作为工具库被其他插件引用

```javascript
// Node.js - 定时任务插件（无触发器）
module.exports = {
    metadata: {
        name: 'daily-report',
        cron: '0 9 * * *',
        is_service: true
    },
    async onCron() {
        await LinkZone.push('qq', 'group_123', '今日报告...');
    }
};
```

```python
# Python - 定时任务插件（无触发器）
class DailyReportPlugin(Plugin):
    def on_cron(self):
        LinkZone.push("qq", "group_123", "今日报告...")

DailyReportPlugin.metadata = {
    "name": "daily-report",
    "cron": "0 9 * * *",
    "is_service": True
}
```

## 触发器与权限

触发器匹配后，框架还会检查权限：

1. **permission_level**：用户/群的等级 ≥ 插件等级才能触发
2. **adapters**：消息来源平台必须在限定列表内
3. **listen_only**：是否允许在只听群触发

```javascript
// Node.js
metadata: {
    name: 'admin-cmd',
    triggers: [{ type: 0, pattern: '/ban' }],
    permission_level: 6,           // 仅管理员
    adapters: ['qq'],              // 仅 QQ 平台
    listen_only: true              // 允许只听群
}
```

```python
# Python
metadata = {
    "name": "admin-cmd",
    "triggers": [{"type": 0, "pattern": "/ban"}],
    "permission_level": 6,         # 仅管理员
    "adapters": ["qq"],            # 仅 QQ 平台
    "listen_only": True            # 允许只听群
}
```

## 触发优先级

当多个插件的触发器同时匹配时，按 `priority` 排序执行：

- `priority` 值越小，越先执行
- 默认 `priority: 0`
- 同 priority 按注册顺序执行

```javascript
// Node.js
// 高优先级插件（先执行）
metadata: {
    name: 'content-filter',
    triggers: [{ type: 1, pattern: '违规词' }],
    priority: -10
}

// 普通优先级
metadata: {
    name: 'echo',
    triggers: [{ type: 0, pattern: '/echo' }],
    priority: 0
}
```

```python
# Python
# 高优先级插件（先执行）
metadata = {
    "name": "content-filter",
    "triggers": [{"type": 1, "pattern": "违规词"}],
    "priority": -10
}

# 普通优先级
metadata = {
    "name": "echo",
    "triggers": [{"type": 0, "pattern": "/echo"}],
    "priority": 0
}
```

## 执行阶段

`stage` 字段控制插件的执行方式：

| stage | 说明 |
|-------|------|
| `0` | 顺序执行（默认），前一个插件完成后才执行下一个 |
| `1` | 并行执行，同 stage 的插件同时执行 |

```javascript
// Node.js
metadata: {
    name: 'parallel-logger',
    triggers: [{ type: 1, pattern: '日志' }],
    stage: 1
}
```

```python
# Python
metadata = {
    "name": "parallel-logger",
    "triggers": [{"type": 1, "pattern": "日志"}],
    "stage": 1
}
```

## event_types 与触发器

`event_types` 决定插件订阅哪些事件类型：

| event_type | 说明 | 对应钩子 |
|------------|------|---------|
| `"message"` | 消息事件 | `handleMessage` / `handle_message` |
| `"notice"` | 通知事件（入群、撤回等） | `onEvent` / `on_event` |
| `"meta"` | 元事件（心跳等） | `onEvent` / `on_event` |

> 当定义了 `triggers` 时，`event_types` 自动设为 `["message"]`。如需监听通知或元事件，需手动指定。

## 框架内部事件订阅

通过 `subscribe` 字段订阅框架内部事件，事件触发时调用 `onEvent(event)` / `on_event(event)`：

```javascript
// Node.js
class MyPlugin extends Plugin {
    async onEvent(event) {
        switch (event.name) {
            case 'adapter.connected':
                LinkZone.logger.info('适配器已连接:', event.data.platform);
                break;
            case 'config.changed':
                await this.reloadConfig();
                break;
        }
    }
}

MyPlugin.metadata = {
    name: 'my-plugin',
    version: '1.0.0',
    subscribe: ['adapter.connected', 'adapter.disconnected', 'config.changed'],
};
```

```python
# Python
class MyPlugin(Plugin):
    def on_event(self, event):
        if event["name"] == "adapter.connected":
            LinkZone.logger.info("适配器已连接:", event["data"]["platform"])
        elif event["name"] == "config.changed":
            self.reload_config()

MyPlugin.metadata = {
    "name": "my-plugin",
    "version": "1.0.0",
    "subscribe": ["adapter.connected", "adapter.disconnected", "config.changed"],
}
```
