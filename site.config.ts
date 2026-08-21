import { defineSiteConfig } from 'valaxy'

/**
 * 站点层面的配置：我是谁、站在哪、给机器看的元信息。
 * 长什么样在 valaxy.config.ts 的 themeConfig 里，别混在一起。
 */
export default defineSiteConfig({
  url: 'https://always1ov.pages.dev',
  lang: 'zh-CN',
  languages: ['zh-CN'],
  timezone: 'Asia/Shanghai',

  title: 'always1ov',
  subtitle: '一直走，一直写。',
  description: 'always1ov 的个人站点：写代码、写字、把想明白的事情留下来。',

  author: {
    name: 'always1ov',
    email: 'always1ov.g@gmail.com',
    link: 'https://github.com/always1ov',
    avatar: '',
    status: { emoji: '', message: '' },
  },

  favicon: '/favicon.svg',

  // 自动摘要：正文第一段就是列表里那句灰字（文章里写了 description 则以它为准）
  excerpt: {
    type: 'text',
    auto: true,
    length: 120,
  },

  // 字数与阅读时长。速度按中文 400 字 / 英文 220 词每分钟算，比默认值更接近实际。
  statistics: {
    enable: true,
    readTime: {
      speed: { cn: 400, en: 220 },
    },
  },

  // 这些都不要：没有评论、没有赞助、没有 cookie
  comment: { enable: false },
  sponsor: { enable: false },
  search: { enable: false },
  mediumZoom: { enable: true },

  license: {
    enabled: true,
    type: 'by-nc-sa',
  },
})
