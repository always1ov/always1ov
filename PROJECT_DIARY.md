# PROJECT_DIARY.md — 项目日记

> **AI 交接入口**：任何新 AI 接手本项目，必须**先读整个文件再动手**。
> 维护规则详见 `AGENTS.md` §7。

---

## 当前状态（Current State）

- **阶段**：站点重做完成，等待首次部署
- **最后改动**：2026-08-21 全站重做 + 修好社交卡片元信息
- **CI 状态**：build job 全绿（run #6）；deploy job 停在凭据检查上，等用户配 Cloudflare
- **部署 URL**：待首次部署后确认（计划 `https://always1ov.pages.dev`）
- **进行中的任务**：用户在 Cloudflare 建 Pages 项目并配好 3 个 Secrets/Variables，触发首次部署
- **分支约定**：`main` 即生产分支

## 关键事实（Key Facts）

- **仓库**：`always1ov/always1ov`（同时也是 GitHub 个人主页 README 仓库）
- **框架**：Valaxy `1.0.0-rc.1`
- **主题**：`valaxy-theme-always` —— **自写，源码在本仓库 `theme/`**，通过 `theme: './theme'` 以本地路径加载，不发包、不装依赖
- **运行时依赖**：只有 `valaxy` 一个
- **部署**：Cloudflare Pages，由 `.github/workflows/deploy.yml` 触发
- **凭据存放**：仅 GitHub Repo Secrets（`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`）和 Repo Variables（`CLOUDFLARE_PROJECT_NAME`）—— 永不入仓
- **本地端口**：4859（`npm run dev`）
- **Node 要求**：≥ 22.12（Valaxy 硬要求）
- **设计约束**：两种颜色、三种字体、系统中文字体。详见 `AGENTS.md` §5

## 决策日志（Decisions Log）

- **2026-07-31**：选 **Valaxy** 而非 Next.js / Hexo。理由：Vue 3 + Vite + TypeScript 现代化栈；自带热重载、UnoCSS；与 Cloudflare Pages 兼容性已被 Valaxy 官方站验证。
- **2026-07-31**：选 **`valaxy-theme-yun`** 主题。理由：作者本人博客长期使用，社区最常用，适合个人博客。
- **2026-07-31**：手动 scaffold 而非用 `create-valaxy`。理由：`create-valaxy` 要求 Node ≥ 22，当前环境是 v20；且手动 scaffold 文件可控，更符合"AI 主动写每文件"的语义。
- **2026-07-31**：用 **GitHub Actions + Wrangler** 部署，而非 Cloudflare Dashboard 直连。理由：可审计、可在 PR 上 preview；token 走 GitHub Secrets 不暴露。
- **2026-07-31**：不内置评论 / 统计 / 看板娘。理由：用户未要求；以后要做单独议。

- **2026-08-21**：**不用现成主题，自己写一个** `valaxy-theme-always`。理由：用户要的是「一眼看出是我的」的站，而不是「一眼看出用了什么主题」的站。改现成主题要跟它的层层继承打架，写一个反而更省事、更可控。
- **2026-08-21**：主题以**本地路径**加载（`theme: './theme'`），不发 npm 包。理由：Valaxy 的 `getThemeRoot()` 对以 `.` 开头的名字按路径解析。主题住在博客仓库里，改主题和改文章是同一次 commit，不用在两个仓库之间来回切。
- **2026-08-21**：**中文不加载网络字体**，只给拉丁字母引入 Instrument Serif / Instrument Sans / JetBrains Mono。理由：一套中文字体 3~8 MB，为了好看让所有人多等两秒不划算；系统里的苹方、鸿蒙、微软雅黑都够好。
- **2026-08-21**：**自定义 Shiki 双主题**（`always-day` / `always-night`），只用主色和三档灰。理由：彩虹配色会让眼睛在代码里乱跳；读代码时真正要一眼看出的只有注释、字符串、关键字三件事。
- **2026-08-21**：**入场动画只在 `.js` 存在时生效**。理由：`[data-reveal]` 默认 `opacity: 0`，一旦脚本挂掉整页内容会不可见——内容站点不能有这种失败模式。
- **2026-08-21**：**弃用之前尝试的「零依赖手写生成器」方案**。理由：用户明确要求用 Valaxy。设计系统（配色、排版、流场画布、命令面板）已整体移植到 Valaxy 主题里，没有浪费。

## 待办（TODO）

- [ ] 用户在 Cloudflare Dashboard 建 Pages 项目（名字建议 `always1ov`）
- [ ] 用户在 GitHub Repo 配好 3 个 Secrets/Variables（见「关键事实」）
- [ ] 触发一次 push，看 Actions 日志确认首次部署成功
- [ ] 部署成功后把真实 URL 回填到「当前状态」
- [ ] 用户**按自己的实际情况改这几处文案**：`pages/about.md`（关于我）、`pages/index.md`（首页自述）、`valaxy.config.ts` 里的 `now`（此刻在做/在读/在想）
- [ ] 用户决定是否绑自定义域名
- [ ] 若在中国大陆备案，把备案号填进 `valaxy.config.ts` 的 `themeConfig.footer.beian`

## 详细条目（Append-only Log）

### 2026-07-31 00:48 — 初始化仓库
- 克隆空的 `always1ov/always1ov` 到本地
- 创建 `.gitignore`、`tsconfig.json`、`package.json`（Valaxy 1.0.0-rc.1 + valaxy-theme-yun 1.0.0-rc.1 + wrangler 4.116.0）
- 创建 `valaxy.config.ts`、`site.config.ts`（最小可运行版）
- 创建 `pages/index.md`、`pages/about.md`、`pages/404.md`、`pages/posts/hello-world.md`
- 创建 `README.md`、`AGENTS.md`、`PROJECT_DIARY.md`（本文）
- 创建 `.github/workflows/deploy.yml`
- **遗留**：未跑 `pnpm install`，未跑 `pnpm build`，未 commit，未 push

### 2026-07-31 01:00 — 环境适配
- 本机 Node v20.20.2、pnpm 9.15.9（手动装到 /tmp/pnpm-bin，因 /home 全局只读）
- create-valaxy 要求 Node ≥ 22，本机不满足 → 改为手动 scaffold 全部文件
- `pnpm install` 与 `npm install` 在本机多次出现 EAI_AGAIN（registry.npmjs.org / registry.npmmirror.com 的 DNS 解析对小批量请求通过、对安装器的高并发解析失败）。`curl` 单请求始终 200。
- **决定**：本机不验证 build，依赖 GitHub Actions 做构建验证（CI 网络更稳）。后续如果 CI 也失败，再排查 valaxy 与 Node 20 的兼容性。
- `packageManager` 字段从 `[email protected]` 删除，避免本机强约束。AGENTS.md 已补充 pnpm/npm 双轨命令。

### 2026-07-31 01:05 — 部署 workflow 调整
- 原 deploy.yml 用 `pnpm install --frozen-lockfile`，因没 lockfile 会挂；改为 `pnpm install --no-frozen-lockfile`，并加 npm 回落分支（pnpm-setup 失败时用 npm）。
- 拆成 `build` 和 `deploy` 两个 job，build 始终跑，deploy 只在 push main 时跑。
- 改用 `wrangler pages deploy` 直推 `./dist` 到已存在的 Pages 项目（首次需用户手动建项目）。
- **遗留**：未本地验证 build、未 commit、未 push。

### 2026-07-31 01:15 — 修正 Node 版本约束
- 复查 valaxy 1.0.0-rc.1 的 `engines.node >=22.12.0` 是硬要求。
- `package.json` `engines` 改为 `>=22.12.0`，CI `node-version` 从 20 改为 22。
- **遗留**：本机 Node v20.20.2 不满足；本地无法跑 build（与 DNS 解析问题叠加放弃），CI（Ubuntu + Node 22）会做实际验证。

### 2026-07-31 01:25 — 首次提交并推送
- `git add . && git commit` → commit `7197724 feat: initial valaxy blog scaffold`
- `git push -u origin main` 成功（远端 `main` 分支由空创建）
- 远端仓库 https://github.com/always1ov/always1ov 已可见所有 13 个文件
- 待办：README 里"Node ≥ 20.12"文案同步修正为 22.12

### 2026-07-31 01:28 — README 版本修正
- README.md "本地开发" 一段把 Node 最低版本从 20.12 改为 22.12（valaxy 硬要求）
- 未 commit，等下一步打包提交

### 2026-07-31 01:35 — CI 验证通过（关键里程碑）
- 第三次 push 触发 Actions run #30570247575
- **build job 全部 ✓**：Setup pnpm / Setup Node(v22) / `pnpm install` / `npm run build` / dist 验证 / Upload artifact
- deploy job 失败，原因 `CLOUDFLARE_PROJECT_NAME` 变量未配置（预期内，需用户操作）
- 结论：本项目的 Valaxy 配置在 Node 22 上可正常构建，静态产物已能生成
- 下一步：等用户在 CF Dashboard 建 Pages 项目 + 在 GitHub Repo 填 3 个 Secrets/Variables，再触发一次 push 即可上线

### 2026-08-21 — 全站重做（里程碑）

**起因**：用户认为原来的站「上不了台面」，要求重做，设计自定；后续明确要求框架继续用 Valaxy。

**做了什么**

- 删掉 `valaxy-theme-yun`，新建 `theme/` —— 一个完整的自写 Valaxy 主题 `valaxy-theme-always`
  - `theme/valaxy.config.ts`：主题默认配置 + 暗色策略（默认夜间）
  - `theme/types/index.ts`：主题配置的 TypeScript 类型，让根目录配置有补全和检查
  - `theme/index.html`：合进 `<head>` 的启动脚本，首帧就把 `.dark` 和 `.js` 打上去，杜绝闪白
  - `theme/styles/`：整套设计系统（tokens / reset / base / layout / components / markdown / shiki / pages）
  - `theme/layouts/`：home、post、archives、tags、default、404
  - `theme/components/`：TheHeader、TheFooter、TheShell、TheToc、HeroLine、PostRow、CommandPalette、ThemeToggle、ReadingProgress、SectionLabel、ArrowRight
  - `theme/composables/`：主题配置的类型化封装、天数、入场观察器、日期与阅读时长
- 首屏画布 `HeroLine.vue`：噪声流场，随机种子取当天日期——同一天来的人看到同一张图，可点「重画」
- 命令面板 `CommandPalette.vue`：⌘K / Ctrl+K / `/` 打开，子序列模糊匹配站内文章与导航，不引搜索库、不发请求
- `valaxy.config.ts` 里定义了两套 Shiki 主题，代码块只用主色和三档灰
- 内容：重写 `pages/about.md`，新增/调整三篇文章（`why-personal-site` / `valaxy-custom-theme` / `design-notes`）
- 工程：`.github/workflows/deploy.yml` 拆成 build + deploy 两个 job，构建后校验 `index.html` / `404.html` / `atom.xml` 三个产物；`public/_headers` 配好缓存与安全头
- README：改成 GitHub 个人主页用的版本，配 `scripts/banner.mjs` 生成的双主题横幅

**过程中修掉的实际问题**

1. 首屏流场原来噪声尺度错了——一步跨过一整个噪声格，笔画缠成疙瘩。改成步长远小于噪声格，线条才「流」起来。
2. `[data-reveal]` 默认 `opacity: 0`，脚本一挂整页空白。改成 `.js [data-reveal]` 才隐藏。
3. `.btn` 撞上 Valaxy 内置的 UnoCSS 快捷类，按钮被刷成蓝色。主题内改名 `.action`。
4. Valaxy 的全局 reset 把所有 `a` 刷成 `--va-c-link` 并加粗，用 `body a` 提高优先级压回去。
5. 正文原来是自己写的 `<div class="markdown-body">`，导致代码复制按钮、表格滚动容器、目录全部失效——改用 `<ValaxyMd>` 包裹。
6. `TheToc` 在 `<ClientOnly>` 里，挂载晚于 `ValaxyMd`，错过了那次 `runContentUpdated()`，目录永远是空的。让它自己补调一次。
7. 跟「今天」有关的值（已持续天数、年份、流场种子）在 SSR 和客户端会算出不同结果，触发 hydration mismatch。放进 `<ClientOnly>`。
8. `theme/index.html` 的注释里写了 `<head>` 字样，被 Valaxy 的 `<head>` 提取正则当成真标签，把半句注释渲染到了页面上。
9. 归档页 `pages/posts/index.md` 被 Valaxy 从 git 补上了 `date`，于是把自己也列进了文章列表。加 `hide: all`。
10. 窄屏顶栏被挤成两行、巨型字标从词中间断行、页面标题末尾那个斜体「。」看着像打错的字母 o —— 逐个修掉。

**验证**：`npm ci` 干净安装后 `npm run build` 通过；用 Chromium 逐页截图核对了首页 / 文章 / 归档 / 关于 / 404 / 命令面板，以及夜间、日间和 390px 移动端三种情况；控制台无报错、无 hydration mismatch。

**遗留**：见「待办」。核心是用户需要按自己的实际情况改文案，并完成 Cloudflare 侧的配置。

### 2026-08-21 — 修好社交分享卡片

Valaxy 默认把 `og:image` 指向 `/favicon.svg`（相对路径 + SVG，各家平台都不认），
`og:url` 则固定成站点根地址，导致每篇文章分享出去都指向首页。

- `theme/App.vue` 里覆盖 `og:url` / `og:image` / `twitter:image` / `canonical`，全部用绝对地址
- `theme/layouts/post.vue` 补 `og:type: article`
- `scripts/banner.mjs` 改名 `scripts/artwork.mjs`，除 README 横幅外还生成 `public/og.png`
  （1200×630，手写 PNG 编码 + `node:zlib`，画的是同一片流场）
- 顺带修完 `vue-tsc` 的 26 个类型错误，现在 `npm run typecheck` 是干净的

**CI**：run #6 的 build job 全部通过（安装 / 构建 / 产物校验 / 上传，共 28 秒）。
deploy job 停在凭据检查上并给出明确报错——符合预期，等用户配好 Cloudflare 那三个值。
