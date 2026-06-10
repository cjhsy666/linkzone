# 触发器

触发器定义了插件被激活的条件。LinkZone 支持四种触发类型：命令、关键词、正则和段匹配。

## 触发器类型

### 命令触发（type: 0）

最常用的触发方式，匹配以 `/` 开头的命令：

```javascript
// 精确匹配 /hello 命令
triggers: [{ type: 0, pattern: '/hello' }]
```

用户发送 `/hello` 或 `/hello world` 都会触发。命令后的内容作为参数传入。

### 关键词触发（type: 1）

消息中包含指定关键词时触发：

```javascript
// 消息包含"天气"即触发
triggers: [{ type: 1, pattern: '天气' }]

// 多个关键词（任一匹配即触发）
triggers: [
    { type: 1, pattern: '天气' },
    { type: 1, pattern: '气温' }
]
```

框架使用 **关键词 Trie** 实现高效匹配，支持大量关键词同时检测。

### 正则触发（type: 2）

使用正则表达式匹配消息内容：

```javascript
// 匹配日期格式
triggers: [{ type: 2, pattern: '^\\d{4}-\\d{2}-\\d{2}$' }]

// 匹配数字
triggers: [{ type: 2, pattern: '^\\d+$' }]
```

正则表达式在插件加载时预编译，运行时直接使用编译结果。

### 段触发（type: 3）

匹配消息段（图片、@、表情等）的类型和内容：

```javascript
// 匹配所有图片消息
triggers: [{
    type: 3,
    pattern: 'image',
    segment_mode: 0
}]

// 匹配包含特定 URL 的图片
triggers: [{
    type: 3,
    pattern: 'image',
    segment_mode: 2,
    segment_field: 'url',
    segment_regex: 'example\\.com'
}]
```

## 段匹配模式

| segment_mode | 名称 | 说明 |
|--------------|------|------|
| 0 | `type_only` | 仅匹配段类型 |
| 1 | `field_exact` | 段类型 + 指定字段精确匹配 |
| 2 | `field_regex` | 段类型 + 指定字段正则匹配 |
| 3 | `display_regex` | 段类型 + 显示文本正则匹配 |

## 事件类型

`event_types` 指定插件订阅的事件类型：

| 值 | 说明 |
|-----|------|
| `"message"` | 消息事件（默认） |
| `"notice"` | 通知事件（加群、退群等） |
| `"meta"` | 元事件 |

可以同时订阅多种事件：

```javascript
event_types: ['message', 'notice']
```

## 适配器过滤

`adapters` 字段限定插件只在特定平台上触发：

```javascript
// 仅在 QQ 和 Web 平台触发
adapters: ['qq', 'web']
```

留空表示所有平台都可触发。

## 多触发器组合

一个插件可以定义多个触发器，任一匹配即触发：

```javascript
triggers: [
    { type: 0, pattern: '/weather' },      // 命令触发
    { type: 1, pattern: '天气' },           // 关键词触发
    { type: 1, pattern: '气温' },           // 关键词触发
    { type: 2, pattern: '今天.*度' }        // 正则触发
]
```

## 权限等级

`permission_level` 控制触发插件的最低用户等级：

| 等级 | 说明 |
|------|------|
| 1 | 普通用户及以上（默认） |
| 2 | Lv2 用户及以上 |
| 3 | Lv3 用户及以上 |
| 4 | Lv4 用户及以上 |
| 5 | Lv5 用户及以上 |
| 6 | 管理员及以上 |
| 7 | 超级管理员 |

## 只听模式

`listen_only: true` 的插件可以在"只听群"中触发。普通插件在只听群中不会响应。

```javascript
metadata: {
    name: 'logger',
    listen_only: true,
    triggers: [{ type: 1, pattern: '' }],  // 匹配所有消息
    event_types: ['message']
}
```

## 注解式触发器

在注解式插件中，使用注释声明触发器：

### 命令触发

```javascript
/**
 * @command /hello
 */
```

### 关键词触发

```javascript
/**
 * @keyword 天气
 * @keyword 气温
 */
```

### 正则触发

```javascript
/**
 * @rule ^\\d{4}-\\d{2}-\\d{2}$
 */
```

### 多触发器组合

```javascript
/**
 * @command /weather
 * @keyword 天气
 * @keyword 气温
 * @rule 今天.*度
 */
```

### 段触发

段触发也支持注解式定义，使用 `@segment` 注解：

```javascript
/**
 * @segment image
 * @segment image.url=example\\.com
 * @segment image.url~https?://
 * @segment image|example\\.com
 */
```

`@segment` 语法格式：

| 格式 | 说明 | 示例 |
|------|------|------|
| `@segment <type>` | 匹配指定段类型 | `@segment image` |
| `@segment <type>.<field>=<pattern>` | 段类型 + 指定字段精确匹配 | `@segment image.url=example.com` |
| `@segment <type>.<field>~<pattern>` | 段类型 + 指定字段正则匹配 | `@segment image.url~https?://` |
| `@segment <type>\|<pattern>` | 段类型 + 显示文本正则匹配 | `@segment image\|example\\.com` |

> 注解式触发器支持命令（`@command`）、关键词（`@keyword`）、正则（`@rule`）和段匹配（`@segment`）四种类型。
