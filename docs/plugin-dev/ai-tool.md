# AI 工具插件

LinkZone 支持将插件注册为 AI 工具，让 AI 模型可以主动调用插件功能。有两种模式：**直接调用**（tool）和**注入调用**（inject）。

## 直接调用模式（tool）

AI 通过 function calling 直接调用插件的 `executeTool` 方法，获取结构化返回值。效率更高，推荐使用。

### 配置

```javascript
// Node.js
metadata: {
    name: 'calculator',
    ai: {
        tool: {
            parameters: [
                { name: 'expression', type: 'string', description: '数学表达式', required: true }
            ],
            usage: '数学计算器，支持加减乘除',
            when_to_use: '当用户需要进行数学计算时'
        }
    }
}
```

```python
# Python
metadata = {
    "name": "calculator",
    "ai": {
        "tool": {
            "parameters": [
                {"name": "expression", "type": "string", "description": "数学表达式", "required": True}
            ],
            "usage": "数学计算器，支持加减乘除",
            "when_to_use": "当用户需要进行数学计算时"
        }
    }
}
```

### tool 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parameters` | Parameter[] | 是 | 参数定义列表 |
| `usage` | string | 是 | 工具功能描述（给 LLM 看） |
| `when_to_use` | string | 是 | AI 判断何时使用的场景描述 |
| `continue` | boolean | 否 | 工具调用后是否继续对话（默认 false） |
| `chainable` | boolean | 否 | 是否可链式调用（默认 false） |
| `max_calls` | number | 否 | 单次对话最大调用次数（0=不限） |
| `confirm` | boolean | 否 | 是否需要用户确认后执行（默认 false） |
| `cooldown` | number | 否 | 冷却时间（秒） |
| `timeout` | number | 否 | 超时时间（秒） |

### Parameter 定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 参数名 |
| `type` | string | 是 | 参数类型：`string` / `number` / `boolean` / `object` / `array` |
| `description` | string | 是 | 参数描述 |
| `required` | boolean | 否 | 是否必填（默认 false） |
| `default` | any | 否 | 默认值 |
| `enum` | any[] | 否 | 可选值列表 |
| `example` | string | 否 | 示例值 |

### 工作流程

```
用户消息 → AI 分析 → 判断需要调用工具 → 直接调用 executeTool
→ 获取返回值 → AI 结合返回值生成回复
```

### 实现 executeTool

```javascript
// Node.js
class CalculatorPlugin extends Plugin {
    async executeTool(sender, args) {
        const { expression } = args;
        try {
            const result = this.safeEval(expression);
            return {
                success: true,
                content: `${expression} = ${result}`
            };
        } catch (err) {
            return {
                success: false,
                error: `计算错误: ${err.message}`
            };
        }
    }

    safeEval(expr) {
        // 安全的数学表达式计算
    }
}

CalculatorPlugin.metadata = {
    name: 'calculator',
    ai: {
        tool: {
            parameters: [
                { name: 'expression', type: 'string', description: '数学表达式', required: true }
            ],
            usage: '数学计算器',
            when_to_use: '用户需要进行数学计算时'
        }
    }
};

module.exports = CalculatorPlugin;
```

```python
# Python
class CalculatorPlugin(Plugin):
    def execute_tool(self, sender, args):
        expression = args.get("expression", "")
        try:
            # 安全计算表达式
            result = self.safe_eval(expression)
            return {
                "success": True,
                "content": f"{expression} = {result}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"计算错误: {str(e)}"
            }

    def safe_eval(self, expr):
        # 安全的数学表达式计算
        pass

CalculatorPlugin.metadata = {
    "name": "calculator",
    "ai": {
        "tool": {
            "parameters": [
                {"name": "expression", "type": "string", "description": "数学表达式", "required": True}
            ],
            "usage": "数学计算器",
            "when_to_use": "用户需要进行数学计算时"
        }
    }
}
```

### executeTool 返回值

`executeTool` 必须返回一个对象：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `success` | boolean | 是 | 是否成功 |
| `content` | string | 是 | 返回内容（AI 会基于此生成回复） |
| `data` | object | 否 | 结构化数据（可选） |
| `error` | string | 否 | 错误信息（失败时） |

## 注入调用模式（inject）

AI 在处理消息时，根据触发规则将命令注入到消息流中，触发对应的插件。

### 配置

```javascript
// Node.js
metadata: {
    name: 'weather',
    triggers: [{ type: 0, pattern: '/weather' }],
    ai: {
        inject: {
            usage: '查询天气信息',
            format: '/weather {city}',
            args: {
                city: '城市名称，如：北京、上海'
            }
        }
    }
}
```

```python
# Python
metadata = {
    "name": "weather",
    "triggers": [{"type": 0, "pattern": "/weather"}],
    "ai": {
        "inject": {
            "usage": "查询天气信息",
            "format": "/weather {city}",
            "args": {
                "city": "城市名称，如：北京、上海"
            }
        }
    }
}
```

### inject 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `usage` | string | 是 | AI 看到的功能描述，帮助 AI 判断何时使用 |
| `format` | string | 是 | 命令格式模板，AI 会按此格式生成命令 |
| `args` | object | 否 | 参数说明，key 为参数名，value 为一句话描述 |

### args 写法规范

args 的值是一句话描述，写给 LLM 看，要包含「是什么 + 能填什么 + 默认什么」：

```javascript
args: {
    song: '歌曲名称，必填。只填歌名不填歌手，如：晴天',
    platform: '平台可选值：qq/网易云/汽水/抖音/酷我，默认咪咕'
}
```

### 工作流程

```
用户消息 → AI 分析 → 判断需要调用工具 → 生成命令字符串
→ 注入到消息流 → 匹配触发器 → 调用插件 handleMessage
```

AI 会根据 `usage` 判断是否需要调用此工具，然后按照 `format` 格式生成命令字符串，框架将其作为普通消息处理，匹配到对应触发器后调用插件的 `handleMessage`。

### 示例

```javascript
// Node.js
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
    ai: {
        inject: {
            usage: '翻译文本到指定语言',
            format: '/translate {text} {lang}',
            args: {
                text: '要翻译的文本',
                lang: '目标语言（如 en、ja、ko）'
            }
        }
    }
};

module.exports = TranslatePlugin;
```

```python
# Python
class TranslatePlugin(Plugin):
    def handle_message(self, sender):
        text = sender.param(0)
        target_lang = sender.param(1) or "en"
        # 翻译逻辑...
        sender.reply(f"翻译结果: {result}")

TranslatePlugin.metadata = {
    "name": "translate",
    "triggers": [{"type": 0, "pattern": "/translate"}],
    "ai": {
        "inject": {
            "usage": "翻译文本到指定语言",
            "format": "/translate {text} {lang}",
            "args": {
                "text": "要翻译的文本",
                "lang": "目标语言（如 en、ja、ko）"
            }
        }
    }
}
```

## 两种模式对比

| 特性 | 直接调用 (tool) | 注入调用 (inject) |
|------|----------------|------------------|
| 配置字段 | `ai.tool` | `ai.inject` |
| 处理钩子 | `executeTool` / `execute_tool` | `handleMessage` / `handle_message` |
| 调用方式 | AI 直接调用 → 返回值 | AI 生成命令 → 消息流 |
| 返回值 | 通过 `return` | 通过 `sender.reply()` |
| 适用场景 | 需要返回数据给 AI | 需要发送消息给用户 |
| 效率 | 较高（直接调用） | 较低（经过消息流） |
| 参数格式 | 结构化参数对象 | 命令字符串 |

## 混合模式

一个插件可以同时支持两种模式：

```javascript
// Node.js
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
    ai: {
        inject: {
            usage: '查询天气信息',
            format: '/weather {city}',
            args: { city: '城市名称' }
        },
        tool: {
            parameters: [
                { name: 'city', type: 'string', description: '城市名称', required: true },
                { name: 'days', type: 'number', description: '预报天数', required: false, default: 1 }
            ],
            usage: '查询指定城市的天气信息',
            when_to_use: '当用户询问天气、气温、是否下雨等问题时'
        }
    }
};

module.exports = WeatherPlugin;
```

```python
# Python
class WeatherPlugin(Plugin):
    # 注入调用：用户直接使用 /weather 命令
    def handle_message(self, sender):
        city = sender.param(0)
        data = self.fetch_weather(city)
        sender.reply(self.format_weather(data))

    # 直接调用：AI 调用获取结构化数据
    def execute_tool(self, sender, args):
        city = args.get("city")
        days = args.get("days", 1)
        data = self.fetch_weather(city, days)
        return {
            "success": True,
            "content": json.dumps(data)
        }

WeatherPlugin.metadata = {
    "name": "weather",
    "triggers": [{"type": 0, "pattern": "/weather"}],
    "ai": {
        "inject": {
            "usage": "查询天气信息",
            "format": "/weather {city}",
            "args": {"city": "城市名称"}
        },
        "tool": {
            "parameters": [
                {"name": "city", "type": "string", "description": "城市名称", "required": True},
                {"name": "days", "type": "number", "description": "预报天数", "required": False, "default": 1}
            ],
            "usage": "查询指定城市的天气信息",
            "when_to_use": "当用户询问天气、气温、是否下雨等问题时"
        }
    }
}
```

## 注释语法

在插件文件头部使用注释声明 AI 工具配置：

```javascript
// Node.js
// @ai-triggerable true
// @ai-trigger-usage 查询天气信息
// @ai-trigger-format /weather {city}
// @ai-trigger-args {"city":"城市名称"}
```

```python
# Python
"""
@ai-triggerable true
@ai-trigger-usage 查询天气信息
@ai-trigger-format /weather {city}
@ai-trigger-args {"city":"城市名称"}
"""
```

## 最佳实践

1. **优先使用直接调用**：如果只需要返回数据给 AI，使用 `tool` + `executeTool`/`execute_tool` 效率更高
2. **描述要清晰**：`usage` 和 `when_to_use` 描述越清晰，AI 判断越准确
3. **参数要完整**：`parameters` 定义完整，AI 才能正确传参
4. **错误要友好**：`executeTool`/`execute_tool` 返回 `success: false` 时，`error` 应包含可理解的错误信息
5. **幂等性**：AI 可能重复调用同一工具，`executeTool`/`execute_tool` 应尽量保证幂等
