# Landing Page 实施方案

**计划ID**: #P1

## 项目概述

为 Ververv Apps 静态资源站点实现可配置的 Landing Page 功能，支持自动部署到 GitHub Pages。

**核心特性**：
- 「二合一」页面：营销落地页 + 技术支持页（通过 `#support` 锚点区分）
- 可配置化：通过扩展 `apps.json` 配置
- Clean URLs：无 `.html` 后缀
- 自动部署：复用现有 GitHub Pages 工作流

---

## URL 结构（Clean URLs）

采用目录结构法实现无后缀访问：

| 页面 | 输出路径 | 访问 URL |
|------|----------|----------|
| Landing Page | `/{key}/home/index.html` | `/{key}/home/` |
| Support | - | `/{key}/home/#support` |
| Privacy | `/{key}/privacy/index.html` | `/{key}/privacy/` |
| Terms | `/{key}/terms/index.html` | `/{key}/terms/` |

**根目录重定向**：`/{key}/` 自动跳转到 `/{key}/home/`

---

## 数据结构设计

### TypeScript 接口

```typescript
interface Feature {
    title: string;
    description: string;
    image: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface HomepageConfig {
    slogan: string;
    sub_slogan: string;
    app_icon: string;
    app_store_url: string;
    features: Feature[];
    faqs: FAQ[];
    support_email_subject?: string;
    support_email_body?: string;
    theme_color?: string;
    company_name?: string;
    company_url?: string;
}

interface AppConfig {
    // ... 现有字段
    homepage?: HomepageConfig;
}
```

---

## 构建输出结构

```
dist/
├── index.html                    # 站点首页
├── assets/
│   ├── common/
│   │   └── app-store-badge.svg
│   └── photocleaner/
│       ├── icon.svg
│       └── feature-*.svg
└── photocleaner/
    ├── index.html                # 重定向到 home/
    ├── home/
    │   └── index.html            # Landing Page
    ├── privacy/
    │   └── index.html            # Privacy Policy
    └── config.json
```

---

## 模板内部链接

由于页面在子目录中，相对路径需要调整：

| 模板 | 资源路径 | 链接路径 |
|------|----------|----------|
| homepage.ejs | `../../assets/` | `../privacy/` |
| privacy.ejs | `../../assets/` | `../home/` |

---

## 构建脚本修改

### 核心逻辑

```typescript
// 1. 页面输出到子目录
const outputDir = pageType === 'homepage' ? 'home' : pageType;
const pageDir = path.join(appDir, outputDir);
await fs.ensureDir(pageDir);
await fs.writeFile(path.join(pageDir, 'index.html'), html);

// 2. 生成根目录重定向
const redirectHtml = `<!DOCTYPE html>
<html><head>
<meta http-equiv="refresh" content="0;url=home/">
</head></html>`;
await fs.writeFile(path.join(appDir, 'index.html'), redirectHtml);
```

---

## 测试计划

| 测试项 | 验证方法 |
|--------|----------|
| 构建成功 | `pnpm build` 无报错 |
| 目录结构 | `dist/photocleaner/home/index.html` 存在 |
| Clean URL | 访问 `/photocleaner/home/` 正常显示 |
| 重定向 | 访问 `/photocleaner/` 跳转到 `/photocleaner/home/` |
| 锚点跳转 | `/photocleaner/home/#support` 滚动到 FAQ |
| 资源加载 | 图片和静态资源正常显示 |

---

## Critical Files

- `scripts/build.ts` - 构建逻辑
- `data/apps.json` - 配置数据
- `templates/homepage.ejs` - Landing Page 模板
- `templates/privacy.ejs` - Privacy Policy 模板
- `templates/index.ejs` - 站点首页模板
