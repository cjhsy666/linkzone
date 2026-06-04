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

### Node.js

```javascript
// 写入数据
await this.setData('key', { count: 1 });

// 读取数据
const data = await this.getData('key', { count: 0 });

// 删除数据
await this.deleteData('key');
```

### Python

```python
# 写入数据
await self.set_data("key", {"count": 1})

# 读取数据
data = await self.get_data("key", {"count": 0})

# 删除数据
await self.delete_data("key")
```

## 配置管理

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
