metadata = {
    'name': 'hello-python',
    'version': '2.0.0',
    'description': 'Python 示例插件 - 展示各种触发器类型',
    'author': 'example',
    'triggers': [
        {'type': 0, 'pattern': '/hello'},
        {'type': 1, 'pattern': '你好'},
        {'type': 2, 'pattern': r'^问候(\S+)'},
    ],
    'event_types': ['message'],
    'is_public': True,
    'market': True
}

from sdk import Plugin, Sender


class HelloPlugin(Plugin):
    def on_start(self):
        LinkZone.logger.info(self.metadata["name"], "已启动")

    def handle_message(self, sender: Sender):
        msg = sender.get_message()

        if msg == '/hello':
            sender.reply('Hello from Python!')

        elif '你好' in msg:
            name = sender.get_sender_name() or '朋友'
            sender.reply(f'你好 {name}！')

        elif msg.startswith('问候'):
            name = sender.param(1) or '朋友'
            sender.reply(f'你好 {name}！')

        elif sender.segments:
            for seg in sender.segments:
                if seg.get('type') == 'image':
                    sender.reply('收到图片！')
                    return
                if seg.get('type') == 'at':
                    qq = seg.get('data', {}).get('qq', '')
                    if qq:
                        sender.reply(f'你 @了 {qq}')
                        return

    def on_stop(self):
        LinkZone.logger.info(self.metadata["name"], "已停止")
