# 示例插件

以下是一系列由简到繁的示例插件，涵盖 LinkZone 插件开发的主要功能。

## 1. 最简回声插件（函数式）

```javascript
// @name echo
// @version 1.0.0
// @description 回声插件，原样返回消息

module.exports = {
    metadata: {
        name: 'echo',
        version: '1.0.0',
        description: '回声插件',
        triggers: [{ type: 0, pattern: '/echo' }]
    },
    async handleMessage(sender) {
        const text = sender.getMessage().replace('/echo', '').trim();
        await sender.reply(text || '请输入内容');
    }
};
```

## 2. 问候插件（类式）

```javascript
// @name hello
// @version 1.0.0
// @description 问候插件

class HelloPlugin extends Plugin {
    async handleMessage(sender) {
        const name = sender.getSenderName();
        const isGroup = sender.isGroup();

        if (isGroup) {
            await sender.reply([
                LinkZone.segment.at(sender.getSenderId()),
                LinkZone.segment.text(` 你好，${name}！`)
            ]);
        } else {
            await sender.reply(`你好，${name}！`);
        }
    }
}

HelloPlugin.metadata = {
    name: 'hello',
    version: '1.0.0',
    description: '问候插件',
    triggers: [{ type: 0, pattern: '/hello' }],
    event_types: ['message']
};

module.exports = HelloPlugin;
```

## 3. 关键词回复插件

```javascript
// @name mood
// @version 1.0.0
// @description 心情回复

module.exports = {
    metadata: {
        name: 'mood',
        version: '1.0.0',
        description: '根据关键词回复心情',
        triggers: [
            { type: 1, pattern: '开心' },
            { type: 1, pattern: '难过' },
            { type: 1, pattern: '生气' }
        ]
    },
    async handleMessage(sender) {
        const msg = sender.getMessage();
        if (msg.includes('开心')) {
            await sender.reply('太好了！保持好心情 😊');
        } else if (msg.includes('难过')) {
            await sender.reply('别难过，一切都会好起来的');
        } else if (msg.includes('生气')) {
            await sender.reply('深呼吸，冷静一下');
        }
    }
};
```

## 4. 正则匹配插件

```javascript
// @name dice
// @version 1.0.0
// @description 掷骰子

module.exports = {
    metadata: {
        name: 'dice',
        version: '1.0.0',
        description: '掷骰子',
        triggers: [{ type: 2, pattern: '^r(\\d+)?d(\\d+)$' }]
    },
    async handleMessage(sender) {
        const count = parseInt(await sender.param(0)) || 1;
        const sides = parseInt(await sender.param(1)) || 6;

        const results = [];
        for (let i = 0; i < Math.min(count, 10); i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }

        const total = results.reduce((a, b) => a + b, 0);
        await sender.reply(
            `🎲 掷了 ${count} 个 ${sides} 面骰子: [${results.join(', ')}] = ${total}`
        );
    }
};
```

## 5. 多轮对话插件

```javascript
// @name guess-number
// @version 1.0.0
// @description 猜数字游戏

class GuessNumberPlugin extends Plugin {
    async handleMessage(sender) {
        const target = Math.floor(Math.random() * 100) + 1;
        await sender.reply('我想了一个 1-100 的数字，猜猜看！');

        let attempts = 0;
        while (attempts < 7) {
            const result = await sender.listen({
                timeout: 60000,
                cancelKeywords: ['不玩了', '退出']
            });

            if (result.timeout || result.cancelled) {
                await sender.reply(`游戏结束！答案是 ${target}`);
                return;
            }

            const guess = parseInt(result.sender.getMessage());
            if (isNaN(guess)) {
                await sender.reply('请输入数字');
                continue;
            }

            attempts++;
            if (guess === target) {
                await sender.reply(`恭喜猜对了！用了 ${attempts} 次`);
                return;
            } else if (guess < target) {
                await sender.reply('太小了，再猜');
            } else {
                await sender.reply('太大了，再猜');
            }
        }

        await sender.reply(`7 次都没猜对，答案是 ${target}`);
    }
}

GuessNumberPlugin.metadata = {
    name: 'guess-number',
    version: '1.0.0',
    description: '猜数字游戏',
    triggers: [{ type: 0, pattern: '/guess' }]
};

module.exports = GuessNumberPlugin;
```

## 6. 定时任务插件

```javascript
// @name morning-greeting
// @version 1.0.0
// @description 每日早安问候
// @cron 0 8 * * *
// @lifecycle persistent

class MorningPlugin extends Plugin {
    async onStart() {
        this.log.info('早安插件已启动');
    }

    async handleCron() {
        const greetings = [
            '早上好！新的一天开始了',
            '早安！今天也要加油哦',
            'Good Morning！'
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        await LinkZone.sendGroupMessage('group_123', greeting);
    }
}

MorningPlugin.metadata = {
    name: 'morning-greeting',
    version: '1.0.0',
    description: '每日早安问候',
    cron: '0 8 * * *',
    lifecycle_mode: 'persistent'
};

module.exports = MorningPlugin;
```

## 7. 数据库使用插件

```javascript
// @name counter
// @version 1.0.0
// @description 计数器

class CounterPlugin extends Plugin {
    async handleMessage(sender) {
        const userId = sender.getSenderId();
        const key = `count_${userId}`;

        let count = await this.db.get(key) || 0;
        count++;
        await this.db.set(key, count);

        await sender.reply(`你已使用 ${count} 次`);
    }
}

CounterPlugin.metadata = {
    name: 'counter',
    version: '1.0.0',
    description: '计数器',
    triggers: [{ type: 0, pattern: '/count' }]
};

module.exports = CounterPlugin;
```

## 8. AI 工具插件（直接调用）

```javascript
// @name calculator
// @version 1.0.0
// @description 计算器

class CalculatorPlugin extends Plugin {
    async executeTool(sender, args) {
        const { expression } = args;
        try {
            // 简单安全计算
            const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
            const result = Function('"use strict"; return (' + sanitized + ')')();
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
}

CalculatorPlugin.metadata = {
    name: 'calculator',
    version: '1.0.0',
    description: '计算器',
    tool: {
        enabled: true,
        usage: '数学计算器，支持加减乘除',
        when_to_use: '用户需要进行数学计算时',
        parameters: [
            { name: 'expression', type: 'string', description: '数学表达式', required: true }
        ]
    }
};

module.exports = CalculatorPlugin;
```

## 9. AI 触发插件（注入调用）

```javascript
// @name translate
// @version 1.0.0
// @description 翻译插件
// @ai-triggerable true
// @ai-trigger-usage 翻译文本到指定语言
// @ai-trigger-format /translate {text} {lang}

class TranslatePlugin extends Plugin {
    async handleMessage(sender) {
        const text = await sender.param(0);
        const targetLang = await sender.param(1) || 'en';

        const config = await sender.getConfig();
        const result = await LinkZone.httpPost(
            'https://api.translate.com/v2',
            { text, target: targetLang },
            { Authorization: `Bearer ${config.api_key}` }
        );

        await sender.reply(result.translatedText);
    }
}

TranslatePlugin.metadata = {
    name: 'translate',
    version: '1.0.0',
    description: '翻译插件',
    triggers: [{ type: 0, pattern: '/translate' }],
    ai_triggerable: true,
    ai_trigger_usage: '翻译文本到指定语言',
    ai_trigger_format: '/translate {text} {lang}',
    ai_trigger_args: {
        text: '要翻译的文本',
        lang: '目标语言（如 en、ja、ko）'
    },
    config_schema: {
        api_key: {
            type: 'string',
            label: '翻译 API Key',
            required: true
        }
    }
};

module.exports = TranslatePlugin;
```

## 10. 管理员插件

```javascript
// @name admin-ban
// @version 1.0.0
// @description 管理员禁言工具
// @permission-level 6

class AdminBanPlugin extends Plugin {
    async handleMessage(sender) {
        if (!sender.isAdmin()) {
            await sender.reply('仅管理员可使用此命令');
            return;
        }

        const userId = await sender.param(0);
        const duration = parseInt(await sender.param(1)) || 60;

        if (!userId) {
            await sender.reply('用法: /ban @用户 时长(秒)');
            return;
        }

        await sender.ban(userId, duration);
        await sender.reply(`已禁言 ${userId} ${duration} 秒`);

        // 自动解禁
        if (duration > 0) {
            setTimeout(async () => {
                try {
                    await sender.unban(userId);
                } catch (e) {
                    this.log.error(`自动解禁失败: ${e.message}`);
                }
            }, duration * 1000);
        }
    }
}

AdminBanPlugin.metadata = {
    name: 'admin-ban',
    version: '1.0.0',
    description: '管理员禁言工具',
    triggers: [{ type: 0, pattern: '/ban' }],
    permission_level: 6
};

module.exports = AdminBanPlugin;
```

## 11. Python 示例 - 回声插件

```python
# @name echo
# @version 1.0.0
# @description Python 回声插件

# SDK 对象由 runtime 自动注入，无需 import

def handle_message(sender):
    text = sender.get_message().replace("/echo", "").strip()
    sender.reply(text or "请输入内容")

metadata = {
    "name": "echo",
    "version": "1.0.0",
    "description": "Python 回声插件",
    "triggers": [{"type": 0, "pattern": "/echo"}]
}
```

## 12. Python 示例 - 类式插件

```python
# @name hello
# @version 1.0.0
# @description Python 问候插件

# SDK 对象由 runtime 自动注入，无需 import

class HelloPlugin(Plugin):
    def handle_message(self, sender):
        name = sender.get_sender_name()
        sender.reply(f"你好，{name}！")

HelloPlugin.metadata = {
    "name": "hello",
    "version": "1.0.0",
    "description": "Python 问候插件",
    "triggers": [{"type": 0, "pattern": "/hello"}],
    "event_types": ["message"]
}
```

## 13. Python 示例 - 流程控制

```python
# @name gate
# @version 1.0.0
# @description 消息门控插件

# SDK 对象由 runtime 自动注入，无需 import

def handle_message(sender):
    msg = sender.get_message()

    if "禁止词" in msg:
        sender.abort()  # 中止后续插件
        sender.reply("消息已被拦截")
    else:
        sender.continue_()  # 继续执行后续插件（Python 用 continue_）

metadata = {
    "name": "gate",
    "version": "1.0.0",
    "description": "消息门控插件",
    "triggers": [{"type": 1, "pattern": "禁止词"}],
    "priority": -10  # 高优先级
}
```
