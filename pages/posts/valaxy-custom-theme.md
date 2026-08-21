---
title: 给 Valaxy 写一个只属于自己的主题
date: 2026-08-18
tags:
  - 工程
  - Valaxy
  - Vue
description: 不改别人的主题，直接写一个自己的。Valaxy 的主题解析支持本地路径，于是主题可以就住在博客仓库里。
---

这个站一开始用的是 Valaxy 的默认主题。它没什么毛病——如果你想要的正好是它给的那种样子。

问题是我不想要。我想要的是一个「一眼能看出是我的」的站，而不是「一眼能看出用了什么主题」的站。于是我做了一件听起来很重、其实很轻的事：**自己写了一个主题**。

## 主题不必是一个 npm 包

大多数人卡在第一步：主题得发布成 `valaxy-theme-xxx` 才能用吗？

翻一下 Valaxy 解析主题的那段代码，答案是不用：

```ts
async function getThemeRoot(name, entry) {
  const themeModule = name.startsWith('valaxy-theme') || name.startsWith('.')
    ? name
    : `valaxy-theme-${name}`
  return await getModuleRoot(themeModule, entry)
}
```

关键在 `name.startsWith('.')`——**以点开头就按路径解析**。所以配置里直接写相对路径就行：

```ts title=valaxy.config.ts
export default defineValaxyConfig<ThemeConfig>({
  theme: './theme',
})
```

主题从此住在博客仓库里。不用发包，不用 `npm link`，不用在两个仓库之间来回切。改主题和改文章是同一次 commit。

::: tip 这才是个人网站该有的样子
主题是你自己的源码，不是一个装来的黑盒。想改哪就改哪，不用先搞明白六层继承。
:::

## 一个主题需要哪些文件

Valaxy 从 `[themeRoot, userRoot]` 这两个根目录里找东西，后面的覆盖前面的。所以主题目录长这样：

```
theme/
├── package.json      # Valaxy 会读它，缺了会报警告
├── valaxy.config.ts  # 主题自带的默认配置
├── index.html        # 会被合进最终页面的 <head>
├── App.vue           # 全局层：命令面板之类的浮层
├── types/index.ts    # 主题配置的类型
├── styles/index.scss # 样式入口
├── layouts/          # home / post / archives / 404 …
└── components/       # 主题自己的组件
```

其中最值得说的是 `types/index.ts`。把主题配置的类型写出来之后，`valaxy.config.ts` 里就有补全和检查了：

```ts
export interface ThemeConfig {
  wordmark: [string, string, string]
  now: { updated: string, items: { label: string, text: string }[] }
  hero: { enable: boolean, strokes: number, steps: number, cell: number }
}
```

配置写错一个字段名，编辑器当场告诉你，而不是等构建出来发现首页少了一块。

## 布局里的 RouterView 是内容的位置

这是理解 Valaxy 布局的关键一句话：**layout 是外壳，`<RouterView />` 是 markdown 渲染出来的正文**。

所以文章页的布局就是「标题区 + 正文 + 目录 + 上下篇」：

```vue title=theme/layouts/post.vue
<template>
  <TheShell>
    <ReadingProgress />
    <article>
      <header class="article-head">
        <h1 class="article-title">{{ frontmatter.title }}</h1>
      </header>

      <div class="article-layout">
        <div class="markdown-body">
          <RouterView />
        </div>
        <TheToc />
      </div>
    </article>
  </TheShell>
</template>
```

顺着这个思路，首页那段「自述」我也没写进配置，而是让它就是 `pages/index.md` 的正文——内容归内容，配置归配置。

## 让代码块闭嘴

Valaxy 用 Shiki 高亮，支持传入自定义的 TextMate 主题。这个站只有两种颜色，代码块当然也不能例外：

```ts title=valaxy.config.ts
tokenColors: [
  { scope: ['comment'], settings: { foreground: '#625d55', fontStyle: 'italic' } },
  { scope: ['string'], settings: { foreground: '#ff9c85' } },
  { scope: ['keyword', 'storage'], settings: { foreground: '#ff4a2b' } },
  { scope: ['punctuation', 'keyword.operator'], settings: { foreground: '#625d55' } },
]
```

彩虹配色会让眼睛在一段代码里到处乱跳。而读代码时真正需要一眼看出来的只有三件事：哪里是注释、哪里是字符串、哪里是关键字。其余的，让它安静。

::: warning 一个坑
Shiki 只加载你在 `markdown.languages` 里列出来的语言。不列，代码块就是一片纯文本——而且不报错。
:::

## 结果

| | 用现成主题 | 自己写 |
|---|---|---|
| 上手 | 十分钟 | 一个下午 |
| 想改个间距 | 翻主题文档、找变量、可能找不到 | 打开文件改一行 |
| 站点长得像谁 | 像这个主题 | 像我 |

如果只是想快点把东西写出来，用现成主题完全合理。但如果这个地址你打算留十年，那它长什么样这件事，值得你自己说了算。
