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
triggers: [
    { type: 0, pattern: '/hello' }
]
```

匹配规则：
- 消息以 `pattern` 开头即匹配
- 支持参数：`/hello 世界` → 命令 `/hello`，参数 `世界`
- 通过 `sender.param(0)` 获取参数

### 命令触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `0` |
| `pattern` | string | 是 | 命令前缀（如 `/hello`） |

## 关键词触发（type: 1）

消息中包含指定关键词即触发：

```javascript
triggers: [
    { type: 1, pattern: '你好' }
]
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
triggers: [
    { type: 2, pattern: '^抽奖\\s*(\\d+)' }
]
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
// 触发器: { type: 2, pattern: '^抽奖\\s*(\\d+)' }
// 消息: "抽奖 5"
async handleMessage(sender) {
    // 通过 param 获取
    const count = await sender.param(0); // "5"
}
```

## 段匹配触发（type: 3）

匹配消息中的特定消息段（如图片、@等）：

```javascript
triggers: [
    { type: 3, pattern: 'image' }   // 匹配包含图片的消息
]
```

匹配规则：
- `pattern` 指定消息段类型
- 消息中包含该类型的消息段即匹配

### 段匹配触发参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | number | 是 | `3` |
| `pattern` | string | 是 | 消息段类型名称 |

常见的段匹配 pattern：

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
triggers: [
    { type: 0, pattern: '/weather' },
    { type: 1, pattern: '天气' },
    { type: 2, pattern: '今天.*温度' }
]
```

## 无触发器插件

不定义触发器的插件不会响应消息，但仍然可以：
- 通过 `cron` 执行定时任务
- 通过 `tool` 被 AI 调用
- 作为 loaded 模式的工具库被其他插件引用

```javascript
// 定时任务插件（无触发器）
module.exports = {
    metadata: {
        name: 'daily-report',
        cron: '0 9 * * *',
        lifecycle_mode: 'persistent'
    },
    async handleCron() {
        await LinkZone.sendGroupMessage('group_123', '今日报告...');
    }
};
```

## 触发器与权限

触发器匹配后，框架还会检查权限：

1. **permission_level**：用户/群的等级 ≥ 插件等级才能触发
2. **adapters**：消息来源平台必须在限定列表内
3. **listen_only**：是否允许在只听群触发

```javascript
metadata: {
    name: 'admin-cmd',
    triggers: [{ type: 0, pattern: '/ban' }],
    permission_level: 6,           // 仅管理员
    adapters: ['qq'],              // 仅 QQ 平台
    listen_only: true              // 允许只听群
}
```

## 触发优先级

当多个插件的触发器同时匹配时，按 `priority` 排序执行：

- `priority` 值越小，越先执行
- 默认 `priority: 0`
- 同 priority 按注册顺序执行

```javascript
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

## 执行阶段

`stage` 字段控制插件的执行方式：

| stage | 说明 |
|-------|------|
| `0` | 顺序执行（默认），前一个插件完成后才执行下一个 |
| `1` | 并行执行，同 stage 的插件同时执行 |

```javascript
// 并行执行的插件
metadata: {
    name: 'parallel-logger',
    triggers: [{ type: 1, pattern: '日志' }],
    stage: 1
}
```

## event_types 与触发器

`event_types` 决定插件订阅哪些事件类型：

| event_type | 说明 | 对应钩子 |
|------------|------|---------|
| `"message"` | 消息事件 | `handleMessage` |
| `"notice"` | 通知事件（入群、撤回等） | `handleNotice` |
| `"meta"` | 元事件（心跳等） | `handleMeta` |

> 当定义了 `triggers` 时，`event_types` 自动设为 `["message"]`。如需监听通知或元事件，需手动指定。
