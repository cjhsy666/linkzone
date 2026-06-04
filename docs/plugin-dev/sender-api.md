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

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 是否管理员 | 判断发送者是否管理员 | `isAdmin()` | `is_admin()` |
| 是否群聊 | 判断是否群聊消息 | `isGroup()` | `is_group()` |
| 是否私聊 | 判断是否私聊消息 | `isPrivate()` | `is_private()` |

### 消息回复

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 回复消息 | 发送文本回复 | `reply(content)` | `reply(content)` |
| 批量回复 | 发送多条消息 | `replyBatch(messages)` | `reply_batch(messages)` |
| 撤回消息 | 撤回指定消息 | `recallMessage(id?, delay?)` | `recall_message(id?, delay?)` |

### 等待输入

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 监听输入 | 等待用户下一条消息 | `listen(opts?)` | `listen(opts?)` |
| 等待输入 | 简化的等待输入 | `waitInput(opts?)` | `wait_input(opts?)` |
| 回复并监听 | 回复后等待用户回复 | `replyAndListen(content, opts?)` | `reply_and_listen(content, opts?)` |
| 确认对话 | 是/否确认 | `askConfirm(question, yes?, no?, timeout?)` | `ask_confirm(question, yes?, no?, timeout?)` |

### 流程控制

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 获取参数 | 获取命令参数（按索引） | `param(index)` | `param(index)` |
| 获取所有参数 | 获取所有命令参数 | `getAllParams()` | `get_all_params()` |
| 中止处理 | 中止后续插件执行 | `abort()` | `abort()` |
| 继续处理 | 继续执行后续插件 | `continue()` | `continue()` |

### 群管理操作

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 踢出成员 | 将成员踢出群组 | `kick(userId?)` | `kick(user_id?)` |
| 禁言 | 禁言指定用户 | `ban(userId?, duration?)` | `ban(user_id?, duration?)` |
| 解除禁言 | 解除用户禁言 | `unban(userId?)` | `unban(user_id?)` |
| 执行动作 | 执行平台特定动作 | `doAction(action, params?)` | `do_action(action, params?)` |

### 上下文数据

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 获取数据 | 获取插件私有数据 | `getData(key, default?)` | `get_data(key, default?)` |
| 设置数据 | 设置插件私有数据 | `setData(key, value)` | `set_data(key, value)` |
| 获取配置 | 获取插件配置 | `getConfig(key?, default?)` | `get_config(key?, default?)` |

### 用户身份

| 方法 | 说明 | Node.js | Python |
|------|------|---------|--------|
| 获取 LinkZone ID | 获取用户全局 ID | `getLinkZoneID()` | `get_linkzone_id()` |
| 获取用户信息 | 获取用户详细信息 | `getUserInfo()` | `get_user_info()` |

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
    timeout: 30000,           // 超时时间（毫秒）
    rules: [],                // 匹配规则
    listenPrivate: false,     // 是否监听私聊
    listenGroup: true,        // 是否监听群聊
    cancelKeywords: ['取消']  // 取消关键词
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
