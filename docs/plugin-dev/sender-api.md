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
| `permission_level` | number | 用户权限等级（默认 1，>=6 为管理员） |
| `linkzone_id` | string | 用户全局 ID |
| `is_group` | boolean | 是否群聊 |
| `is_private` | boolean | 是否私聊 |

## 方法列表

### 基础信息

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取消息文本 | `getMessage()` | `get_message()` | 获取原始消息文本 |
| 获取事件类型 | `getType()` | `get_type()` | 获取事件类型（message/notice/request 等） |
| 获取子事件类型 | `getSubEvent()` | `get_sub_event()` | 获取子事件类型（group_increase/friend 等） |
| 获取发送者 ID | `getSenderId()` | `get_sender_id()` | 获取发送者唯一标识 |
| 获取发送者名称 | `getSenderName()` | `get_sender_name()` | 获取发送者昵称 |
| 获取平台 | `getPlatform()` | `get_platform()` | 获取来源平台 |
| 获取群组 ID | `getGroupId()` | `get_group_id()` | 获取群组标识（同步） |
| 获取群组名称 | `getGroupName()` | `get_group_name()` | 获取群组名称 |
| 获取消息 ID | `getMessageId()` | `get_message_id()` | 获取消息唯一标识 |
| 获取机器人 ID | `getBotId()` | `get_bot_id()` | 获取当前机器人标识 |
| 获取接收者 ID | `getReceiverId()` | `get_receiver_id()` | 获取接收者标识 |
| 获取 LinkZone ID | `getLinkZoneID()` | `get_linkzone_id()` | 获取用户全局 ID（同步） |
| 获取用户信息 | `await getUserInfo()` | `get_user_info()` | 获取用户详细信息（异步 RPC 调用） |
| 获取完整事件 | `await getEvent()` | `get_event()` | 获取完整事件对象 |

### getUserInfo 返回值

| 字段 | 说明 |
|------|------|
| `sender_id` | 发送者 ID |
| `sender_name` | 发送者名称 |
| `platform` | 来源平台 |
| `linkzone_id` | 用户全局 ID |
| `is_admin` | 是否管理员 |
| `user_level` | 用户等级字符串 |
| `user_status` | 用户状态字符串 |
| `username?` | 用户名（有 LinkZone 账号时） |
| `avatar_url?` | 头像 URL |
| `level?` | 等级数值 |
| `balance?` | 余额 |
| `points?` | 积分 |
| `is_active?` | 是否活跃 |
| `created_at?` | 创建时间 |
| `platforms?` | 关联平台列表 |

> 此方法为异步 RPC 调用，从服务端获取最新用户信息。如只需本地属性，直接访问 `sender.sender_id`、`sender.sender_name` 等。

### 身份判断

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 是否管理员 | `isAdmin()` | `is_admin()` | 判断发送者是否管理员（permission_level >= 6） |
| 是否群聊 | `isGroup()` | `is_group()` | 判断是否群聊消息 |
| 是否私聊 | `isPrivate()` | `is_private()` | 判断是否私聊消息 |

### 等级与状态

| 方法 | Node.js | Python | 返回值 |
|------|---------|--------|--------|
| 获取用户等级 | `await getUserLevel()` | `get_user_level()` | `{ level: "Lv5", levelInt: 5 }` |
| 获取用户状态 | `await getUserStatus()` | `get_user_status()` | `{ status: "active", statusInt: 1 }` |
| 获取群组等级 | `await getGroupLevel()` | `get_group_level()` | `{ level: "Lv3", levelInt: 3 }` |

### 消息前缀

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 检查前缀 | `await hasPrefix(prefix)` | `has_prefix(prefix)` | 检查消息是否以指定前缀开头 |
| 移除前缀 | `await trimPrefix(prefix)` | `trim_prefix(prefix)` | 移除消息前缀并返回剩余文本 |

> Node.js 中这两个方法是 RPC 调用，会经过主进程处理。如只需简单字符串比对，直接用 `sender.message.startsWith(prefix)` 性能更好。

### 回复控制

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 允许回复 | `await allowReply()` | `allow_reply()` | 允许后续插件回复 |
| 禁止回复 | `await forbidReply()` | `forbid_reply()` | 禁止后续插件回复 |
| 是否允许回复 | `await isReplyAllowed()` | `is_reply_allowed()` | 查询当前是否允许回复 |

### 流程控制

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 中止处理 | `await abort()` | `abort()` | 中止后续插件执行 |
| 继续处理 | `await continue()` | `continue_()` | 继续执行后续插件（Python 中 `continue` 是关键字，方法名加下划线） |
| 是否已中止 | `await isAborted()` | `is_aborted()` | 查询是否已调用 abort |
| 是否已继续 | `await isContinued()` | `is_continued()` | 查询是否已调用 continue |

> **注意**：Sender 在消息处理完毕后会被框架自动销毁。销毁后调用 `reply()`、`listen()` 等方法会抛错。如果插件中使用了 `await sleep()` 或其他异步等待，之后的 Sender 调用应包裹在 try/catch 中，或通过 `listen()` 获取新的 Sender。

### 正则捕获组

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 设置捕获组 | `await setCaptureGroups(groups)` | `set_capture_groups(groups)` | 设置正则匹配的捕获组 |
| 设置命名参数 | `await setNamedParam(key, value)` | `set_named_param(key, value)` | 设置命名参数 |

### 事件信息

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取事件 | `await getEvent()` | `get_event()` | 获取原始事件对象 |

### 消息回复

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 回复消息 | `await reply(content)` | `reply(content)` | 发送文本回复，返回消息 ID |
| 批量回复 | `await replyBatch(messages)` | `reply_batch(messages)` | 发送多条消息 |
| 撤回消息 | `await recallMessage(id?, delay?)` | `recall_message(id?, delay?)` | 撤回消息（不传 id 则撤回当前消息，可设延迟） |

> `reply()` 返回消息 ID 字符串，可用于后续撤回。`content` 支持字符串、消息段对象或消息段数组。Node.js 中发送失败时会抛错，需用 try/catch 捕获。

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
LinkZone.segment.text('你好')
LinkZone.segment.image('https://example.com/pic.jpg')
LinkZone.segment.at('123456')
LinkZone.segment.reply('msg_123')
LinkZone.segment.face('178')
LinkZone.segment.voice('https://example.com/voice.silk')
LinkZone.segment.video('https://example.com/video.mp4')
LinkZone.segment.music('custom', 'https://jump.url', 'https://audio.url', '稻香', '周杰伦', 'https://cover.jpg')
LinkZone.segment.json('{"prompt":"..."}')
```

### 等待输入

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 监听输入 | `await listen(opts?)` | `listen(**kwargs)` | 等待用户下一条消息 |
| 等待输入 | `await waitInput(opts?)` | `wait_input(**kwargs)` | 简化的等待输入 |
| 回复并监听 | `await replyAndListen(content, opts?)` | `reply_and_listen(content, **kwargs)` | 回复后等待用户回复 |
| 确认对话 | `await askConfirm(question, yes?, no?, timeout?)` | `ask_confirm(question, yes_kw?, no_kw?, timeout?)` | 是/否确认 |

#### listen 选项

```javascript
await sender.listen({
    timeout: 60000,               // 超时时间（毫秒）
    rules: [],                    // 匹配规则（正则表达式数组）
    listenPrivate: true,          // 是否监听私聊
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

| 字段 | 类型 | 说明 |
|------|------|------|
| `sender` | Sender \| null | 新的 Sender 对象（超时/取消时为 null） |
| `timeout` | boolean | 是否超时 |
| `cancelled` | boolean | 是否被取消关键词取消 |
| `error` | string | 底层异常信息（可选） |

### 参数获取

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取参数 | `await param(index)` | `param(index)` | 获取命令参数（按索引，空格分割） |
| 获取所有参数 | `await getAllParams()` | `get_all_params()` | 获取所有命令参数（返回对象） |

参数解析规则：

```
/weather 北京 3天        → param(0)="北京", param(1)="3天"
/translate "hello world" en  → param(0)="hello world", param(1)="en"
```

### 群管理操作

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 踢出成员 | `await kick(userId?)` | `kick(user_id?)` | 将成员踢出群组 |
| 禁言 | `await ban(userId?, duration?)` | `ban(user_id?, duration?)` | 禁言指定用户（duration 单位秒） |
| 解除禁言 | `await unban(userId?)` | `unban(user_id?)` | 解除用户禁言 |
| 执行动作 | `await doAction(action, params?)` | `do_action(action, params?)` | 执行平台特定动作 |

### 活动感知心跳（长任务续约）

长时间运行的任务（AI 推理、批量处理等）可调用 `reportActivity` 延长 Context 超时：

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 延长超时 | `await reportActivity(minutes?)` | `report_activity(minutes=5)` | minutes 范围 1-10，默认 5 |

> 完整 Sender API 详见插件开发文档。

### 上下文数据

| 方法 | Node.js | Python | 说明 |
|------|---------|--------|------|
| 获取数据 | `await getData(key, default?)` | `get_data(key, default=None)` | 获取插件私有数据，key 不存在时返回 default |
| 设置数据 | `await setData(key, value)` | `set_data(key, value)` | 设置插件私有数据 |
| 获取配置 | `await getConfig(key?, default?)` | `get_config(key=None, default=None)` | 获取插件配置。不传 key 返回完整配置对象，不存在时返回 `{}` |

## 使用示例

### 基础回复

```javascript
async handleEvent(sender) {
    await sender.reply('收到！');
}
```

### 命令参数处理

```javascript
// 触发器: /echo
async handleEvent(sender) {
    const text = await sender.param(0);
    const allParams = await sender.getAllParams();
    await sender.reply(text || '请输入内容');
}
```

### 多轮对话

```javascript
async handleEvent(sender) {
    await sender.reply('请问你的名字是？');
    const result = await sender.listen({ timeout: 30000 });
    if (!result.timeout && result.sender) {
        const name = result.sender.getMessage();
        await sender.reply(`你好，${name}！`);
    }
}
```

### 获取用户信息

```javascript
async handleEvent(sender) {
    const lzId = sender.getLinkZoneID();
    const userInfo = await sender.getUserInfo();
    const { level } = await sender.getUserLevel();
    await sender.reply(`你的全局 ID: ${lzId}\n等级: ${level}`);
}
```

### 群管理

```javascript
async handleEvent(sender) {
    if (!sender.isAdmin()) {
        await sender.reply('仅管理员可执行此操作');
        return;
    }
    await sender.ban('user123', 60);
    await sender.reply('已禁言该用户');
}
```
