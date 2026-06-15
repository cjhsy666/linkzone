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
await this.db.set('key', 'value');
const val = await this.db.get('key');
```

```python
# Python 类式
self.db.set("key", "value")
val = self.db.get("key")
```

```javascript
// Node.js 函数式
await Plugin.db.set('key', 'value');
const val = await Plugin.db.get('key');
```

### LZDB 全局数据库

`LZDB` 是全局对象，可在任何插件中使用，包括 loaded 模式的插件：

```javascript
// Node.js
await LZDB.set('namespace', 'key', 'value');
const val = await LZDB.get('namespace', 'key');
```

```python
# Python
LZDB.set("namespace", "key", "value")
val = LZDB.get("namespace", "key")
```

> 当只传一个参数时，命名空间默认为当前插件自身。

## API 参考

### 插件私有数据库（this.db / self.db）

| 方法 | Node.js | Python | 返回值 | 说明 |
|------|---------|--------|--------|------|
| 获取 | `await this.db.get(key)` | `self.db.get(key)` | `any` | 获取指定 key 的值 |
| 设置 | `await this.db.set(key, value)` | `self.db.set(key, value)` | - | 设置 key-value |
| 删除 | `await this.db.delete(key)` | `self.db.delete(key)` | - | 删除指定 key |
| 列出 | `await this.db.list(prefix?)` | `self.db.list(prefix="")` | `string[]` | 列出指定前缀的 key |
| 检查存在 | `await this.db.has(key)` | `self.db.has(key)` | `boolean` | 检查 key 是否存在 |

### LZDB 全局数据库

| 方法 | Node.js | Python | 返回值 | 说明 |
|------|---------|--------|--------|------|
| 获取 | `await LZDB.get(ns, key?)` | `LZDB.get(ns, key=None)` | `any` | 获取数据 |
| 设置 | `await LZDB.set(ns, key?, value?)` | `LZDB.set(ns, key=None, value=None)` | - | 设置数据 |
| 删除 | `await LZDB.delete(ns, key?)` | `LZDB.delete(ns, key=None)` | - | 删除数据 |
| 列出 | `await LZDB.list(ns, prefix?)` | `LZDB.list(ns, prefix="")` | `string[]` | 列出 key |
| 检查 | `await LZDB.has(ns, key?)` | `LZDB.has(ns, key=None)` | `boolean` | 检查存在 |

> 参数说明：`ns` 为命名空间，`key` 为键名。当只传 `ns` 时，操作当前插件命名空间下的数据。

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
await this.db.set('user_profile', {
    name: '张三',
    level: 5,
    tags: ['活跃', 'VIP']
});

// 读取时自动反序列化
const profile = await this.db.get('user_profile');
// { name: '张三', level: 5, tags: ['活跃', 'VIP'] }
```

## 使用场景

### 1. 插件状态持久化

```javascript
class CounterPlugin extends Plugin {
    async handleMessage(sender) {
        let count = await this.db.get('count') || 0;
        count++;
        await this.db.set('count', count);
        await sender.reply(`第 ${count} 次调用`);
    }
}
```

### 2. 缓存外部数据

```javascript
async handleMessage(sender) {
    const city = await sender.param(0);
    const cacheKey = `weather_${city}`;
    let data = await this.db.get(cacheKey);

    if (!data) {
        data = await LinkZone.httpGet(`https://api.weather.com?city=${city}`);
        await this.db.set(cacheKey, data);
    }

    await sender.reply(data);
}
```

### 3. 用户数据管理

```javascript
async handleMessage(sender) {
    const userId = sender.getSenderId();
    const prefix = `user_${userId}_`;

    // 列出用户所有数据
    const keys = await this.db.list(prefix);

    // 设置用户数据
    await this.db.set(`${prefix}score`, 100);
}
```

### 4. 跨插件数据共享

```javascript
// 插件 A：写入数据
await LZDB.set('shared_config', 'api_endpoint', 'https://api.example.com');

// 插件 B：读取数据
const endpoint = await LZDB.get('shared_config', 'api_endpoint');
```

### 5. loaded 模式插件使用 LZDB

loaded 模式的插件不能使用 `this.db`，但可以使用 `LZDB`：

```javascript
// utils.js (loaded 模式)
module.exports = {
    async getConfig() {
        return await LZDB.get('utils', 'config');
    },
    async setConfig(config) {
        await LZDB.set('utils', 'config', config);
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

使用 `list(prefix)` 批量获取相关 key：

```javascript
// 获取所有用户数据
const userKeys = await this.db.list('user_');

// 获取所有缓存
const cacheKeys = await this.db.list('cache_');
```

### 数据清理

定期清理过期数据，避免数据库膨胀：

```javascript
async handleCron() {
    const cacheKeys = await this.db.list('cache_');
    const now = Date.now();

    for (const key of cacheKeys) {
        const data = await this.db.get(key);
        if (data && data.expireAt < now) {
            await this.db.delete(key);
        }
    }
}
```
