import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://always1ov.pages.dev',
  lang: 'zh-CN',
  title: 'always1ov',
  author: {
    name: 'always1ov',
    avatar: '',
    description: '一直走，一直写。',
  },
  description: 'always1ov 的个人小站。',
  keywords: ['always1ov', 'blog', 'valaxy'],

  // 社交链接：留空数组即可不显示社交区
  social: [],

  search: {
    enable: true,
  },

  sponsor: {
    enable: false,
  },
})
