import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { defaultThemeConfig } from './node'

/**
 * 主题自带的 Valaxy 配置。
 *
 * 这里只声明主题层面的东西：默认主题配置、暗色策略、要保留的图标类名。
 * 站点层面的（标题、作者、部署地址）在根目录的 site.config.ts 里。
 */
export default defineTheme<ThemeConfig>(() => {
  return {
    themeConfig: {
      ...defaultThemeConfig,

      // 夜色是这个主题的默认状态；访客切换过之后以他的选择为准
      valaxyDarkOptions: {
        useDarkOptions: { initialValue: 'dark' },
        themeColor: { light: '#f2efe7', dark: '#0b0b0c' },
      },
    },

    unocss: {
      safelist: [],
    },
  }
})
