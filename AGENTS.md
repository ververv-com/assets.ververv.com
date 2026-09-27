# Repository Guidelines

## Always respond in Chinese-simplified

## 项目概述

本项目通过 EJS 和结构化 App 配置生成静态官网，并由一个 Cloudflare Worker 根据 Host 为多个 App 独立域名提供服务。

## 技术栈

- Node.js 20+
- pnpm 10.25.0
- TypeScript 5.9，ESM、ES2022、严格模式
- `tsx` 执行 TypeScript 构建脚本和测试
- Zod 校验 `data/apps.json`
- EJS 生成静态 HTML
- Cloudflare Workers Static Assets + Wrangler 4
- Node.js 原生 test runner

## 常用命令

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm cf:build
pnpm cf:dev
pnpm typecheck
pnpm test
pnpm check
pnpm format
pnpm format:check
pnpm cf:whoami
pnpm cf:deploy
```

## 项目结构

```text
data/apps.json            App 内容和独立域名配置
static/                   App 专属资源和公共资源
templates/                对外 HTML 模板
scripts/build.ts          构建命令入口
src/build/                静态站点构建模块
src/config/               App schema、读取器和站点注册表
src/worker/               可测试的 Host/路径路由逻辑
worker/index.ts           Cloudflare Worker 入口
tests/                    配置、构建产物和路由契约测试
worker-configuration.d.ts Wrangler 生成的绑定类型
wrangler.jsonc            Worker、Static Assets 和域名配置
```

## 开发规范

- 使用 pnpm，不使用 npm 或 yarn。
- 只在 `main` 分支开发和提交，不直接在 `cloudflare` 分支修改。
- 发布代码时，将同一个 `main` 提交分别推送到远端 `main` 和 `cloudflare`：
  `git push origin main:main main:cloudflare`。
- 所有 TypeScript 必须通过 `pnpm typecheck`。
- 修改 `wrangler.jsonc` 后运行 `pnpm cf:types` 并提交生成的类型。
- App 内容只放在 `data/apps.json`，App 资源只放在 `static/<app-key>/`。
- 公共资源放在 `static/common/`。
- 不要在 Worker 中手工维护域名映射；带 `domain` 的 App 会自动加入 Host 注册表。
- 每个域名只能访问公共资源和自身 App 资源，不得开放整个 `/assets/`。
- 不修改对外内容的重构必须比较重构前后的完整 `dist`，确保文件字节一致。
- 提交前运行 `pnpm check`。

## 部署规范

- 共享 Worker 名称为 `ververv-app-sites`。
- `wrangler.jsonc` 中必须保留已有 Custom Domain。
- `pnpm cf:deploy` 会更新共享生产 Worker，执行前必须获得明确的生产部署确认。
- 生产部署后验证所有已绑定域名、页面、配置、资源隔离和隐藏内部路径。
- 不要通过删除共享 Worker 回滚单个 App。

新增 App 的完整流程见 `doc/add-app-to-cloudflare-worker.md`。
