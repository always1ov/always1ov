import type { LanguageInput as ShikiLanguage } from 'shiki'
import type { ThemeConfig } from './theme/types'
import { defineValaxyConfig } from 'valaxy'

/**
 * 两套 Shiki 主题，专门为这个站配的。
 *
 * 只用主色（朱砂红）和三档灰。代码块不该比正文还抢眼——
 * 彩虹配色会让读者的眼睛在一段代码里到处乱跳，而看代码时
 * 真正需要一眼看出来的只有三件事：哪里是注释、哪里是字符串、哪里是关键字。
 */
function shikiTheme(name: string, c: Record<string, string>) {
  return {
    name,
    type: name.includes('night') ? 'dark' as const : 'light' as const,
    colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.faint, fontStyle: 'italic' } },
      { scope: ['string', 'string.quoted', 'constant.other.symbol', 'markup.inline.raw'], settings: { foreground: c.string } },
      { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new', 'markup.heading'], settings: { foreground: c.accent } },
      { scope: ['constant.numeric', 'constant.language', 'constant.character', 'support.constant'], settings: { foreground: c.number } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: c.fg, fontStyle: 'bold' } },
      { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'], settings: { foreground: c.fg } },
      { scope: ['variable.other.property', 'meta.object-literal.key', 'support.type.property-name', 'entity.other.attribute-name'], settings: { foreground: c.prop } },
      { scope: ['entity.name.tag'], settings: { foreground: c.accent } },
      { scope: ['punctuation', 'keyword.operator', 'meta.brace'], settings: { foreground: c.faint } },
      { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
      { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    ],
  }
}

const alwaysNight = shikiTheme('always-night', {
  bg: '#070708',
  fg: '#e9e4da',
  faint: '#625d55',
  accent: '#ff4a2b',
  string: '#ff9c85',
  number: '#d7ab99',
  prop: '#b8b2a7',
})

const alwaysDay = shikiTheme('always-day', {
  bg: '#e7e3d8',
  fg: '#17160f',
  faint: '#8a8479',
  accent: '#c9310f',
  string: '#a84a2e',
  number: '#8a5238',
  prop: '#4f4a41',
})

export default defineValaxyConfig<ThemeConfig>({
  // 主题就在这个仓库里。不是装来的包，是可以随手改的源码。
  theme: './theme',

  themeConfig: {
    wordmark: ['ALWAYS', '·', '1OV'],
    since: '2026-07-31',

    nav: [
      { path: '/', label: '首页' },
      { path: '/posts', label: '写作' },
      { path: '/about', label: '关于' },
    ],

    // 首页 02「此刻」。手动维护——写你现在真正在干的事，别写成简历。
    now: {
      updated: '2026-08-20',
      items: [
        { label: '在做', text: '把这个站重写了一遍：自己的 Valaxy 主题，从一行 CSS 开始。' },
        { label: '在读', text: '《The Elements of Typographic Style》—— 排版是有语法的。' },
        { label: '在想', text: '个人网站的价值不在流量，在于它是一个不会被算法改写的地址。' },
      ],
    },

    social: [
      { label: 'GitHub', href: 'https://github.com/always1ov', handle: '@always1ov' },
      { label: 'RSS', href: '/atom.xml', handle: '/atom.xml' },
      { label: 'Email', href: 'mailto:always1ov.g@gmail.com', handle: 'always1ov.g@gmail.com' },
    ],

    homePostCount: 5,

    // 首屏那片流场。笔画越多越密，也越费一点性能。
    hero: {
      enable: true,
      strokes: 260,
      steps: 420,
      cell: 190,
    },

    footer: {
      beian: '',
      note: '这个站没有评论、没有统计、没有 cookie 提示——因为没有 cookie。',
    },
  },

  markdown: {
    theme: { light: alwaysDay, dark: alwaysNight },
    // Shiki 只加载列出来的语言，不列的语言不报错，只是不高亮。
    // 这里用的是语言 id 字符串，Shiki 的 LanguageInput 类型没把它算进去，所以要断言一下。
    languages: [
      'js', 'ts', 'jsx', 'tsx', 'vue', 'json', 'jsonc', 'yaml', 'toml',
      'css', 'scss', 'html', 'md', 'bash', 'shell', 'diff', 'python', 'go', 'rust', 'sql',
    ] as unknown as ShikiLanguage[],
    anchor: {
      permalink: (slug, _opts, state, idx) => {
        // 标题左边那个 #，鼠标移上去才出现
        const linkTokens = [
          Object.assign(new state.Token('link_open', 'a', 1), {
            attrs: [['class', 'header-anchor'], ['href', `#${slug}`], ['aria-label', '链接到此节']],
          }),
          Object.assign(new state.Token('link_close', 'a', -1), {}),
        ]
        state.tokens[idx + 1].children?.unshift(...linkTokens)
      },
    },
  },

  // 这个站不写数学公式。
  features: {
    katex: false,
  },

  vite: {
    plugins: [
      /**
       * 把 KaTeX 的样式表换成空的。
       *
       * `features.katex: false` 只关掉了客户端特性，样式表仍然被无条件引入
       * （Valaxy 那边的判断是 `!config.math`，唯一的关法是改用 MathJax）。
       * 那张表会带进 1.2MB 的字体文件——占了整个产物的一半。
       * 浏览器确实不会去下这些字体（没有匹配的排版就不触发 @font-face），
       * 但没必要为一个用不到的功能背这个包。
       */
      {
        name: 'always:drop-katex',
        enforce: 'pre' as const,
        resolveId(id: string) {
          return id.includes('katex/dist/katex.min.css') ? '\0always-empty.css' : null
        },
        load(id: string) {
          return id === '\0always-empty.css' ? '' : null
        },
      },
    ],
  },

  // 生成 RSS
  modules: {
    rss: {
      enable: true,
      fullText: true,
    },
  },

  unocss: {
    safelist: [],
  },
})
