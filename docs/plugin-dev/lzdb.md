# LZDB 命名空间数据库

LZDB 是 LinkZone 提供的命名空间键值数据库，用于插件持久化存储数据。

## 概述

LZDB 采用**命名空间隔离**设计：
- 每个插件有独立的命名空间，互不干扰
- 插件只能直接读写自己的命名空间
- 通过 LZDB 全局对象可跨命名空间访问（需指定命名空间名）

## 访问方式

### 插件私有数据库

通过 `this.db`（Node.js）/ `self.db`（Python）访问当前插件的命名空间：

```javascript
// Node.js 类式
await this.db.get('my-plugin', 'key');
await this.db.set('my-plugin', 'key', 'value');
```

```python
# Python 类式
self.db.get("my-plugin", "key")
self.db.set("my-plugin", "key", "value")
```

> **注意**：`self.db` 在 `__init__` 中为 None，必须在 `on_start()` 及之后的钩子中使用。工具库模式插件不能使用 `self.db`，只能用 `LZDB`。

### LZDB 全局数据库

`LZDB` 是全局对象，可在任何插件中使用，包括工具库模式的插件：

```javascript
// Node.js
const db = new LZDB('my-namespace');
await db.set('key', 'value');
const val = await db.get('key');
```

```python
# Python
db = LZDB("my-namespace")
db.set("key", "value")
val = db.get("key")
```

## API 参考

### 插件私有数据库（this.db / self.db）

| 方法 | Node.js | Python | 返回值 | 说明 |
|------|---------|--------|--------|------|
| 获取 | `await this.db.get(bucket, key)` | `self.db.get(bucket, key)` | `any` | 获取指定 key 的值 |
| 设置 | `await this.db.set(bucket, key, value)` | `self.db.set(bucket, key, value)` | - | 设置 key-value |
| 删除 | `await this.db.delete(bucket, key)` | `self.db.delete(bucket, key)` | - | 删除指定 key |
| 列出 | `await this.db.list(bucket)` | `self.db.list(bucket)` | `string[]` | 列出 bucket 下所有 key |
| 检查存在 | `await this.db.exists(bucket, key)` | `self.db.exists(bucket, key)` | `boolean` | 检查 key 是否存在 |
| 批量设置 | `await this.db.batchSet(bucket, items)` | `self.db.batch_set(bucket, items)` | - | 批量写入 |
| 批量删除 | `await this.db.batchDelete(bucket, keys)` | `self.db.batch_delete(bucket, keys)` | - | 批量删除 |
| 列出桶 | `await this.db.listBuckets()` | `self.db.list_buckets()` | `string[]` | 列出所有 bucket |

### LZDB 全局数据库

```javascript
// Node.js
const db = new LZDB('my-namespace');
await db.get(key, defaultValue?)       // 获取
await db.set(key, value)               // 设置
await db.delete(key)                   // 删除
await db.exists(key)                   // 检查存在
await db.keys()                        // 列出所有 key
await db.clear()                       // 清空命名空间
```

```python
# Python
db = LZDB("my-namespace")
db.get(key, default=None)              # 获取
db.set(key, value)                     # 设置
db.delete(key)                         # 删除
db.exists(key)                         # 检查存在
db.keys()                              # 列出所有 key
db.clear()                             # 清空命名空间
```

静态方法：

| 方法 | 说明 |
|------|------|
| `LZDB.setDefaultClient(client)` | 设置默认客户端（runtime 自动调用） |
| `LZDB.listNamespaces(client?)` | 列出所有命名空间 |

## 数据类型

LZDB 支持以下数据类型，会自动序列化/反序列化：

| 类型 | 说明 |
|------|------|
| `string` | 字符串 |
| `number` | 数字 |
| `boolean` | 布尔值 |
| `object` | 对象（自动 JSON 序列化） |
| `array` | 数组（自动 JSON 序列化） |
| `null` | 空值 |

```javascript
// 存储复杂对象
await db.set('user_profile', {
    name: '张三',
    level: 5,
    tags: ['活跃', 'VIP']
});

// 读取时自动反序列化
const profile = await db.get('user_profile');
// { name: '张三', level: 5, tags: ['活跃', 'VIP'] }
```

## 使用场景

### 1. 插件状态持久化

```javascript
class CounterPlugin extends Plugin {
    async handleMessage(sender) {
        const userId = sender.getSenderId();
        let count = await this.db.get('counter', userId) || 0;
        count++;
        await this.db.set('counter', userId, count);
        await sender.reply(`第 ${count} 次调用`);
    }
}
```

### 2. 缓存外部数据

```javascript
async handleMessage(sender) {
    const city = await sender.param(0);
    const cacheKey = `weather_${city}`;
    let data = await this.db.get('cache', cacheKey);

    if (!data) {
        data = await fetch(`https://api.weather.com?city=${city}`);
        await this.db.set('cache', cacheKey, data);
    }

    await sender.reply(data);
}
```

### 3. 用户数据管理

```javascript
async handleMessage(sender) {
    const userId = sender.getSenderId();

    // 设置用户数据
    await this.db.set('users', `${userId}_score`, 100);

    // 列出用户所有数据
    const keys = await this.db.list('users');
    const userKeys = keys.filter(k => k.startsWith(`${userId}_`));
}
```

### 4. 跨插件数据共享

```javascript
// 插件 A：写入数据
const db = new LZDB('shared_config');
await db.set('api_endpoint', 'https://api.example.com');

// 插件 B：读取数据
const db = new LZDB('shared_config');
const endpoint = await db.get('api_endpoint');
```

### 5. 工具库模式插件使用 LZDB

工具库模式的插件不能使用 `this.db`，但可以使用 `LZDB`：

```javascript
// utils.js (工具库模式)
module.exports = {
    async getConfig() {
        const db = new LZDB('utils');
        return await db.get('config');
    },
    async setConfig(config) {
        const db = new LZDB('utils');
        await db.set('config', config);
    }
};
```

## 最佳实践

### Key 命名规范

推荐使用分层命名，用 `_` 或 `:` 分隔：

```
user_12345_score
user_12345_level
cache_weather_beijing
config_api_key
```

### 前缀查询

使用 `list()` 批量获取相关 key：

```javascript
// 获取所有用户数据
const allKeys = await this.db.list('users');
const userKeys = allKeys.filter(k => k.startsWith('user_'));

// 获取所有缓存
const cacheKeys = await this.db.list('cache');
```

### 数据清理

定期清理过期数据，避免数据库膨胀：

```javascript
async onCron() {
    const keys = await this.db.list('cache');
    const now = Date.now();

    for (const key of keys) {
        const data = await this.db.get('cache', key);
        if (data && data.expireAt < now) {
            await this.db.delete('cache', key);
        }
    }
}
```
