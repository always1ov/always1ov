import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

// UnoCSS safelist: icons referenced dynamically must be listed here so
// the build keeps their CSS.
const safelist = [
  'i-ri-home-line',
  'i-ri-github-line',
  'i-ri-rss-line',
  'i-ri-mail-line',
]

/**
 * Valaxy build-time configuration.
 * Site-level fields (title, author, social, …) live in `site.config.ts`.
 */
export default defineValaxyConfig<UserThemeConfig>({
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: 'always1ov',
      subtitle: '一直走下去的小站',
    },

    // 自定义导航：写在这里会出现在顶部菜单。留空数组表示不显示额外导航。
    pages: [],

    footer: {
      since: 2026,
      beian: {
        enable: false,
      },
    },
  },

  unocss: { safelist },
})
