# GitHub Pages 部署指南

基于 GitHub Actions 的自动化部署方案。

---

## 部署架构

```
GitHub Push (main)
    → GitHub Actions 触发
    → pnpm install
    → pnpm build
    → 部署 dist/ 到 GitHub Pages
```

---

## 实施步骤

### 创建 GitHub Actions 配置

新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # 支持手动触发

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 修改构建脚本

在 `scripts/build.ts` 中添加 CNAME 生成：

```typescript
// 6. 生成 CNAME 文件（GitHub Pages 自定义域名）
const customDomain = 's.ververv.com';
await fs.writeFile(path.join(PATHS.dist, 'CNAME'), customDomain);
console.log(`✓ CNAME 文件已生成: ${customDomain}`);
```

### 确保 pnpm-lock.yaml 被提交

从 `.gitignore` 中移除 `pnpm-lock.yaml`，GitHub Actions 需要该文件进行依赖缓存。

---

## GitHub 仓库配置

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择：`GitHub Actions`
3. **Custom domain** 填写：`s.ververv.com`
4. 点击 **Save**

---

## DNS 配置

在域名管理面板（Cloudflare 等）添加记录：

| 类型 | 名称 | 目标 |
|------|------|------|
| CNAME | s | ververv-com.github.io |

**注意**：如使用 Cloudflare，代理状态建议选择「仅 DNS」（灰色云朵）

---

## 验证部署

### 检查 GitHub Actions

1. 进入仓库 → **Actions** 标签页
2. 查看 `Deploy to GitHub Pages` workflow 运行状态
3. 绿色表示部署成功

### 访问站点

| 页面 | URL |
|------|-----|
| 首页 | https://s.ververv.com/ |
| Photo Cleaner 隐私协议 | https://s.ververv.com/photocleaner/privacy.html |
| Photo Cleaner 配置 | https://s.ververv.com/photocleaner/config.json |

---

## 常见问题

### pnpm-lock.yaml not found

**原因**：lock 文件被 `.gitignore` 忽略

**解决**：从 `.gitignore` 移除 `pnpm-lock.yaml` 并提交该文件

### DNS Check in Progress

**原因**：DNS 记录尚未生效

**解决**：等待 DNS 传播（通常几分钟到几小时）

### HTTPS 不可用

**原因**：需要等待 GitHub 自动配置 SSL 证书

**解决**：DNS 验证通过后，GitHub 会自动启用 HTTPS
