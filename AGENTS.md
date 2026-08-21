# AGENTS.md — 给 AI 代理的操作指引

> 本文说明**怎么改这个项目**。项目的**当前状态和历史**在 `PROJECT_DIARY.md`。
> 动手之前先读那份日记的「当前状态」和最近三条详细条目。

## 1. 这是什么

- 仓库：https://github.com/always1ov/always1ov
- 类型：个人网站（Valaxy 静态站点）
- 主题：`valaxy-theme-always`，**自写，就在本仓库的 `theme/` 目录**，不是 npm 依赖
- 线上：https://always1ov.pages.dev
- 部署：Cloudflare Pages。两条路并存 —— Cloudflare 的 Git 集成（推荐，无需密钥），
  或 GitHub Actions + Wrangler（配了 `CLOUDFLARE_PROJECT_NAME` 变量才会跑，否则整个 job 跳过）。
  详见 README「部署到 Cloudflare Pages」。
- Node 版本由 `.node-version` 钉死在 22.12.0，Cloudflare 和 CI 都读它

## 2. 环境

| 工具 | 版本 | 说明 |
|---|---|---|
| Node | ≥ 22.12 | Valaxy 1.0.0-rc.1 的硬要求 |
| npm | ≥ 10 | 用 `npm ci` 保证和 lockfile 一致 |

## 3. 常用命令

```bash
npm install
npm run dev       # http://localhost:4859，改任何文件都会热更新
npm run build     # SSG 构建，产物在 ./dist
npm run typecheck # vue-tsc
npm run banner    # 重新生成 README 横幅（改了配色才需要）
```

## 4. 文件地图

| 想改什么 | 改哪个文件 |
|---|---|
| 站点标题 / 作者 / 描述 / 阅读速度 | `site.config.ts` |
| 导航、此刻、社交、首屏流场参数、页脚 | `valaxy.config.ts` 的 `themeConfig` |
| 代码块配色 | `valaxy.config.ts` 里的 `shikiTheme()` |
| 颜色、字体、字号、间距 | `theme/styles/tokens.scss` |
| 正文排版 | `theme/styles/markdown.scss` |
| 代码块外观 | `theme/styles/shiki.scss` |
| 页面结构 | `theme/layouts/*.vue` |
| 部件（顶栏、页脚、画布、命令面板、目录） | `theme/components/*.vue` |
| 首页「自述」那段文字 | `pages/index.md` 的正文 |
| 关于页 | `pages/about.md` |
| 新文章 | `pages/posts/<slug>.md` |
| 静态资源（图片、favicon、_headers） | `public/` |
| 部署流程 | `.github/workflows/deploy.yml` |

## 5. 这套设计的规矩

改样式之前先读一遍，否则很容易把它改成一个「普通模板」：

1. **只有两种颜色**：墨/纸（随主题反转）加一个朱砂红 `--accent`。想加第三种颜色，先说服自己为什么非加不可。
2. **三种字体各司其职**：标题衬线（`--font-display`）、正文无衬线（`--font-sans`）、元信息等宽（`--font-mono`）。不混用。
3. **中文一律用系统字体**。不要为了好看引入几 MB 的中文网络字体。
4. **留白有层级**：标题上方的空白永远远大于下方。层级靠空白说话，不靠字号。
5. **动效要有理由**：一个动效要么让「这里可以点」变明显，要么什么都别做。所有动效必须听 `prefers-reduced-motion`。
6. **内容优先于脚本**：入场动画由 `.js [data-reveal]` 控制，`.js` 是启动脚本加的。任何时候脚本挂了，内容必须还在页面上。

## 6. 几个容易踩的坑

- **类名会撞 UnoCSS**。Valaxy 内置了 `btn`、`flex-center`、`va-card` 等快捷类。主题里的按钮叫 `.action` 就是因为 `.btn` 被占了。加新类名前先确认没撞上。
- **正文必须用 `<ValaxyMd>` 包**。代码复制按钮、表格滚动容器、目录依赖的 `content-updated` 钩子全挂在它身上。自己写 `<div class="markdown-body">` 会把这些全丢掉。
- **`<ClientOnly>` 里的组件挂载晚于 `ValaxyMd`**，会错过那一次 `runContentUpdated()`。`TheToc` 自己补调了一次，别删。
- **跟「今天」有关的值要放进 `<ClientOnly>`**。构建时和访问时不是同一天，否则 hydration 对不上。
- **Shiki 只加载 `markdown.languages` 里列出来的语言**。没列的语言不会报错，只是不高亮。
- **Valaxy 会从 git 补 `date` 和 `updated`**。不想被当成文章的页面（比如归档页自己）要写 `hide: all`。
- **KaTeX 的样式表是被无条件引入的**（Valaxy 那边只认 `!config.math`）。这个站不写公式，
  所以 `valaxy.config.ts` 里用一个 Vite 插件把它换成空模块，省掉 1.2MB 字体。要写公式就删掉那个插件。

## 7. 改完之后要做的事

1. 跑 `npm run build`，确认能构建。
2. **更新 `PROJECT_DIARY.md`**：小修改「当前状态」；里程碑（加模块、改部署、增删依赖、关键 bug）追加一条到「详细条目」，做了技术决策就记进「决策日志」。日记是 append-only，不要删旧条目。
3. commit 信息用 `type(scope): subject`，例如 `feat(theme): add reading progress`；只改日记用 `diary: update`。

## 8. 不要做的事

- ❌ 不要把 token / `.env` 提交进来
- ❌ 不要删旧日记条目
- ❌ 不要绕过 Actions 手动 `wrangler deploy`（除非紧急热修，事后补记日记）
- ❌ 不要为了省事去装一个现成主题——这个站的全部意义就是主题是自己的
- ❌ 不要新增与「写字」无关的大功能（评论、统计、看板娘），要加先问用户
