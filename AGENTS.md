# AGENTS.md — 给所有 AI 代理的操作指引

> 本文件描述**如何操作本项目**。项目**当前状态**与历史见 `PROJECT_DIARY.md`。
> 任何 AI 在动手前必须读完 `PROJECT_DIARY.md` 的"当前状态"与最近 3 条详细条目。

## 1. 项目概况

- 仓库：https://github.com/always1ov/always1ov
- 类型：个人博客（Valaxy 静态站点）
- 部署目标：Cloudflare Pages
- 部署触发：`push` 到 `main` 或 `pull_request` 触发 `.github/workflows/deploy.yml`

## 2. 必备环境

| 工具 | 版本 | 备注 |
|---|---|---|
| Node | ≥ 22.12 | valaxy 1.0.0-rc.1 强制要求 ≥22.12；本机实测 v20.20.2 不满足，故本地不跑 build，靠 CI |
| pnpm | ≥ 9 | 通过 corepack 或 `npm i -g pnpm@9` 安装；若 pnpm 安装/解析失败可临时回落 npm |
| npm | ≥ 10 | 自带 Node；本项目 scripts 同时兼容 pnpm 与 npm |
| git | 任意 | |
| gh | 最新 | 需要 `repo` + `workflow` scope 的 PAT |

## 3. 常用命令

```bash
# 推荐（pnpm）
pnpm install
pnpm dev                # http://localhost:4859
pnpm build              # 产物在 ./dist

# npm 回落（若 pnpm 在当前网络下解析 DNS 失败）
npm install
npm run dev
npm run build

# 公共
npx valaxy rss          # 单独生成 RSS
npx tsc --noEmit        # 类型检查
```

部署不通过 CLI 触发，全靠 GitHub Actions。

## 4. 改动后必须做的事

每次任何文件被改动：

1. **更新 `PROJECT_DIARY.md`**：
   - 如果是普通小修，更新"当前状态"段
   - 如果是一个里程碑（新增模块、改部署、删/加依赖、关键 bug 修复），**追加一条**到"详细条目（Append-only Log）"，并**记录到"决策日志"** 如果做了技术决策
   - 不要删除旧条目（日记是 append-only）
2. **commit message 规范**：`type(scope): subject`，例如 `feat(posts): add first article`；如果是改日记用 `diary: update`
3. **不要把任何 secret 写进仓库**：
   - 凭据只在 GitHub Repo Secrets 里：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`
   - 变量在 Repo Variables 里：`CLOUDFLARE_PROJECT_NAME`
   - 任何 `.env`、`.dev.vars`、`.wrangler/` 都在 .gitignore 里

## 5. 文件地图

| 改这个 → | 动哪个文件 |
|---|---|
| 站点标题/作者/社交/搜索 | `site.config.ts` |
| 主题、菜单、页脚、备案 | `valaxy.config.ts` |
| 首页 | `pages/index.md` |
| 关于页 | `pages/about.md` |
| 新文章 | `pages/posts/<slug>.md` |
| 静态资源（图片、favicon） | `public/` |
| 部署流程 | `.github/workflows/deploy.yml` |
| 项目当前状态/历史 | `PROJECT_DIARY.md` |
| 给 AI 的操作指引（本文件） | `AGENTS.md` |

## 6. 部署链路（运维速查）

- push main → 跑 `pnpm install` → `pnpm build` → `wrangler pages deploy ./dist --project-name=$CLOUDFLARE_PROJECT_NAME`
- 部署日志：仓库 Actions 标签页
- 线上：https://always1ov.pages.dev（首次需要在 CF Dashboard 创建同名 Pages 项目并绑仓库）

## 7. 接手检查清单（AI 第一次接手时按此顺序执行）

- [ ] 读 `PROJECT_DIARY.md` "当前状态" + 最近 3 条详细条目
- [ ] 读本文件
- [ ] 跑 `pnpm install`
- [ ] 跑 `pnpm build` 验证当前 main 是可构建的
- [ ] 浏览 `./dist/` 看产物结构是否合理
- [ ] 确认手上的任务和日记里的"进行中的任务"对得上
- [ ] 开工；每改一文件 → 更新日记

## 8. 边界 / 不要做的事

- ❌ 不要把 PAT / token / `.env` 内容 commit 进来
- ❌ 不要删旧日记条目
- ❌ 不要绕过 GitHub Actions 手动 `wrangler deploy`（除非紧急热修，且事后回写日记）
- ❌ 不要 `pnpm` 之外用 `npm`/`yarn` 装依赖（lockfile 会乱）
- ❌ 不要新增与博客无关的大功能（评论、统计、看板娘等），需要先和用户确认
