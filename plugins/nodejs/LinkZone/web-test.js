/**
 * Web 适配器测试插件
 * 用于测试 Web 端消息段渲染和交互功能
 */
const axios = require('axios');

module.exports = {
    metadata: {
        name: 'Web测试',
        version: '1.0.0',
        description: 'Web 适配器功能测试，支持发送各种消息段类型',
        author: 'LinkZone Team',
        category: '测试',
        icon: '🧪',
        tags: ['测试', 'web'],
        license: 'MIT',

        triggers: [
            { type: 2, pattern: '^测试\\s+(.+)$' }
        ],
        event_types: ['message'],

        priority: 9999,
        is_service: false,
        is_public: true,
        is_encrypted: false,
        market: false,

        lifecycle_mode: 'transient',
        stage: 0,
        adapters: ['web'],
        permission_level: 1,

        ai_triggerable: true,
        ai_trigger_format: '测试 {type}',
        ai_trigger_usage: '测试 卡片',
        ai_trigger_args: {
            type: '测试类型：帮助/文本/图片/视频/语音/文件/AT/回复/表情/链接卡片/音乐卡片/位置卡片/按钮卡片/联系人卡片/JSON/转发/全部'
        },

        tool: {
            enabled: true,
            usage: '测试 Web 适配器的消息段渲染',
            when_to_use: '用户要求测试消息渲染时使用',
            parameters: [
                {
                    name: 'type',
                    type: 'string',
                    description: '测试类型',
                    required: true,
                    enum: ['帮助', '文本', '图片', '视频', '语音', '文件', 'AT', '回复', '表情', '链接卡片', '音乐卡片', '位置卡片', '按钮卡片', '联系人卡片', 'JSON', '转发', '全部'],
                    default: '帮助'
                }
            ]
        },

        config_schema: {},
        dependencies: [],
        extra: {}
    },

    async handleMessage(sender) {
        const message = sender.getMessage();
        const match = message.match(/^测试\s+(.+)$/);
        if (!match) return;

        const type = match[1].trim();
        const platform = sender.getPlatform();

        // 仅 web 适配器
        if (platform !== 'web') {
            await sender.reply('此插件仅支持 Web 适配器测试');
            return;
        }

        switch (type) {
            case '帮助':
            case 'help':
                await sender.reply([
                    '🧪 Web 测试插件',
                    '',
                    '可用测试项：',
                    '  测试 文本 - 纯文本消息',
                    '  测试 图片 - 图片消息段',
                    '  测试 视频 - 视频消息段',
                    '  测试 语音 - 语音消息段',
                    '  测试 文件 - 文件消息段',
                    '  测试 AT - @消息段',
                    '  测试 回复 - 回复消息段',
                    '  测试 表情 - 表情消息段',
                    '  测试 链接卡片 - 分享卡片',
                    '  测试 音乐卡片 - 音乐卡片',
                    '  测试 位置卡片 - 位置卡片',
                    '  测试 按钮卡片 - 按钮卡片',
                    '  测试 联系人卡片 - 联系人卡片',
                    '  测试 JSON - JSON卡片',
                    '  测试 转发 - 转发消息',
                    '  测试 全部 - 依次发送所有类型'
                ].join('\n'));
                break;

            case '文本':
                await sender.reply([
                    { type: 'text', data: { text: '这是一条纯文本消息 ✅' } }
                ]);
                break;

            case '图片':
                await sender.reply([
                    { type: 'text', data: { text: '📷 图片消息段测试：' } },
                    { type: 'image', data: { url: 'https://picsum.photos/400/300' } }
                ]);
                break;

            case '视频':
                await sender.reply([
                    { type: 'text', data: { text: '🎬 视频消息段测试：' } },
                    { type: 'video', data: { url: 'https://www.w3schools.com/html/mov_bbb.mp4' } }
                ]);
                break;

            case '语音':
                await sender.reply([
                    { type: 'text', data: { text: '🎤 语音消息段测试：' } },
                    { type: 'voice', data: { url: 'https://www.w3schools.com/html/horse.mp3' } }
                ]);
                break;

            case '文件':
                await sender.reply([
                    { type: 'text', data: { text: '📄 文件消息段测试：' } },
                    { type: 'file', data: { name: '测试文件.txt', size: 1024, url: 'https://example.com/test.txt' } }
                ]);
                break;

            case 'AT':
                await sender.reply([
                    { type: 'at', data: { user_id: 'all' } },
                    { type: 'text', data: { text: ' 这是一条AT全体消息' } }
                ]);
                break;

            case '回复':
                await sender.reply([
                    { type: 'reply', data: { id: sender.getMessageId() } },
                    { type: 'text', data: { text: '这是一条回复消息' } }
                ]);
                break;

            case '表情':
                await sender.reply([
                    { type: 'text', data: { text: '😊 表情消息段测试：' } },
                    { type: 'face', data: { id: '178' } }
                ]);
                break;

            case '链接卡片':
                await sender.reply([
                    { type: 'share', data: {
                        title: 'LinkZone - 即时通讯框架',
                        content: '一个现代化的即时通讯中间件框架',
                        url: 'https://github.com/linkzone',
                        image: 'https://picsum.photos/200/200'
                    }}
                ]);
                break;

            case '音乐卡片':
                await sender.reply([
                    { type: 'music', data: {
                        title: '晴天',
                        artist: '周杰伦',
                        url: 'https://music.example.com/play/1',
                        image: 'https://picsum.photos/200/200',
                        jump_url: 'https://music.example.com/song/1'
                    }}
                ]);
                break;

            case '位置卡片':
                await sender.reply([
                    { type: 'location', data: {
                        title: '天安门广场',
                        content: '北京市东城区东长安街',
                        lat: '39.9087',
                        lon: '116.3975'
                    }}
                ]);
                break;

            case '按钮卡片':
                await sender.reply([
                    { type: 'buttons', data: {
                        title: '操作面板',
                        content: '请选择一个操作',
                        buttons: [
                            { label: '确认', url: 'https://example.com/confirm' },
                            { label: '取消', url: 'https://example.com/cancel' },
                            { label: '详情', url: 'https://example.com/detail' }
                        ]
                    }}
                ]);
                break;

            case '联系人卡片':
                await sender.reply([
                    { type: 'contact', data: {
                        nickname: '测试用户',
                        type: 'qq',
                        id: '123456789'
                    }}
                ]);
                break;

            case 'JSON':
                await sender.reply([
                    { type: 'json', data: {
                        content: JSON.stringify({
                            title: 'JSON卡片测试',
                            description: '这是一条JSON格式的消息',
                            version: '1.0',
                            items: ['项目A', '项目B', '项目C']
                        }, null, 2)
                    }}
                ]);
                break;

            case '转发':
                await sender.reply([
                    { type: 'forward', data: {
                        title: '聊天记录',
                        content: '这是合并转发的消息',
                        count: 5
                    }}
                ]);
                break;

            case '全部':
                const tests = ['文本', '图片', '视频', '语音', '文件', 'AT', '链接卡片', '音乐卡片', '位置卡片', '按钮卡片', '联系人卡片', 'JSON', '转发'];
                await sender.reply(`🧪 开始依次测试 ${tests.length} 种消息段类型...`);
                for (const t of tests) {
                    await new Promise(r => setTimeout(r, 800));
                    // 递归调用自身处理每种类型
                    const origMessage = sender.getMessage;
                    // 直接发送各类型的消息段
                    const segments = this._getTestSegments(t);
                    if (segments) {
                        await sender.reply([
                            { type: 'text', data: { text: `── ${t} ──` } },
                            ...segments
                        ]);
                    }
                }
                await sender.reply('✅ 全部测试完成！');
                break;

            default:
                await sender.reply(`❌ 未知测试类型: ${type}\n输入「测试 帮助」查看可用类型`);
        }
    },

    // 获取指定类型的测试消息段
    _getTestSegments(type) {
        const map = {
            '文本': [{ type: 'text', data: { text: '纯文本消息 ✅' } }],
            '图片': [{ type: 'image', data: { url: 'https://picsum.photos/400/300' } }],
            '视频': [{ type: 'video', data: { url: 'https://www.w3schools.com/html/mov_bbb.mp4' } }],
            '语音': [{ type: 'voice', data: { url: 'https://www.w3schools.com/html/horse.mp3' } }],
            '文件': [{ type: 'file', data: { name: '测试文件.txt', size: 1024 } }],
            'AT': [{ type: 'at', data: { user_id: 'all' } }, { type: 'text', data: { text: ' AT全体' } }],
            '链接卡片': [{ type: 'share', data: { title: 'LinkZone', content: '即时通讯框架', url: 'https://github.com/linkzone', image: 'https://picsum.photos/200/200' } }],
            '音乐卡片': [{ type: 'music', data: { title: '晴天', artist: '周杰伦', url: 'https://music.example.com/play/1', image: 'https://picsum.photos/200/200' } }],
            '位置卡片': [{ type: 'location', data: { title: '天安门广场', content: '北京市东城区', lat: '39.9087', lon: '116.3975' } }],
            '按钮卡片': [{ type: 'buttons', data: { title: '操作面板', content: '请选择操作', buttons: [{ label: '确认', url: 'https://example.com/ok' }, { label: '取消', url: 'https://example.com/no' }] } }],
            '联系人卡片': [{ type: 'contact', data: { nickname: '测试用户', type: 'qq', id: '123456789' } }],
            'JSON': [{ type: 'json', data: { content: '{"title":"JSON测试","items":["A","B","C"]}' } }],
            '转发': [{ type: 'forward', data: { title: '聊天记录', content: '合并转发消息', count: 5 } }],
        };
        return map[type] || null;
    },

    // AI 工具执行
    async executeTool(sender, args) {
        const type = args.type || '帮助';
        // 复用 handleMessage 的逻辑
        const segments = this._getTestSegments(type);
        if (!segments) {
            return { success: false, error: `未知测试类型: ${type}` };
        }
        if (sender) {
            await sender.reply([
                { type: 'text', data: { text: `── ${type} 测试 ──` } },
                ...segments
            ]);
        }
        return { success: true, content: `已发送 ${type} 类型测试消息` };
    }
};
