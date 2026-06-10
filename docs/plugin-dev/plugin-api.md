# Plugin API

Plugin 类提供插件自身的管理能力，包括数据存储、配置管理、定时任务、中间件等。

## 类式插件

### Node.js

```javascript
const { Plugin } = require('linkzone-sdk');

class MyPlugin extends Plugin {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            description: '我的插件'
        });
    }

    async onStart() {
        // 插件启动时初始化
    }

    async handleMessage(sender) {
        // 处理消息
    }
}

module.exports = MyPlugin;
```

### Python

```python
from linkzone import Plugin, create_plugin

class MyPlugin(Plugin):
    def __init__(self):
        super().__init__({
            "name": "my-plugin",
            "version": "1.0.0",
            "description": "我的插件"
        })

    async def on_start(self):
        pass

    async def handle_message(self, sender):
        pass

create_plugin(MyPlugin)
```

## 数据存储

每个插件有独立的命名空间存储数据：

### 方法列表

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 读取数据 | 是 | 读取插件私有数据 | `await this.getData(key, default?)` | `await self.get_data(key, default?)` |
| 写入数据 | 是 | 写入插件私有数据 | `await this.setData(key, value)` | `await self.set_data(key, value)` |
| 删除数据 | 是 | 删除插件私有数据 | `await this.deleteData(key)` | `await self.delete_data(key)` |
| 列出数据 | 是 | 列出所有数据键 | `await this.listData()` | `await self.list_data()` |

### Node.js

```javascript
// 写入数据
await this.setData('key', { count: 1 });

// 读取数据
const data = await this.getData('key', { count: 0 });

// 删除数据
await this.deleteData('key');

// 列出所有键
const keys = await this.listData();
```

### Python

```python
# 写入数据
await self.set_data("key", {"count": 1})

# 读取数据
data = await self.get_data("key", {"count": 0})

# 删除数据
await self.delete_data("key")

# 列出所有键
keys = await self.list_data()
```

## 配置管理

### 方法列表

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 获取配置 | 是 | 获取插件配置 | `await this.getConfig()` | `await self.get_config()` |
| 设置配置 | 是 | 设置插件配置 | `await this.setConfig(config)` | `await self.set_config(config)` |

### Node.js

```javascript
// 获取插件配置
const config = await this.getConfig();

// 设置插件配置
await this.setConfig({ api_key: 'xxx', timeout: 30 });
```

### Python

```python
# 获取插件配置
config = await self.get_config()

# 设置插件配置
await self.set_config({"api_key": "xxx", "timeout": 30})
```

## 定时任务

### 方法列表

| 方法 | 异步 | 说明 | Node.js | Python |
|------|------|------|---------|--------|
| 注册定时任务 | 是 | 注册回调式定时任务 | `await this.registerCron(taskId, cron, handler)` | `await self.register_cron(taskId, cron, handler)` |
| 更新定时任务 | 是 | 更新定时任务表达式 | `await this.updateCron(taskId, cron)` | `await self.update_cron(taskId, cron)` |
| 取消定时任务 | 是 | 取消定时任务 | `await this.unregisterCron(taskId)` | `await self.unregister_cron(taskId)` |
| 列出定时任务 | 是 | 列出所有定时任务 | `await this.listCron()` | `await self.list_cron()` |
| 手动触发 | 是 | 手动触发定时任务 | `await this.triggerCron(taskId)` | `await self.trigger_cron(taskId)` |

### Node.js

```javascript
async onStart() {
    // 注册定时任务
    await this.registerCron('daily_report', '0 9 * * *', () => {
        console.log('每天 9 点执行');
    });

    // 取消定时任务
    await this.unregisterCron('daily_report');
}
```

### Python

```python
async def on_start(self):
    await self.register_cron("daily_report", "0 9 * * *", self.daily_report)

async def daily_report(self):
    print("每天 9 点执行")
```

Cron 表达式格式：`分 时 日 月 周`

```
┌──────── 分钟 (0 - 59)
│ ┌────── 小时 (0 - 23)
│ │ ┌──── 日 (1 - 31)
│ │ │ ┌── 月 (1 - 12)
│ │ │ │ ┌ 星期 (0 - 6, 0=周日)
│ │ │ │ │
* * * * *
```

常用示例：

| 表达式 | 说明 |
|--------|------|
| `*/5 * * * *` | 每 5 分钟 |
| `0 * * * *` | 每小时 |
| `0 9 * * *` | 每天 9 点 |
| `0 9 * * 1` | 每周一 9 点 |

## 中间件

插件支持中间件模式，在消息处理前后插入逻辑：

### Node.js

```javascript
class MyPlugin extends Plugin {
    constructor() {
        super({ name: 'my-plugin', version: '1.0.0' });
        this.use(async (sender, next) => {
            console.log('处理前:', sender.getMessage());
            await next();
            console.log('处理后');
        });
    }
}
```

中间件按注册顺序执行，`next()` 调用下一个中间件或最终的 `handleMessage`。

## 性能指标上报

插件可通过 `reportMetrics` 手动上报性能指标：

```javascript
async handleMessage(sender) {
    const start = Date.now();
    // ... 业务逻辑
    await this.reportMetrics(Date.now() - start, null);  // 成功
    // await this.reportMetrics(Date.now() - start, 'error msg');  // 失败
}
```

默认情况下（`autoMetrics: true`），框架自动上报 `handleMessage` 和 `executeTool` 的执行耗时和错误。如需禁用自动上报：

```javascript
class MyPlugin extends Plugin {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            autoMetrics: false  // 禁用自动指标上报
        });
    }
}
```

## 数据库访问

插件可以通过 `LinkZone.db` 访问框架数据库：

### Node.js

```javascript
const { LinkZone } = require('linkzone-sdk');

// 直接操作数据库
await LinkZone.db.set('my_bucket', 'key', value);
const data = await LinkZone.db.get('my_bucket', 'key', defaultValue);
await LinkZone.db.delete('my_bucket', 'key');
const keys = await LinkZone.db.list('my_bucket');
```

### Python

```python
from linkzone import LinkZone

await LinkZone.db.set("my_bucket", "key", value)
data = await LinkZone.db.get("my_bucket", "key", default_value)
await LinkZone.db.delete("my_bucket", "key")
keys = await LinkZone.db.list("my_bucket")
```

## LZDB 命名空间数据库

LZDB 提供带命名空间的数据库访问，自动为键添加前缀：

### Node.js

```javascript
const { LZDB } = require('linkzone-sdk');
const db = new LZDB('my-plugin');

await db.set('user_count', 100);
const count = await db.get('user_count', 0);
await db.delete('user_count');
const exists = await db.exists('user_count');
const keys = await db.keys();
await db.clear();
```

### Python

```python
from linkzone import LZDB

db = LZDB("my-plugin")
await db.set("user_count", 100)
count = await db.get("user_count", 0)
await db.delete("user_count")
exists = await db.exists("user_count")
keys = await db.keys()
await db.clear()
```

详见 [LZDB 数据库](/plugin-dev/lzdb)。

## 扩展系统

插件可以通过元信息字段启用内置扩展，获得缓存、重试、监控等能力，无需手动实现。

### 缓存扩展

启用方式：`enable_cache: true`

提供键值缓存，默认 TTL 5 分钟，最大 100 条。缓存由框架侧管理，插件通过 `getData`/`setData` 配合 TTL 策略使用。

> **注意**：`enable_cache` 是框架侧的配置项，SDK 中没有 `cacheGet`/`cacheSet` 方法。如需缓存功能，请使用 `getData`/`setData` 配合自定义 TTL 逻辑，或使用 `LZDB` 存储中间结果。

```javascript
// 类式插件中使用 getData/setData 实现缓存
class MyPlugin extends Plugin {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            enable_cache: true  // 启用框架侧缓存
        });
    }

    async handleMessage(sender) {
        // 读取缓存
        const cached = await this.getData('cache:key');
        if (cached) {
            await sender.reply(cached);
            return;
        }

        const result = await this.fetchData();
        // 写入缓存
        await this.setData('cache:key', result);
        await sender.reply(result);
    }
}
```

### 重试扩展

启用方式：`enable_retry: true`

自动为操作添加重试逻辑，默认 3 次重试，退避间隔 100ms~2s。重试由框架侧管理。

> **注意**：`enable_retry` 是框架侧的配置项，SDK 中没有 `executeWithRetry` 方法。如需重试逻辑，请手动实现：

```javascript
class MyPlugin extends Plugin {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            enable_retry: true  // 启用框架侧重试
        });
    }

    async handleMessage(sender) {
        // 手动实现重试逻辑
        let lastErr;
        for (let i = 0; i < 3; i++) {
            try {
                await this.callUnstableAPI();
                lastErr = null;
                break;
            } catch (e) {
                lastErr = e;
                await LinkZone.sleep(Math.min(100 * Math.pow(2, i), 2000));
            }
        }
        if (lastErr) {
            await sender.reply('操作失败，请稍后重试');
        }
    }
}
```

### 性能指标扩展

启用方式：`enable_metrics: true`

自动收集插件执行次数、错误率、平均耗时等指标，可在管理后台查看。

### 健康检查扩展

启用方式：`enable_health_check: true`

定期检查组件健康状态，默认间隔 30 秒。可自定义检查逻辑：

```javascript
// 适配器中自定义健康检查
enable_health_check: true,
health_check_interval: '30s'
```

框架默认检查组件运行状态，适配器可覆盖检查逻辑（如检查外部连接是否存活）。

### 事件追踪扩展

事件追踪扩展记录插件处理的每次事件，包括时间戳、类型、耗时、成功状态等。适用于调试和性能分析。

> 事件追踪扩展目前仅供框架内部使用，暂不对外开放启用接口。

### 扩展对照表

| 扩展 | 启用字段 | 默认配置 | 说明 |
|------|---------|---------|------|
| 缓存 | `enable_cache` | TTL 5min, 最大 100 条 | 框架侧缓存，插件用 `getData`/`setData` 读写 |
| 重试 | `enable_retry` | 3 次, 100ms~2s 退避 | 框架侧重试，插件需手动实现重试逻辑 |
| 性能指标 | `enable_metrics` | 自动收集 | 管理后台查看 |
| 健康检查 | `enable_health_check` | 30s 间隔 | 管理后台查看 |

## 配置热更新

插件运行期间可通过 `getConfig()` 主动获取最新配置。当配置变更时，框架会触发热重载（重新加载插件文件），此时插件会经历 `onStop` → 重新加载 → `onStart` 的完整生命周期。

```javascript
class MyPlugin extends Plugin {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            config_schema: {
                api_key: {
                    type: 'string',
                    label: 'API Key',
                    default: ''
                }
            }
        });
    }

    async onStart() {
        // 每次启动时读取最新配置
        const config = await this.getConfig();
        this.apiKey = config.api_key || '';
        this.initClient(this.apiKey);
    }

    async onStop() {
        // 清理资源
        this.cleanup();
    }
}
```

> **注意**：SDK 中没有 `onConfigChanged` 和 `onReload` 钩子。配置变更通过热重载机制处理，插件应在 `onStart` 中读取配置。

## LinkZone 全局模块

`LinkZone` 是全局模块，提供消息段构建、消息推送、事件系统、用户管理等跨插件能力。

### 工具函数

| 方法 | 说明 | Node.js |
|------|------|---------|
| `LinkZone.sleep(ms)` | 异步等待 | `await LinkZone.sleep(1000)` |
| `LinkZone.randomInt(min, max)` | 随机整数 | `LinkZone.randomInt(1, 100)` |
| `LinkZone.uuid()` | 生成唯一 ID | `LinkZone.uuid()` |

### 消息段构建

构建富媒体消息段，用于 `sender.reply()` 发送复合内容：

```javascript
const { LinkZone } = require('linkzone-sdk');

// 文本段
LinkZone.segment.text('Hello');

// 图片段
LinkZone.segment.image('https://example.com/img.png');

// @段
LinkZone.segment.at('123456');

// 回复段
LinkZone.segment.reply('msg_id');

// 表情段
LinkZone.segment.face(178);

// 语音段
LinkZone.segment.voice('https://example.com/audio.silk');

// 视频段
LinkZone.segment.video('https://example.com/video.mp4');

// 音乐段
LinkZone.segment.music('custom', 'https://...', 'https://audio.mp3', '标题', '描述', 'https://cover.png');

// JSON卡片段
LinkZone.segment.json('{"prompt":"卡片内容"}');
```

发送复合消息：

```javascript
await sender.reply([
    LinkZone.segment.at('123456'),
    LinkZone.segment.text(' 请看这张图片：'),
    LinkZone.segment.image('https://example.com/img.png')
]);
```

### 消息推送

主动向用户/群发送消息，无需在消息上下文中：

```javascript
// 发送私聊消息
await LinkZone.push('qq', 'user_123', '你好！');

// 发送群聊消息
await LinkZone.push('qq', 'group_456', '群公告', 'group');

// 指定机器人发送
await LinkZone.push('qq', 'user_123', '你好！', 'private', 'bot_789');

// 发送管理员消息
await LinkZone.pushAdmin('qq', '系统通知');
```

### 事件注入

向框架注入事件，触发插件链处理：

```javascript
await LinkZone.inject({
    type: 'message',
    platform: 'qq',
    senderId: 'user_123',
    senderName: '张三',
    groupId: 'group_456',
    message: '这是一条注入的消息'
});
```

### 事件系统

订阅和发布自定义事件：

```javascript
// 订阅事件
await LinkZone.event.subscribe('custom_event');

// 取消订阅
await LinkZone.event.unsubscribe('custom_event');

// 监听所有事件
LinkZone.event.on((event) => {
    console.log('收到事件:', event);
});

// 发布事件
await LinkZone.event.emit('custom_event', { key: 'value' });
```

### HTTP 路由

注册 HTTP 接口，供外部系统调用：

```javascript
// 注册路由
await LinkZone.http.register('/api/data', async (req) => {
    return {
        status: 200,
        body: { message: 'Hello' }
    };
}, 'GET');

// 便捷方法
await LinkZone.http.get('/api/data', handler);
await LinkZone.http.post('/api/data', handler);
await LinkZone.http.put('/api/data', handler);
await LinkZone.http.delete('/api/data', handler);

// 注销路由
await LinkZone.http.unregister('/api/data', 'GET');
```

### WebSocket

注册 WebSocket 端点：

```javascript
await LinkZone.ws.register('/ws/chat', {
    async onConnect(connId) {
        console.log('连接:', connId);
    },
    async onMessage(connId, data) {
        console.log('消息:', data);
        await LinkZone.ws.send(connId, 'Echo: ' + data);
    },
    async onDisconnect(connId) {
        console.log('断开:', connId);
    }
});

// 注销
await LinkZone.ws.unregister('/ws/chat');
```

### 全局定时任务

不绑定到插件实例的定时任务：

```javascript
// 注册
await LinkZone.cron.register('my-plugin', 'task1', '0 * * * *', () => {
    console.log('每小时执行');
});

// 更新
await LinkZone.cron.update('my-plugin', 'task1', '*/30 * * * *');

// 取消
await LinkZone.cron.unregister('my-plugin', 'task1');

// 列出
const tasks = await LinkZone.cron.list('my-plugin');

// 手动触发
await LinkZone.cron.trigger('my-plugin', 'task1');
```

### 组件存储

跨插件共享的键值存储（与插件私有 `this.getData` 不同，组件存储使用全局键名）：

```javascript
await LinkZone.storage.set('global_key', { value: 1 });
const data = await LinkZone.storage.get('global_key', {});
await LinkZone.storage.delete('global_key');
const keys = await LinkZone.storage.list();
```

### 用户系统

跨插件的用户管理：

```javascript
// 通过平台 ID 获取 LinkZone ID
const { linkzone_id } = await LinkZone.user.getId('qq', 'platform_uid');

// 获取或创建用户
const user = await LinkZone.user.getOrCreate('qq', 'platform_uid', '显示名');
// 返回: { linkzone_id, username, level, is_new }

// 获取用户信息
const info = await LinkZone.user.getInfo(linkzoneId);

// 更新用户资料
await LinkZone.user.updateProfile(linkzoneId, { avatar_url: '...' });

// 设置用户角色等级
await LinkZone.user.setRole(linkzoneId, 5);
```

### 日志

结构化日志输出：

```javascript
LinkZone.logger.debug('模块名', '调试信息');
LinkZone.logger.info('模块名', '普通信息');
LinkZone.logger.warn('模块名', '警告信息');
LinkZone.logger.error('模块名', '错误信息');
LinkZone.logger.fatal('模块名', '致命错误');

// 设置日志级别
await LinkZone.logger.setLevel('debug', '模块名');

// 获取日志级别
const level = await LinkZone.logger.getLevel('模块名');
```

### 全局配置

读取/写入其他组件的配置：

```javascript
const config = await LinkZone.config.get('other-plugin');
await LinkZone.config.set('other-plugin', { key: 'value' });
```

### 全局数据库

直接操作数据库（与 LZDB 不同，需手动管理 bucket）：

```javascript
await LinkZone.db.set('bucket', 'key', value);
const data = await LinkZone.db.get('bucket', 'key', defaultValue);
await LinkZone.db.delete('bucket', 'key');
const exists = await LinkZone.db.exists('bucket', 'key');
const keys = await LinkZone.db.list('bucket');
await LinkZone.db.batchSet('bucket', [{ key: 'k1', value: 'v1' }]);
await LinkZone.db.batchDelete('bucket', ['k1', 'k2']);
const buckets = await LinkZone.db.listBuckets();
```

### 底层调用

直接调用框架 IPC 方法：

```javascript
const result = await LinkZone.call('custom.method', { param: 'value' });
```

### 返利服务

商品链接转返利链接：

```javascript
// 淘宝链接转返利
const result = await LinkZone.rebate.convert('https://item.taobao.com/...');

// 保留原链接转返利
const result = await LinkZone.rebate.convertPreserve('https://item.taobao.com/...');

// 批量转换
const results = await LinkZone.rebate.convertBatch('文本中的多个链接...');

// 发布返利信息
await LinkZone.rebate.publish('返利内容');

// 拼多多链接转返利
const pddResult = await LinkZone.rebate.pddConvert('https://mobile.yangkeduo.com/...');

// 拼多多返利详情
const pddDetail = await LinkZone.rebate.pddConvertDetail('https://mobile.yangkeduo.com/...');

// 商品详情
const detail = await LinkZone.rebate.productDetail('taobao', 'product_id');

// 健康检查
const health = await LinkZone.rebate.health();

// 统计信息
const stats = await LinkZone.rebate.stats();

// 返利配置
const configs = await LinkZone.rebate.config.list();
const config = await LinkZone.rebate.config.get('taobao');
await LinkZone.rebate.config.set('taobao', 'key', 'value');
```

### 跟单服务

订单跟踪与同步：

```javascript
// 启动/停止跟单服务
await LinkZone.tracker.start();
await LinkZone.tracker.stop();

// 查看状态
const status = await LinkZone.tracker.status();

// 拉取各平台订单
await LinkZone.tracker.fetchJD(60, '');           // 京东，60分钟间隔
await LinkZone.tracker.fetchTB(20, '', []);        // 淘宝，20分钟间隔
await LinkZone.tracker.fetchPDD(1440, '');         // 拼多多，1440分钟间隔
await LinkZone.tracker.fetchAll(60);               // 全平台，60分钟间隔

// 手动同步
await LinkZone.tracker.manualSync('jd', '2024-01-01', '2024-01-31');

// 统计信息
const stats = await LinkZone.tracker.stats();
```
