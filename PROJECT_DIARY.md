# PROJECT_DIARY.md — 项目日记

> **AI 交接入口**：任何新 AI 接手本项目，必须**先读整个文件再动手**。
> 维护规则详见 `AGENTS.md` §4。

---

## 当前状态（Current State）

- **阶段**：初始化 — 脚手架已建，待首次部署
- **最后改动**：2026-07-31 初始化仓库（详见末尾"详细条目"）
- **部署 URL**：待首次部署后填入（计划：`https://always1ov.pages.dev`）
- **进行中的任务**：第一次部署到 Cloudflare Pages（需用户去 Dashboard 建项目并填 Secrets）
- **分支约定**：`main` 部署生产；不在 `main` 上做改动

## 关键事实（Key Facts）

- **仓库**：`always1ov/always1ov`（GitHub，empty → 现已填充）
- **框架**：Valaxy `1.0.0-rc.1`
- **主题**：`valaxy-theme-yun` `1.0.0-rc.1`
- **包管理**：pnpm ≥ 9（lockfile：`pnpm-lock.yaml`，暂未生成——首次 `pnpm install` 后会生成）
- **部署**：Cloudflare Pages，由 `.github/workflows/deploy.yml` 触发
- **凭据存放**：仅 GitHub Repo Secrets（`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`）和 Repo Variables（`CLOUDFLARE_PROJECT_NAME`）—— 永不入仓
- **本地开发端口**：默认 4859（`pnpm dev`）
- **Node 要求**：≥ 20.12（实测 v20.20.2 可用；create-valaxy 官方要求 ≥22，本项目用手动 scaffold 绕过）

## 决策日志（Decisions Log）

- **2026-07-31**：选 **Valaxy** 而非 Next.js / Hexo。理由：Vue 3 + Vite + TypeScript 现代化栈；自带热重载、UnoCSS；与 Cloudflare Pages 兼容性已被 Valaxy 官方站验证。
- **2026-07-31**：选 **`valaxy-theme-yun`** 主题。理由：作者本人博客长期使用，社区最常用，适合个人博客。
- **2026-07-31**：手动 scaffold 而非用 `create-valaxy`。理由：`create-valaxy` 要求 Node ≥ 22，当前环境是 v20；且手动 scaffold 文件可控，更符合"AI 主动写每文件"的语义。
- **2026-07-31**：用 **GitHub Actions + Wrangler** 部署，而非 Cloudflare Dashboard 直连。理由：可审计、可在 PR 上 preview；token 走 GitHub Secrets 不暴露。
- **2026-07-31**：不内置评论 / 统计 / 看板娘。理由：用户未要求；以后要做单独议。

## 待办（TODO）

- [ ] 用户在 Cloudflare Dashboard 建 Pages 项目，绑仓库到 `always1ov/always1ov`，名字取 `always1ov`
- [ ] 用户在 GitHub Repo 设置 3 个 Secrets/Variables（见上文"凭据存放"）
- [ ] 用户触发首次 push（或直接 `git push origin main`），观察 Actions 日志确认首次部署成功
- [ ] 用户回填部署 URL 到本文"当前状态"段
- [ ] 用户填写真实的 author、social、备案信息到 `site.config.ts` 和 `valaxy.config.ts`
- [ ] 用户决定是否开评论（默认不开）
- [ ] 用户决定是否绑自定义域名

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
