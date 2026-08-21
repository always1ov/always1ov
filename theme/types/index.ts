/** 主题配置的类型。写在这里，`valaxy.config.ts` 里就有补全和检查。 */

export interface NowItem {
  /** 左边那个等宽小标签，比如「在做」 */
  label: string
  text: string
}

export interface SocialItem {
  label: string
  href: string
  /** 右边那串灰字，比如 @always1ov */
  handle: string
}

export interface ThemeConfig {
  /**
   * 首页那行巨大的字。三段：主词、分隔点、强调词。
   * 第三段会用斜体 + 主色显示。
   */
  wordmark: [string, string, string]

  /** 站点的起点。首页页脚的「已持续 N 天」从这天算起。 */
  since: string

  /** 首页 01 自述：一段一个字符串。 */
  intro: string[]

  /** 首页 02 此刻：手动维护，写你现在真正在干的事。 */
  now: {
    updated: string
    items: NowItem[]
  }

  /** 顶栏导航。 */
  nav: { path: string, label: string }[]

  /** 首页 04 在别处 + 页脚。 */
  social: SocialItem[]

  /** 首页「最近在写」显示几篇。 */
  homePostCount: number

  /**
   * 首屏那片流场。种子默认取当天日期——
   * 同一天来的人看到同一张图，换一天就换一张。
   */
  hero: {
    enable: boolean
    /** 笔画数。越多越密，也越费一点性能。 */
    strokes: number
    /** 每根笔画最多走多少步。 */
    steps: number
    /** 噪声格边长（像素）。越大线条越舒展。 */
    cell: number
  }

  footer: {
    beian: string
    note: string
  }
}
