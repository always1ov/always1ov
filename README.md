# always1ov

> always1ov 的个人小站。Vue 3 + Valaxy + Cloudflare Pages。

## 技术栈

- **框架**：[Valaxy](https://github.com/YunYouJun/valaxy) `1.0.0-rc.1`
- **主题**：[valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun)
- **构建**：Vite
- **样式**：UnoCSS
- **部署**：Cloudflare Pages（通过 GitHub Actions 触发 Wrangler 部署）

## 本地开发

需要 Node ≥ 20.12 和 pnpm ≥ 9。

```bash
pnpm install
pnpm dev      # 启动本地开发服务（默认 http://localhost:4859）
pnpm build    # 生成静态站点到 ./dist
```

## 目录结构

```
.
├── AGENTS.md              # 给 AI 代理阅读的操作指引
├── PROJECT_DIARY.md       # 项目日记：当前状态 + 决策日志 + 详细条目
├── pages/                 # 路由与内容（Markdown / Vue 均可）
│   ├── index.md           # 首页
│   ├── about.md           # 关于
│   ├── 404.md
│   └── posts/             # 博客文章（按文件路径作为 URL）
├── public/                # 直接拷贝到输出的静态资源
├── site.config.ts         # 站点级配置（标题、作者、社交、搜索、打赏）
├── valaxy.config.ts       # Valaxy 构建配置（主题、菜单、页脚）
└── .github/workflows/     # GitHub Actions
    └── deploy.yml         # push main 自动部署到 Cloudflare Pages
```

## 写一篇新文章

在 `pages/posts/<slug>.md` 新建一个 Markdown 文件即可，frontmatter 形如：

```yaml
---
title: 文章标题
date: 2026-07-30
tags: [杂谈]
---
```

提交并 push 到 `main` 即可触发自动部署。

## AI 接手项目

请先读 `AGENTS.md`，再读 `PROJECT_DIARY.md` 的"当前状态"和最近 3 条详细条目，再开始动手。

## License

MIT
