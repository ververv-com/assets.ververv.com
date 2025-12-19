# Landing Page 实施方案

**计划ID**: #P1

## 项目概述

为 Ververv Apps 静态资源站点实现可配置的 Landing Page 功能，支持自动部署到 GitHub Pages。

**核心特性**：
- 「二合一」页面：营销落地页 + 技术支持页（通过 `#support` 锚点区分）
- 可配置化：通过扩展 `apps.json` 配置
- 自动部署：复用现有 GitHub Pages 工作流

---

## 数据结构设计

### TypeScript 接口

```typescript
interface Feature {
    title: string;           // 功能标题
    description: string;     // 功能描述
    image: string;           // 图片路径，相对于 /assets/
}

interface FAQ {
    question: string;
    answer: string;
}

interface HomepageConfig {
    slogan: string;                    // 主标语
    sub_slogan: string;                // 副标语
    app_icon: string;                  // App 图标路径
    app_store_url: string;             // App Store 链接
    features: Feature[];               // 功能亮点（建议3个）
    faqs: FAQ[];                       // FAQ 列表
    support_email_subject?: string;    // 邮件标题（可选）
    support_email_body?: string;       // 邮件正文模板（可选）
    theme_color?: string;              // 主题色（默认 #007AFF）
}

// 扩展 AppConfig
interface AppConfig {
    // ... 现有字段
    homepage?: HomepageConfig;         // 新增
}
```

---

## 文件清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `templates/homepage.ejs` | Landing Page 模板（含完整 CSS） |
| `static/common/app-store-badge.svg` | App Store 下载按钮 |
| `static/photocleaner/icon.png` | App 图标 |
| `static/photocleaner/feature-*.png` | 功能截图（3张） |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `scripts/build.ts` | 扩展接口 + 添加 homepage 支持 + index.html 输出 |
| `data/apps.json` | 添加 homepage 配置 |

---

## 构建脚本修改

### 关键改动

1. **PAGE_TEMPLATES 添加映射**：
```typescript
const PAGE_TEMPLATES = {
    privacy: 'privacy.ejs',
    terms: 'terms.ejs',
    homepage: 'homepage.ejs'  // 新增
};
```

2. **homepage 特殊输出为 index.html**：
```typescript
const outputFileName = pageType === 'homepage' ? 'index.html' : `${pageType}.html`;
```

---

## 模板结构 (homepage.ejs)

4 个模块：

1. **Hero Section** - 图标 + 名称 + Slogan + App Store 按钮
2. **Key Features** - 遍历 `homepage.features` 数组
3. **Support Center** (`id="support"`) - FAQ 折叠 + Contact 按钮
4. **Footer** - 版权 + Privacy Policy 链接

**技术要点**：
- CSS 变量支持主题色配置
- Mobile First 响应式设计
- FAQ 使用原生 `<details>/<summary>` 无需 JS
- `scroll-behavior: smooth` 支持锚点平滑滚动

---

## 静态资源结构

```
static/
├── common/
│   └── app-store-badge.svg
└── photocleaner/
    ├── icon.png
    ├── feature-cleanup.png
    ├── feature-ai-album.png
    └── feature-privacy.png
```

构建后输出到 `dist/assets/`

**用户确认**：
- 图片资源：先用 SVG 占位图，后续替换真实截图
- App Store 链接：先用 `#` 占位，App 上架后替换

---

## 实施步骤

### 步骤 1：扩展构建脚本

修改 `scripts/build.ts`：
- 添加 Feature, FAQ, HomepageConfig 接口
- 扩展 AppConfig 接口
- 添加 homepage 到 PAGE_TEMPLATES
- 处理 homepage → index.html 输出

### 步骤 2：创建模板

创建 `templates/homepage.ejs`：
- 完整的 HTML 结构
- iOS 风格内联 CSS
- 4 个核心模块
- 响应式设计

### 步骤 3：更新配置

修改 `data/apps.json`：
- 添加 `"homepage"` 到 pages 数组
- 添加完整的 homepage 配置对象

### 步骤 4：准备静态资源

- 创建 `static/common/` 目录
- 添加 App Store Badge SVG
- 创建 `static/photocleaner/` 目录
- 添加占位图（后续替换为真实截图）

### 步骤 5：本地测试

```bash
pnpm build
```

验证：
- `dist/photocleaner/index.html` 生成
- 访问 `/photocleaner/` 显示 Hero
- 访问 `/photocleaner/#support` 跳转到 FAQ
- mailto 链接正常

### 步骤 6：提交部署

```bash
git add .
git commit -m "feat(homepage): 添加可配置的 Landing Page"
git push
```

GitHub Actions 自动部署到 s.ververv.com

---

## 测试计划

| 测试项 | 验证方法 |
|--------|----------|
| 构建成功 | `pnpm build` 无报错 |
| 文件输出 | `dist/photocleaner/index.html` 存在 |
| 锚点跳转 | `#support` 滚动到 FAQ |
| mailto | 唤起邮件客户端并预填信息 |
| 响应式 | 375px/768px/1200px 布局正常 |

---

## Critical Files

- `scripts/build.ts` - 构建逻辑
- `data/apps.json` - 配置数据
- `templates/homepage.ejs` - 待创建的模板
- `change/homepage/proposal.md` - 需求文档
