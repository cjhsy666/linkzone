# LZDB 数据库

LZDB 是 LinkZone 为插件提供的命名空间数据库，基于 BadgerDB 实现，提供高性能的键值存储。

## 概述

LZDB 为每个插件提供独立的命名空间，自动为键添加前缀，避免不同插件之间的键冲突。

## 初始化

### Node.js

```javascript
const { LZDB } = require('linkzone-sdk');
const db = new LZDB('my-plugin');
```

### Python

```python
from linkzone import LZDB

db = LZDB("my-plugin")
```

## 基本操作

### 写入数据

```javascript
// Node.js
await db.set('key', { name: 'test', count: 1 });
await db.set('config', { timeout: 30, retry: true });
```

```python
# Python
await db.set("key", {"name": "test", "count": 1})
await db.set("config", {"timeout": 30, "retry": True})
```

### 读取数据

```javascript
// Node.js
const data = await db.get('key', { name: '', count: 0 });  // 第二个参数为默认值
```

```python
# Python
data = await db.get("key", {"name": "", "count": 0})
```

### 删除数据

```javascript
// Node.js
await db.delete('key');
```

```python
# Python
await db.delete("key")
```

### 检查键是否存在

```javascript
// Node.js
const exists = await db.exists('key');
```

```python
# Python
exists = await db.exists("key")
```

## 列表操作

### 获取所有键

```javascript
// Node.js
const keys = await db.keys();
// 返回: ['key1', 'key2', ...]
```

```python
# Python
keys = await db.keys()
```

### 清空命名空间

```javascript
// Node.js
await db.clear();
```

```python
# Python
await db.clear()
```

### 列出所有命名空间

```javascript
// Node.js（静态方法）
const namespaces = await LZDB.listNamespaces();
// 返回: ['my-plugin', 'other-plugin', ...]
```

```python
# Python
namespaces = await LZDB.list_namespaces()
```

## 嵌套键

LZDB 支持使用 `:` 分隔的嵌套键：

```javascript
await db.set('user:123', { name: 'Alice' });
await db.set('user:456', { name: 'Bob' });

// 获取所有用户键
const allKeys = await db.keys();
// ['user:123', 'user:456']
```

## 数据类型

LZDB 支持以下数据类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| string | 字符串 | `'hello'` |
| number | 数字 | `42` |
| boolean | 布尔值 | `true` |
| object | 对象 | `{ key: 'value' }` |
| array | 数组 | `[1, 2, 3]` |
| null | 空值 | `null` |

所有数据在存储时自动序列化为 JSON，读取时自动反序列化。

## 性能说明

LZDB 基于 BadgerDB，具有以下性能特点：

- **纯 Go 实现**：无 CGO 依赖
- **LSM Tree**：写入优化
- **批量写入**：支持配置批量大小和间隔
- **内存映射**：高效读取

## 最佳实践

1. **合理使用命名空间**：每个插件使用独立的 LZDB 实例
2. **设置默认值**：读取时始终提供默认值，避免 null 引用
3. **避免大对象**：单个值不宜过大，建议拆分存储
4. **定期清理**：使用 `clear()` 或 `delete()` 清理过期数据
5. **键命名规范**：使用 `:` 分隔层级，如 `user:123:profile`
