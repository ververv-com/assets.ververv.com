# Ververv Assets Manager 实现方案

基于 **TypeScript** 的工程化交付方案，支持 GitHub Pages 自动部署。

---

## 项目概览

- **目标**: 统一管理多 App 的静态资源（协议、配置、图片）
- **域名**: `s.ververv.com`
- **技术栈**: TypeScript + Node.js + EJS + GitHub Pages
- **当前应用**: SwipeClean, AloneGuard

---

## URL 结构（Clean URLs）

采用目录结构法实现无后缀的 Clean URLs：

| 页面类型 | 输出路径 | 访问 URL | 说明 |
|----------|----------|----------|------|
| homepage | `/{key}/home/index.html` | `/{key}/home/` | Landing Page |
| privacy | `/{key}/privacy/index.html` | `/{key}/privacy/` | 隐私协议 |
| terms | `/{key}/terms/index.html` | `/{key}/terms/` | 服务条款 |
| 根目录 | `/{key}/index.html` | `/{key}/` (重定向) | 跳转到 home/ |

---

## 目录结构

```text
/assets.ververv.com
├── /data
│   └── apps.json           # App 配置（含第三方服务）
├── /templates
│   ├── privacy.ejs         # 隐私协议模版
│   ├── terms.ejs           # 服务条款模版
│   ├── homepage.ejs        # Landing Page 模版
│   └── index.ejs           # 站点首页模版
├── /static
│   ├── /common             # 公共资源
│   └── /{app.key}          # App 专属资源
├── /scripts
│   └── build.ts            # 构建脚本
├── /dist                   # 构建输出（gitignore）
│   ├── index.html          # 站点首页
│   ├── /assets             # 静态资源
│   ├── /photocleaner
│   │   ├── index.html      # 重定向到 home/
│   │   ├── /home
│   │   │   └── index.html  # Landing Page
│   │   ├── /privacy
│   │   │   └── index.html  # 隐私协议
│   │   ├── /terms
│   │   │   └── index.html  # 服务条款
│   │   └── config.json     # App 配置
│   └── /aloneguard
│       ├── index.html      # 重定向到 home/
│       ├── /home
│       │   └── index.html  # Landing Page
│       ├── /privacy
│       │   └── index.html  # 隐私协议
│       ├── /terms
│       │   └── index.html  # 服务条款
│       └── config.json     # App 配置
├── package.json
├── tsconfig.json
└── .gitignore
```

---
SwipeClean",
    "email": "support@photocleaner.ververv.com",
    "updated_date": "December 13, 2025",
    "has_iap": true,
    "third_party_services": [
      {
        "name": "One Signal",
        "url": "https://onesignal.com/privacy_policy"
      }
    ],
    "pages": ["homepage", "privacy", "terms"],
    "homepage": {
      "slogan": "...",
      "features": [...],
      "faqs": [...]
    }
  },
  {
    "key": "aloneguard",
    "name": "AloneGuard",
    "email": "support@aloneguard.com",
    "updated_date": "January 13, 2026",
    "has_iap": true,
    "third_party_services": []
    "email": "support@ververv.com",
    "updated_date": "December 13, 2025",
    "has_iap": true,
    "third_party_services": [
      {
        "name": "One Signal",
        "url": "https://onesignal.com/privacy_policy"
      }
    ],
    "pages": ["homepage", "privacy", "terms"],
    "homepage": {
      "slogan": "...",
      "features": [...],
      "faqs": [...]
    }
  }
]
```

---

## 构建脚本

### 输出逻辑

```typescript
// 每个页面输出到独立目录
// homepage → {key}/home/index.html
// privacy  → {key}/privacy/index.html
// terms    → {key}/terms/index.html

const outputDir = pageType === 'homepage' ? 'home' : pageType;
const outputPath = path.join(appDir, outputDir, 'index.html');
```

### 根目录重定向

为每个 App 生成 `/{key}/index.html`，自动重定向到 `home/`：

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0;url=home/">
    <link rel="canonical" href="home/">
</head>
<body>
    <p>Redirecting to <a href="home/">home/</a></p>
</body>
</html>
```

---
SwipeClean 首页 | `https://s.ververv.com/photocleaner/home/` |
| SwipeClean Support | `https://s.ververv.com/photocleaner/home/#support` |
| SwipeClean 隐私协议 | `https://s.ververv.com/photocleaner/privacy/` |
| SwipeClean 服务条款 | `https://s.ververv.com/photocleaner/terms/` |
| SwipeClean 配置 | `https://s.ververv.com/photocleaner/config.json` |
| AloneGuard 首页 | `https://s.ververv.com/aloneguard/home/` |
| AloneGuard Support | `https://s.ververv.com/aloneguard/home/#support` |
| AloneGuard 隐私协议 | `https://s.ververv.com/aloneguard/privacy/` |
| AloneGuard 服务条款 | `https://s.ververv.com/aloneguard/terms/` |
| AloneGuard 配置 | `https://s.ververv.com/aloneguard/config.json` |
详见：`change/init/deploy-github-pages.md`

---

## 验证地址

| 页面 | URL |
|------|-----|
| 站点首页 | `https://s.ververv.com/` |
| CleanPhoto 首页 | `https://s.ververv.com/photocleaner/home/` |
| CleanPhoto Support | `https://s.ververv.com/photocleaner/home/#support` |
| CleanPhoto 隐私协议 | `https://s.ververv.com/photocleaner/privacy/` |
| CleanPhoto 服务条款 | `https://s.ververv.com/photocleaner/terms/` |
| CleanPhoto 配置 | `https://s.ververv.com/photocleaner/config.json` |
