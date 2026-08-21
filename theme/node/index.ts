import type { ThemeConfig } from '../types'

/**
 * 主题的出厂设置。
 * 用户在根目录的 valaxy.config.ts 里写的 themeConfig 会覆盖这里。
 */
export const defaultThemeConfig: ThemeConfig = {
  wordmark: ['ALWAYS', '·', '1OV'],
  since: '2026-07-31',
  intro: [],
  now: { updated: '', items: [] },
  nav: [
    { path: '/', label: '首页' },
    { path: '/posts', label: '写作' },
    { path: '/about', label: '关于' },
  ],
  social: [],
  homePostCount: 5,
  hero: { enable: true, strokes: 260, steps: 420, cell: 190 },
  footer: { beian: '', note: '' },
}
