# AI 工具插件

LinkZone 支持将插件注册为 AI 工具，让 AI 模型可以主动调用插件功能。有两种模式：**注入调用**和**直接调用**。

## 注入调用模式

AI 在处理消息时，根据触发规则将命令注入到消息流中，触发对应的插件。

### 配置

```javascript
metadata: {
    name: 'weather',
    triggers: [{ type: 0, pattern: '/weather' }],
    ai_triggerable: true,              // 允许 AI 触发
    ai_trigger_usage: '查询天气信息',    // AI 看到的功能描述
    ai_trigger_format: '/weather {city}', // AI 生成的命令格式
    ai_trigger_args: {                  // 参数说明
        city: '城市名称'
    }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ai_triggerable` | boolean | 是 | 设为 `true` 启用注入调用 |
| `ai_trigger_usage` | string | 是 | AI 看到的功能描述，帮助 AI 判断何时使用 |
| `ai_trigger_format` | string | 是 | 命令格式模板，AI 会按此格式生成命令 |
| `ai_trigger_args` | object | 否 | 参数说明，key 为参数名，value 为描述 |

### 工作流程

```
用户消息 → AI 分析 → 判断需要调用工具 → 生成命令字符串
→ 注入到消息流 → 匹配触发器 → 调用插件 handleMessage
```

AI 会根据 `ai_trigger_usage` 判断是否需要调用此工具，然后按照 `ai_trigger_format` 格式生成命令字符串，框架将其作为普通消息处理，匹配到对应触发器后调用插件的 `handleMessage`。

### 示例

```javascript
class TranslatePlugin extends Plugin {
    async handleMessage(sender) {
        const text = await sender.param(0);
        const targetLang = await sender.param(1) || 'en';
        // 翻译逻辑...
        await sender.reply(`翻译结果: ${result}`);
    }
}

TranslatePlugin.metadata = {
    name: 'translate',
    triggers: [{ type: 0, pattern: '/translate' }],
    ai_triggerable: true,
    ai_trigger_usage: '翻译文本到指定语言',
    ai_trigger_format: '/translate {text} {lang}',
    ai_trigger_args: {
        text: '要翻译的文本',
        lang: '目标语言（如 en、ja、ko）'
    }
};

module.exports = TranslatePlugin;
```

## 直接调用模式

AI 直接调用插件的 `executeTool` 方法，获取结构化返回值。这种方式不经过消息流，效率更高。

### 配置

```javascript
metadata: {
    name: 'calculator',
    tool: {
        enabled: true,
        usage: '数学计算器，支持加减乘除',
        when_to_use: '当用户需要进行数学计算时',
        parameters: [
            { name: 'expression', type: 'string', description: '数学表达式', required: true }
        ]
    }
}
```

### tool 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enabled` | boolean | 是 | 是否启用 |
| `usage` | string | 是 | 工具功能描述 |
| `when_to_use` | string | 是 | AI 判断何时使用的场景描述 |
| `parameters` | Parameter[] | 是 | 参数定义列表 |

### Parameter 定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 参数名 |
| `type` | string | 是 | 参数类型：`string` / `number` / `boolean` / `object` / `array` |
| `description` | string | 是 | 参数描述 |
| `required` | boolean | 否 | 是否必填（默认 false） |
| `default` | any | 否 | 默认值 |
| `enum` | any[] | 否 | 可选值列表 |

### 工作流程

```
用户消息 → AI 分析 → 判断需要调用工具 → 直接调用 executeTool
→ 获取返回值 → AI 结合返回值生成回复
```

### 实现 executeTool

```javascript
class CalculatorPlugin extends Plugin {
    async executeTool(sender, args) {
        const { expression } = args;
        try {
            // 安全计算表达式
            const result = this.safeEval(expression);
            return {
                success: true,
                content: `${expression} = ${result}`
            };
        } catch (err) {
            return {
                success: false,
                content: `计算错误: ${err.message}`
            };
        }
    }

    safeEval(expr) {
        // 安全的数学表达式计算
        // ...
    }
}

CalculatorPlugin.metadata = {
    name: 'calculator',
    tool: {
        enabled: true,
        usage: '数学计算器',
        when_to_use: '用户需要进行数学计算时',
        parameters: [
            { name: 'expression', type: 'string', description: '数学表达式', required: true }
        ]
    }
};

module.exports = CalculatorPlugin;
```

### executeTool 返回值

`executeTool` 必须返回一个对象：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `success` | boolean | 是 | 是否成功 |
| `content` | string | 是 | 返回内容（AI 会基于此生成回复） |

## 两种模式对比

| 特性 | 注入调用 | 直接调用 |
|------|---------|---------|
| 配置字段 | `ai_triggerable` | `tool` |
| 处理钩子 | `handleMessage` | `executeTool` |
| 调用方式 | AI 生成命令 → 消息流 | AI 直接调用 → 返回值 |
| 返回值 | 通过 `sender.reply()` | 通过 `return` |
| 适用场景 | 需要发送消息给用户 | 需要返回数据给 AI |
| 效率 | 较低（经过消息流） | 较高（直接调用） |

## 混合模式

一个插件可以同时支持两种模式：

```javascript
class WeatherPlugin extends Plugin {
    // 注入调用：用户直接使用 /weather 命令
    async handleMessage(sender) {
        const city = await sender.param(0);
        const data = await this.fetchWeather(city);
        await sender.reply(this.formatWeather(data));
    }

    // 直接调用：AI 调用获取结构化数据
    async executeTool(sender, args) {
        const { city, days } = args;
        const data = await this.fetchWeather(city, days);
        return {
            success: true,
            content: JSON.stringify(data)
        };
    }
}

WeatherPlugin.metadata = {
    name: 'weather',
    triggers: [{ type: 0, pattern: '/weather' }],
    // 注入调用配置
    ai_triggerable: true,
    ai_trigger_usage: '查询天气信息',
    ai_trigger_format: '/weather {city}',
    ai_trigger_args: { city: '城市名称' },
    // 直接调用配置
    tool: {
        enabled: true,
        usage: '查询指定城市的天气信息',
        when_to_use: '当用户询问天气、气温、是否下雨等问题时',
        parameters: [
            { name: 'city', type: 'string', description: '城市名称', required: true },
            { name: 'days', type: 'number', description: '预报天数', required: false, default: 1 }
        ]
    }
};

module.exports = WeatherPlugin;
```

## 注释语法

在插件文件头部使用注释声明 AI 工具配置：

```javascript
// @ai-triggerable true
// @ai-trigger-usage 查询天气信息
// @ai-trigger-format /weather {city}
// @ai-trigger-args {"city":"城市名称"}
```

```javascript
// @tool
// {
//   "enabled": true,
//   "usage": "查询天气",
//   "when_to_use": "用户询问天气时",
//   "parameters": [
//     { "name": "city", "type": "string", "description": "城市", "required": true }
//   ]
// }
```

## 最佳实践

1. **优先使用直接调用**：如果只需要返回数据给 AI，使用 `tool` + `executeTool` 效率更高
2. **描述要清晰**：`usage` 和 `when_to_use` 描述越清晰，AI 判断越准确
3. **参数要完整**：`parameters` 定义完整，AI 才能正确传参
4. **错误要友好**：`executeTool` 返回 `success: false` 时，`content` 应包含可理解的错误信息
5. **幂等性**：AI 可能重复调用同一工具，`executeTool` 应尽量保证幂等
