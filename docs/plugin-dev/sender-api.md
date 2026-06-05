# Sender API

Sender 是消息上下文对象，在插件处理消息时传入，提供了消息读取、回复、用户信息、群管理等一系列方法。

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `platform` | string | 来源平台（qq / web / cli / xiaozhi ...） |
| `bot_id` | string | 机器人 ID |
| `sender_id` | string | 发送者 ID |
| `sender_name` | string | 发送者名称 |
| `receiver_id` | string | 接收者 ID |
| `receiver_type` | string | 接收者类型（`private` / `group`） |
| `group_id` | string | 群组 ID（私聊时为空） |
| `group_name` | string | 群组名称 |
| `message` | string | 消息文本 |
| `message_id` | string | 消息 ID |
| `plugin_name` | string | 当前插件名 |
| `segments` | array | 消息段列表 |
| `extra` | object | 附加数据 |
| `timestamp` | number | 时间戳 |
| `permission_level` | number | 用户权限等级 |
| `is_group` | boolean | 是否群聊 |
| `is_private` | boolean | 是否私聊 |

## 方法列表

### 基础信息

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 获取消息文本 | 获取原始消息文本 | `getMessage()` | `get_message()` |
| 获取发送者 ID | 获取发送者唯一标识 | `getSenderId()` | `get_sender_id()` |
| 获取发送者名称 | 获取发送者昵称 | `getSenderName()` | `get_sender_name()` |
| 获取平台 | 获取来源平台 | `getPlatform()` | `get_platform()` |
| 获取群组 ID | 获取群组标识 | `getGroupId()` | `get_group_id()` |
| 获取群组名称 | 获取群组名称 | `getGroupName()` | `get_group_name()` |
| 获取消息 ID | 获取消息唯一标识 | `getMessageId()` | `get_message_id()` |
| 获取机器人 ID | 获取当前机器人标识 | `getBotId()` | `get_bot_id()` |
| 获取接收者 ID | 获取接收者标识 | `getReceiverId()` | `get_receiver_id()` |

### 身份判断

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 是否管理员 | 否 | 判断发送者是否管理员（permission_level >= 6） | `isAdmin()` | `is_admin()` |
| 是否群聊 | 否 | 判断是否群聊消息 | `isGroup()` | `is_group()` |
| 是否私聊 | 否 | 判断是否私聊消息 | `isPrivate()` | `is_private()` |

### 消息前缀

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 检查前缀 | 是 | 检查消息是否以指定前缀开头 | `await hasPrefix(prefix)` | `await has_prefix(prefix)` |
| 移除前缀 | 是 | 移除消息前缀并返回剩余文本 | `await trimPrefix(prefix)` | `await trim_prefix(prefix)` |

### 回复控制

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 允许回复 | 是 | 允许后续插件回复 | `await allowReply()` | `await allow_reply()` |
| 禁止回复 | 是 | 禁止后续插件回复 | `await forbidReply()` | `await forbid_reply()` |
| 是否允许回复 | 是 | 查询当前是否允许回复 | `await isReplyAllowed()` | `await is_reply_allowed()` |

### 流程状态查询

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 是否已中止 | 是 | 查询是否已调用 abort | `await isAborted()` | `await is_aborted()` |
| 是否已继续 | 是 | 查询是否已调用 continue | `await isContinued()` | `await is_continued()` |

### 正则捕获组

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 设置捕获组 | 是 | 设置正则匹配的捕获组 | `await setCaptureGroups(groups)` | `await set_capture_groups(groups)` |
| 设置命名参数 | 是 | 设置命名参数 | `await setNamedParam(key, value)` | `await set_named_param(key, value)` |

### 事件信息

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 获取事件 | 是 | 获取原始事件对象 | `await getEvent()` | `await get_event()` |

### 消息回复

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 回复消息 | 是 | 发送文本回复，返回消息 ID | `await reply(content)` | `await reply(content)` |
| 批量回复 | 是 | 发送多条消息 | `await replyBatch(messages)` | `await reply_batch(messages)` |
| 撤回消息 | 是 | 撤回指定消息（可设延迟） | `await recallMessage(id?, delay?)` | `await recall_message(id?, delay?)` |

> `reply()` 返回消息 ID 字符串，可用于后续撤回。`content` 支持字符串、消息段对象或消息段数组，详见[消息段](#消息段)。

### 消息段

`reply()` 的 `content` 参数除了纯文本字符串，还支持发送富媒体消息段。消息段是 `{ type, data }` 格式的对象，框架会根据平台自动转换。

#### 支持的消息段类型

> 所有消息段类型均为全平台通用。适配器会自动处理平台差异：平台原生支持的类型直接发送，不支持的类型会自动降级为纯文本，插件开发者无需关心平台差异。

| type | 说明 | data 字段 |
|------|------|-----------|
| `text` | 纯文本 | `text` |
| `image` | 图片 | `file` / `url` |
| `at` | @某人 | `qq` (QQ号/user_id) |
| `reply` | 回复消息 | `id` (消息ID) |
| `face` | QQ表情 | `id` (表情ID) |
| `mface` | 商城表情 | `summary` / `emoji_id` / `emoji_package_id` / `key` |
| `voice` | 语音 | `file` / `url` |
| `record` | 录音 | `file` / `url` |
| `video` | 视频 | `file` / `url` |
| `file` | 文件 | `file` / `name` |
| `share` | 链接分享 | `url` / `title` / `content` / `image` |
| `music` | 音乐卡片 | `type` (qq/163/custom/xd) / `title` / `content` / `url` / `audio` / `image` |
| `json` | JSON卡片 | `data` (JSON字符串) |
| `xml` | XML卡片 | `data` (XML字符串) / `id` |
| `forward` | 合并转发 | `id` |
| `location` | 位置 | `lat` / `lon` / `title` / `content` |
| `contact` | 推荐好友/群 | `type` (qq/group) / `id` |
| `buttons` | 按钮卡片 | `title` / `buttons` (数组，每项含 `label`/`data`/`action`) |
| `dice` | 掷骰子 | — |
| `rps` | 猜拳 | — |
| `poke` | 戳一戳 | `id` (可选) |
| `markdown` | Markdown消息 | `content` |
| `emotion` | 情绪标记 | `emoji` / `emotion` |

#### 发送方式

`reply()` 支持三种输入格式：

```javascript
// 1. 纯文本字符串（最常用）
await sender.reply('你好');

// 2. 单个消息段对象
await sender.reply({ type: 'image', data: { file: 'https://example.com/pic.jpg' } });

// 3. 消息段数组（混合多种类型）
await sender.reply([
    { type: 'at', data: { qq: '123456' } },
    { type: 'text', data: { text: ' 看看这张图' } },
    { type: 'image', data: { file: 'https://example.com/pic.jpg' } }
]);
```

#### SDK 快捷构造器

SDK 提供了 `LinkZone.segment` 快捷构造消息段：

```javascript
const { LinkZone } = require('linkzone-sdk');

// 文本
LinkZone.segment.text('你好')

// 图片
LinkZone.segment.image('https://example.com/pic.jpg')

// @某人
LinkZone.segment.at('123456')

// 回复消息
LinkZone.segment.reply('msg_123')

// QQ表情
LinkZone.segment.face('178')

// 语音
LinkZone.segment.voice('https://example.com/voice.silk')

// 视频
LinkZone.segment.video('https://example.com/video.mp4')

// 音乐卡片
LinkZone.segment.music('custom', 'https://jump.url', 'https://audio.url', '稻香', '周杰伦', 'https://cover.jpg')

// JSON卡片
LinkZone.segment.json('{"prompt":"..."}')
```

#### 使用示例

```javascript
// 发送音乐卡片（适配器自动处理平台差异）
await sender.reply({
    type: 'music',
    data: {
        title: '稻香',
        content: '周杰伦',
        url: 'https://music.example.com/123',
        audio: 'https://music.example.com/123.mp3',
        image: 'https://music.example.com/cover.jpg'
    }
});

// 混合发送：@某人 + 文本 + 图片
await sender.reply([
    { type: 'at', data: { qq: '123456' } },
    { type: 'text', data: { text: ' 看看这张图' } },
    { type: 'image', data: { file: 'https://example.com/pic.jpg' } }
]);
```

> **提示**：无需手动判断平台，直接使用消息段即可。适配器会将不支持的类型自动降级为纯文本。

### 等待输入

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 监听输入 | 是 | 等待用户下一条消息 | `await listen(opts?)` | `await listen(opts?)` |
| 等待输入 | 是 | 简化的等待输入 | `await waitInput(opts?)` | `await wait_input(opts?)` |
| 回复并监听 | 是 | 回复后等待用户回复 | `await replyAndListen(content, opts?)` | `await reply_and_listen(content, opts?)` |
| 确认对话 | 是 | 是/否确认 | `await askConfirm(question, yes?, no?, timeout?)` | `await ask_confirm(question, yes?, no?, timeout?)` |

### 流程控制

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 获取参数 | 是 | 获取命令参数（按索引，空格分割） | `await param(index)` | `await param(index)` |
| 获取所有参数 | 是 | 获取所有命令参数 | `await getAllParams()` | `await get_all_params()` |
| 中止处理 | 否 | 中止后续插件执行 | `abort()` | `abort()` |
| 继续处理 | 否 | 继续执行后续插件 | `continue()` | `continue()` |

#### 参数解析规则

`param(index)` 按空格分割命令后的文本，支持引号包裹含空格的参数：

```
/weather 北京 3天        → param(0)="北京", param(1)="3天"
/translate "hello world" en  → param(0)="hello world", param(1)="en"
```

### 群管理操作

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 踢出成员 | 是 | 将成员踢出群组 | `await kick(userId?)` | `await kick(user_id?)` |
| 禁言 | 是 | 禁言指定用户 | `await ban(userId?, duration?)` | `await ban(user_id?, duration?)` |
| 解除禁言 | 是 | 解除用户禁言 | `await unban(userId?)` | `await unban(user_id?)` |
| 执行动作 | 是 | 执行平台特定动作 | `await doAction(action, params?)` | `await do_action(action, params?)` |

### 上下文数据

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 获取数据 | 是 | 获取插件私有数据 | `await getData(key, default?)` | `await get_data(key, default?)` |
| 设置数据 | 是 | 设置插件私有数据 | `await setData(key, value)` | `await set_data(key, value)` |
| 获取配置 | 是 | 获取插件配置 | `await getConfig(key?, default?)` | `await get_config(key?, default?)` |

### 用户身份

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 获取 LinkZone ID | 是 | 获取用户全局 ID | `await getLinkZoneID()` | `await get_linkzone_id()` |
| 获取用户信息 | 是 | 获取用户详细信息 | `await getUserInfo()` | `await get_user_info()` |

## 使用示例

### 基础回复

```javascript
async handleMessage(sender) {
    await sender.reply('收到！');
}
```

### 命令参数处理

```javascript
// 触发器: /echo
async handleMessage(sender) {
    const text = await sender.param(0);  // 获取第一个参数
    const allParams = await sender.getAllParams();  // 获取所有参数
    await sender.reply(text || '请输入内容');
}
```

### 多轮对话

```javascript
async handleMessage(sender) {
    await sender.reply('请问你的名字是？');
    const result = await sender.listen({ timeout: 30000 });
    if (!result.timeout && result.sender) {
        const name = result.sender.getMessage();
        await sender.reply(`你好，${name}！`);
    }
}
```

### 确认对话

```javascript
async handleMessage(sender) {
    const confirmed = await sender.askConfirm(
        '确定要执行此操作吗？',
        ['是', '确定', 'yes'],
        ['否', '取消', 'no'],
        15000
    );
    if (confirmed) {
        await sender.reply('操作已执行');
    } else {
        await sender.reply('操作已取消');
    }
}
```

### 获取用户信息

```javascript
async handleMessage(sender) {
    const lzId = await sender.getLinkZoneID();
    const userInfo = await sender.getUserInfo();
    await sender.reply(`你的全局 ID: ${lzId}\n等级: ${userInfo.level}`);
}
```

### 群管理

```javascript
async handleMessage(sender) {
    if (!sender.isAdmin()) {
        await sender.reply('仅管理员可执行此操作');
        return;
    }
    // 禁言某用户 60 秒
    await sender.ban('user123', 60);
    await sender.reply('已禁言该用户');
}
```

## listen 选项

```javascript
await sender.listen({
    timeout: 30000,               // 超时时间（毫秒）
    rules: [],                    // 匹配规则（正则表达式数组）
    listenPrivate: false,         // 是否监听私聊
    listenGroup: true,            // 是否监听群聊
    cancelKeywords: ['取消'],     // 取消关键词
    allowPlatforms: [],           // 允许的平台列表（空=全部）
    prohibitPlatforms: [],        // 禁止的平台列表
    allowGroups: [],              // 允许的群组列表（空=全部）
    prohibitGroups: [],           // 禁止的群组列表
    allowUsers: [],               // 允许的用户列表（空=全部）
    prohibitUsers: []             // 禁止的用户列表
});
```

返回值：

```javascript
{
    sender: Sender | null,    // 发送者上下文
    timeout: boolean,         // 是否超时
    cancelled: boolean        // 是否取消
}
```
