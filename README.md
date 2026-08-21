<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img src="assets/banner-dark.svg" alt="always1ov" width="100%">
</picture>

# always1ov

**一直走，一直写。**

这里是我的个人网站的全部源码 —— 不是博客平台上的一个账号，是一个我自己能改到每一个像素的地址。

**→ [always1ov.pages.dev](https://always1ov.pages.dev)**

---

## 这是什么

一个用 [Valaxy](https://valaxy.site)（Vue 3 + Vite）搭的静态站点。**主题不是装来的，是这个仓库里的 `theme/` 目录**，从一行 CSS 一个组件写出来的，叫 `valaxy-theme-always`。

它长这样，是因为做了这些决定：

| 决定 | 为什么 |
| --- | --- |
| 只有两种颜色：墨与纸，加一点朱砂红 | 每多一种颜色，重点就少一分 |
| 中文不加载网络字体 | 一套中文字体动辄 3~8 MB，不值得让所有人多等两秒 |
| 首屏那片东西是当场画出来的 | 一条不抬笔的线，正好就是 always 的字面意思 |
| 没有评论、没有统计、没有 cookie 提示 | 因为没有 cookie |

细节写在这两篇里：[给 Valaxy 写一个只属于自己的主题](https://always1ov.pages.dev/posts/valaxy-custom-theme)、[这个站长这样，是有原因的](https://always1ov.pages.dev/posts/design-notes)。

## 本地跑起来

需要 Node ≥ 22.12。

```bash
npm install
npm run dev      # http://localhost:4859
npm run build    # 产物在 ./dist
```

## 目录长什么样

```
.
├── pages/              # 内容。写文章就是往这加 markdown
│   ├── index.md        #   首页「自述」那段
│   ├── about.md
│   └── posts/*.md
├── theme/              # 主题 valaxy-theme-always（不是依赖，是源码）
│   ├── layouts/        #   home / post / archives / tags / 404
│   ├── components/     #   首屏画布、命令面板、目录、条目行…
│   ├── styles/         #   设计系统：token、排版、组件
│   └── types/          #   主题配置的类型
├── valaxy.config.ts    # 主题配置 + 自定义的 Shiki 配色
├── site.config.ts      # 站点元信息
└── scripts/banner.mjs  # 生成上面那张横幅
```

## 写一篇新文章

在 `pages/posts/` 下新建一个 markdown：

```markdown
---
title: 标题
date: 2026-08-21
tags: [随笔]
description: 列表里显示的那句话。不写会自动摘录第一段。
---

正文。
```

推到 `main`，GitHub Actions 会构建并部署到 Cloudflare Pages。

## 部署到 Cloudflare Pages

两条路，选一条就行。**推荐第一条**：不用管密钥，Cloudflare 自己拉代码构建。

### 一、Cloudflare 的 Git 集成（推荐）

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选中 `always1ov/always1ov`
3. 构建配置照下面填：

   | 字段 | 填什么 |
   | --- | --- |
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | 留空 |

   Node 版本不用手填 —— 仓库里的 `.node-version` 已经钉死 22.12.0（Valaxy 的硬要求，
   Cloudflare 默认的 Node 太老，会构建失败）。

4. **Save and Deploy**

以后每次 push 到 `main` 自动部署，PR 自动生成预览地址。仓库里一个密钥都不用配。

### 二、GitHub Actions + Wrangler

想把部署留在自己的 CI 里就走这条。需要配三个值：

| 位置 | 名称 |
| --- | --- |
| Settings → Secrets and variables → Actions → **Secrets** | `CLOUDFLARE_API_TOKEN` |
| Settings → Secrets and variables → Actions → **Secrets** | `CLOUDFLARE_ACCOUNT_ID` |
| Settings → Secrets and variables → Actions → **Variables** | `CLOUDFLARE_PROJECT_NAME` |

API Token 在 Cloudflare 的 **My Profile → API Tokens** 建，权限选 `Cloudflare Pages: Edit`。
Account ID 在任意域名的概览页右侧能看到。

配好之后 push 一次即可。**没配 `CLOUDFLARE_PROJECT_NAME` 时部署那步会自动跳过**，
不会在每次提交上留一个红叉 —— 所以走第一条路的话，这里什么都不用动。

### 绑自定义域名

Pages 项目建好后：**Custom domains** → **Set up a custom domain**，填你的域名，
按提示把 DNS 记录指过去。之后记得把 `site.config.ts` 里的 `url` 改成新域名
（RSS、sitemap、社交卡片的绝对地址都从那里取）。

---

<sub>文章依 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 共享，代码依 MIT 开源。</sub>
