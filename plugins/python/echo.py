metadata = {
    'name': 'echo-python',
    'version': '2.0.0',
    'description': '复读机 - 支持文本和图片复读',
    'author': 'example',
    'triggers': [
        {'type': 0, 'pattern': '复读echo'},
    ],
    'event_types': ['message'],
    'is_public': True,
    'market': True
}

from sdk import Plugin, Sender


class EchoPlugin(Plugin):
    def handle_message(self, sender: Sender):
        msg = sender.get_message()

        if msg.startswith('复读echo '):
            sender.reply(msg[6:])

        elif sender.segments:
            for seg in sender.segments:
                if seg.get('type') == 'image':
                    url = seg.get('data', {}).get('url', '')
                    if url:
                        sender.reply([{'type': 'image', 'data': {'url': url}}])
                    return
