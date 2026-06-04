# 插件示例

本节提供一些常见场景的完整插件示例，可以直接复制使用或作为开发参考。

## 回声插件

将用户的消息原样返回。

```javascript
// ecosystems/nodejs/plugins/echo/index.js
module.exports = {
    metadata: {
        name: 'echo',
        version: '1.0.0',
        description: '回声插件 - 原样返回消息',
        triggers: [{ type: 0, pattern: '/echo' }],
        event_types: ['message']
    },
    async handleMessage(sender) {
        const text = await sender.param(0);
        if (!text) {
            await sender.reply('用法：/echo <内容>');
            return;
        }
        await sender.reply(text);
    }
};
```

## 随机数插件

生成指定范围的随机数。

```javascript
// ecosystems/nodejs/plugins/random/index.js
module.exports = {
    metadata: {
        name: 'random',
        version: '1.0.0',
        description: '随机数生成器',
        triggers: [{ type: 0, pattern: '/random' }],
        event_types: ['message']
    },
    async handleMessage(sender) {
        const min = parseInt(await sender.param(0)) || 1;
        const max = parseInt(await sender.param(1)) || 100;
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        await sender.reply(`🎲 随机数：${result}（范围 ${min}~${max}）`);
    }
};
```

## 计时器插件

设置倒计时提醒。

```javascript
// ecosystems/nodejs/plugins/timer/index.js
const { Plugin } = require('linkzone-sdk');

class TimerPlugin extends Plugin {
    constructor() {
        super({
            name: 'timer',
            version: '1.0.0',
            description: '倒计时提醒',
            triggers: [{ type: 0, pattern: '/timer' }],
            event_types: ['message']
        });
        this.timers = new Map();
    }

    async handleMessage(sender) {
        const minutes = parseInt(await sender.param(0));
        if (!minutes || minutes <= 0) {
            await sender.reply('用法：/timer <分钟数>');
            return;
        }

        const userId = sender.getSenderId();
        const ms = minutes * 60 * 1000;

        await sender.reply(`⏰ 已设置 ${minutes} 分钟倒计时`);

        const timer = setTimeout(async () => {
            try {
                await sender.reply(`⏰ 倒计时结束！已过去 ${minutes} 分钟`);
            } catch (e) {
                // 用户可能已离线
            }
            this.timers.delete(userId);
        }, ms);

        this.timers.set(userId, timer);
    }

    async onStop() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
}

module.exports = TimerPlugin;
```

## 投票插件

创建简单的群投票。

```javascript
// ecosystems/nodejs/plugins/vote/index.js
const { Plugin, LZDB } = require('linkzone-sdk');

class VotePlugin extends Plugin {
    constructor() {
        super({
            name: 'vote',
            version: '1.0.0',
            description: '群投票',
            triggers: [
                { type: 0, pattern: '/vote' },
                { type: 0, pattern: '/vote_result' }
            ],
            event_types: ['message']
        });
        this.db = new LZDB('vote');
    }

    async handleMessage(sender) {
        const cmd = sender.getMessage().split(' ')[0];

        if (cmd === '/vote_result') {
            return this.showResult(sender);
        }

        return this.createVote(sender);
    }

    async createVote(sender) {
        const topic = await sender.param(0);
        if (!topic) {
            await sender.reply('用法：/vote <主题>\n查看结果：/vote_result <主题>');
            return;
        }

        await sender.reply(`📊 投票开始：${topic}\n回复"赞成"或"反对"参与投票`);

        const result = await sender.listen({
            timeout: 60000,
            rules: [
                { type: 1, pattern: '赞成' },
                { type: 1, pattern: '反对' }
            ]
        });

        if (result.timeout) {
            await sender.reply('⏰ 投票超时');
            return;
        }

        const vote = result.sender.getMessage();
        const key = `vote:${sender.getGroupId()}:${topic}`;
        const data = await this.db.get(key, { yes: 0, no: 0 });

        if (vote.includes('赞成')) data.yes++;
        else data.no++;

        await this.db.set(key, data);
        await sender.reply(`📊 当前结果：赞成 ${data.yes} / 反对 ${data.no}`);
    }

    async showResult(sender) {
        const topic = await sender.param(0);
        if (!topic) {
            await sender.reply('用法：/vote_result <主题>');
            return;
        }

        const key = `vote:${sender.getGroupId()}:${topic}`;
        const data = await this.db.get(key, null);

        if (!data) {
            await sender.reply('未找到该投票');
            return;
        }

        await sender.reply(`📊 投票结果【${topic}】：\n赞成：${data.yes}\n反对：${data.no}`);
    }
}

module.exports = VotePlugin;
```

## AI 工具插件示例

一个可以被智能体自动调用的翻译工具。

```javascript
// ecosystems/nodejs/plugins/translate/index.js
module.exports = {
    metadata: {
        name: 'translate',
        version: '1.0.0',
        description: '翻译工具',
        triggers: [{ type: 0, pattern: '/translate' }],
        event_types: ['message'],
        tool: {
            enabled: true,
            usage: '将文本翻译为指定语言',
            when_to_use: '当用户需要翻译文本时',
            parameters: [
                { name: 'text', type: 'string', description: '要翻译的文本', required: true },
                { name: 'target_lang', type: 'string', description: '目标语言', required: true, enum: ['en', 'zh', 'ja', 'ko'] }
            ],
            continue: true
        },
        ai_triggerable: true,
        ai_trigger_usage: '翻译文本到指定语言',
        ai_trigger_format: '/translate {text} {target_lang}',
        ai_trigger_args: { text: '要翻译的文本', target_lang: '目标语言(en/zh/ja/ko)' }
    },
    async handleMessage(sender) {
        const text = await sender.param(0);
        const targetLang = await sender.param(1) || 'en';
        if (!text) {
            await sender.reply('用法：/translate <文本> [目标语言]');
            return;
        }
        const result = await this.doTranslate(text, targetLang);
        await sender.reply(result);
    },
    async executeTool(ctx, args) {
        const { text, target_lang } = args;
        const result = await this.doTranslate(text, target_lang);
        return { success: true, content: result };
    },
    async doTranslate(text, targetLang) {
        // 调用翻译 API
        // 这里使用简单的示例
        return `[翻译结果] ${text} → ${targetLang}`;
    }
};
```

## Python 插件示例

```python
# ecosystems/python/plugins/hello/hello.py
"""
@name hello
@version 1.0.0
@description Python 问候插件
@command /hello_py
"""

from linkzone import Plugin, create_plugin

class HelloPlugin(Plugin):
    def __init__(self):
        super().__init__({
            "name": "hello_py",
            "version": "1.0.0",
            "description": "Python 问候插件",
            "triggers": [{"type": 0, "pattern": "/hello_py"}],
            "event_types": ["message"]
        })

    async def handle_message(self, sender):
        name = sender.get_sender_name()
        await sender.reply(f"你好，{name}！这是来自 Python 插件的问候 🐍")

create_plugin(HelloPlugin)
```
