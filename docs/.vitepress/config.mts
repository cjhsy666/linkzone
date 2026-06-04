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
      { text: 'API', link: '/api/system' }
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
            { text: '插件系统', link: '/features/plugin' },
            { text: '许可证系统', link: '/features/license' }
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
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '系统 API', link: '/api/system' },
            { text: '智能体 API', link: '/api/agent' },
            { text: '插件 API', link: '/api/plugin' },
            { text: '用户与群组 API', link: '/api/user' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/linkzone' }
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
      message: '基于 MIT 许可发布',
      copyright: 'LinkZone Team'
    }
  }
})
