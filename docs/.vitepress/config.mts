import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'LinkZone',
  description: '多渠道智能机器人框架',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '功能', link: '/features/adapter' },
      { text: '插件开发', link: '/plugin-dev/overview' },
      { text: 'AI 配置', link: '/ai/overview' },
      { text: '友链', link: '/friends' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装部署', link: '/guide/installation' },
            { text: '配置管理', link: '/guide/configuration' }
          ]
        }
      ],
      '/features/': [
        {
          text: '功能模块',
          items: [
            { text: '适配器系统', link: '/features/adapter' },
            { text: '智能体配置', link: '/features/agent' },
            { text: '智能家居', link: '/features/smarthome' },
            { text: '插件市场', link: '/features/market' },
            { text: '返利服务', link: '/features/rebate' },
            { text: '转发服务', link: '/features/forwarder' }
          ]
        }
      ],
      '/plugin-dev/': [
        {
          text: '插件开发',
          items: [
            { text: '开发概述', link: '/plugin-dev/overview' },
            { text: '元信息定义', link: '/plugin-dev/metadata' },
            { text: '触发器', link: '/plugin-dev/triggers' },
            { text: 'Sender API', link: '/plugin-dev/sender-api' },
            { text: 'Plugin API', link: '/plugin-dev/plugin-api' },
            { text: 'AI 工具插件', link: '/plugin-dev/ai-tool' },
            { text: '适配器开发', link: '/plugin-dev/adapter-dev' },
            { text: 'LZDB 数据库', link: '/plugin-dev/lzdb' },
            { text: '完整示例', link: '/plugin-dev/examples' }
          ]
        }
      ],
      '/ai/': [
        {
          text: 'AI 配置',
          items: [
            { text: 'AI 概述', link: '/ai/overview' },
            { text: 'LLM 配置', link: '/ai/llm' },
            { text: '技能系统', link: '/ai/skill' },
            { text: '知识库', link: '/ai/knowledge' },
            { text: '工具系统', link: '/ai/tool' },
            { text: '上下文与记忆', link: '/ai/memory' },
            { text: '多模态', link: '/ai/multimodal' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cjhsy666/linkzone' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.19c-.23.65-.9 1.27-1.56 1.48-.4.12-.92.22-2.68-.58-1.82-.82-2.99-2.68-3.08-2.8-.09-.12-.74-.99-.74-1.88 0-.9.47-1.34.64-1.52.16-.18.36-.22.48-.22h.35c.11 0 .26 0 .4.28.15.35.51 1.24.55 1.33.05.09.08.2.02.31-.06.12-.09.19-.18.3-.09.1-.19.23-.27.31-.09.09-.18.18-.08.36.1.17.45.74.97 1.2.67.59 1.23.78 1.41.86.18.08.28.07.39-.04.1-.12.44-.51.56-.69.12-.17.24-.14.4-.09.17.06 1.07.5 1.25.59.18.09.3.14.35.21.04.08.04.44-.19.97z"/></svg>'
        },
        link: 'https://qm.qq.com/q/jprgeShUpq',
        ariaLabel: 'QQ 群'
      }
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    footer: {
      message: '基于 MIT 许可发布 | QQ 群：581485581 <a href="https://qm.qq.com/q/jprgeShUpq" target="_blank">点击加入</a>',
      copyright: 'LinkZone Team'
    }
  }
})
