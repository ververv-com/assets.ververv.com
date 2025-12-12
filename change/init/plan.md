# Ververv Assets Manager 实现方案

基于 **TypeScript** 的工程化交付方案，支持 Cloudflare Pages 自动部署。

---

## 项目概览

- **目标**: 统一管理多 App 的静态资源（协议、配置、图片）
- **域名**: `assets.ververv.com`
- **技术栈**: TypeScript + Node.js + EJS + Cloudflare Pages
- **当前应用**: Photo Cleaner

---

## 目录结构

```text
/assets.ververv.com
├── /data
│   └── apps.json           # App 配置（含第三方服务）
├── /templates
│   ├── privacy.ejs         # 隐私协议模版
│   └── index.ejs           # 首页模版
├── /scripts
│   └── build.ts            # 构建脚本
├── /dist                   # 构建输出（gitignore）
│   ├── index.html          # 首页
│   └── /photocleaner
│       ├── privacy.html    # 隐私协议页面
│       └── config.json     # App 配置
├── /src
│   └── index.ts            # 原有入口文件
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## 数据结构

### `data/apps.json`

```json
[
  {
    "key": "photocleaner",
    "name": "Photo Cleaner",
    "email": "support@photocleaner.ververv.com",
    "updated_date": "December 12, 2025",
    "has_iap": true,
    "third_party_services": [
      {
        "name": "One Signal",
        "url": "https://onesignal.com/privacy_policy"
      }
    ],
    "pages": ["privacy"]
  }
]
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | App 标识，用于 URL 路径 |
| name | string | App 显示名称 |
| email | string | 联系邮箱 |
| updated_date | string | 协议更新日期 |
| has_iap | boolean | 是否有内购 |
| third_party_services | array | 第三方服务列表 |
| pages | array | 需要生成的页面类型 |

**扩展示例**（添加新 App）：

```json
{
  "key": "videocleaner",
  "name": "Video Cleaner",
  "email": "support@videocleaner.ververv.com",
  "updated_date": "December 12, 2025",
  "has_iap": false,
  "third_party_services": [
    { "name": "One Signal", "url": "https://onesignal.com/privacy_policy" },
    { "name": "AdMob", "url": "https://policies.google.com/privacy" }
  ],
  "pages": ["privacy", "terms"]
}
```

---

## 模版文件

### `templates/privacy.ejs`

隐私协议模版，动态渲染第三方服务：

```html
<% if (third_party_services && third_party_services.length > 0) { %>
<p>Link to privacy policy of third party service providers:</p>
<ul>
    <% third_party_services.forEach(service => { %>
    <li>
      <% if (service.url) { %>
        <a href="<%= service.url %>" target="_blank"><%= service.name %></a>
      <% } else { %>
        <%= service.name %>
      <% } %>
    </li>
    <% }); %>
</ul>
<% } %>
```

### `templates/index.ejs`

首页索引模版：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ververv Apps</title>
    <style>
        body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; }
        h1 { color: #111; }
        .app { margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .app h3 { margin: 0 0 8px; }
        .app a { color: #2563eb; margin-right: 12px; }
    </style>
</head>
<body>
    <h1>Ververv Apps</h1>
    <% apps.forEach(app => { %>
    <div class="app">
        <h3><%= app.name %></h3>
        <% if (app.pages.includes('privacy')) { %>
        <a href="/<%= app.key %>/privacy.html">Privacy Policy</a>
        <% } %>
        <% if (app.pages.includes('terms')) { %>
        <a href="/<%= app.key %>/terms.html">Terms of Service</a>
        <% } %>
    </div>
    <% }); %>
</body>
</html>
```

---

## 构建脚本

### `scripts/build.ts`

功能：
1. 清理旧构建目录
2. 复制静态资源（如有）
3. 读取 apps.json 配置
4. 为每个 App 生成配置的页面
5. 生成首页 index.html

---

## 依赖配置

### `package.json`

```json
{
  "name": "ververv-assets",
  "version": "1.0.0",
  "description": "Ververv Apps 静态资源管理器",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "ts-node scripts/build.ts"
  },
  "devDependencies": {
    "@types/ejs": "^3.1.5",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^24.6.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "ejs": "^3.1.9",
    "fs-extra": "^11.1.1"
  }
}
```

---

## 使用命令

```bash
# 安装依赖
pnpm install

# 构建静态资源
pnpm run build
```

---

## Cloudflare Pages 部署

### Dashboard 配置

| 配置项 | 值 |
|--------|-----|
| Framework preset | None |
| Build command | `pnpm install && pnpm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | 18 |

### 自动部署流程

```
GitHub Push → Cloudflare Pages 触发 → pnpm install → pnpm build → 部署 dist/
```

**触发条件**：
- 推送到 main 分支 → 生产环境
- 推送到其他分支 → 预览环境

### 绑定域名

在 Cloudflare Pages > Custom Domains 中添加 `assets.ververv.com`

---

## 验证地址

部署完成后访问：

| 页面 | URL |
|------|-----|
| 首页 | `https://assets.ververv.com/` |
| Photo Cleaner 隐私协议 | `https://assets.ververv.com/photocleaner/privacy.html` |
| Photo Cleaner 配置 | `https://assets.ververv.com/photocleaner/config.json` |

**检查点**：
- 首页显示所有 App 列表
- 隐私协议显示 "Effective Date: December 12, 2025"
- 联系邮箱为 support@photocleaner.ververv.com
- 第三方服务显示 One Signal 并带链接

---

## 实施任务

- [ ] 更新 `data/apps.json`（添加 third_party_services、pages 字段）
- [ ] 修改 `templates/privacy.ejs`（动态渲染第三方服务）
- [ ] 新增 `templates/index.ejs`（首页模版）
- [ ] 修改 `scripts/build.ts`（支持多页面、生成首页）
- [ ] 运行构建测试
- [ ] 提交代码到 GitHub
- [ ] 配置 Cloudflare Pages 自动部署
