# Cloudflare Pages 部署记录

## 部署信息

| 项目 | 值 |
|------|-----|
| 项目名称 | `assets-ververv-com` |
| 项目类型 | **Pages**（非 Workers） |
| Pages 域名 | `assets-ververv-com.pages.dev` |
| 自定义域名 | `assets.ververv.com` |
| 部署时间 | 2025-12-12 |

---

## 可访问 URL

**Pages.dev 域名**：
- 首页：https://assets-ververv-com.pages.dev/
- 隐私协议：https://assets-ververv-com.pages.dev/photocleaner/privacy.html
- 配置文件：https://assets-ververv-com.pages.dev/photocleaner/config.json

**自定义域名**：
- 首页：https://assets.ververv.com/
- 隐私协议：https://assets.ververv.com/photocleaner/privacy.html

---

## Cloudflare Pages 配置清单

基于 GitHub 仓库 (`com-ververv/assets.ververv.com`)：

| 配置项 | 设置值 | 说明 |
|--------|--------|------|
| 项目类型 | Pages | 连接 Git 仓库 |
| 构建命令 | `pnpm install && pnpm run build` | 先安装依赖，再执行 TS 构建脚本 |
| 输出目录 | `dist` | 告诉 Cloudflare 网页文件生成在哪里 |
| 框架预设 | None | 自定义 Node.js 脚本，不需要预设 |
| 环境变量 | `NODE_VERSION: 18` | 确保 Node 版本兼容 |
| 自定义域名 | `assets.ververv.com` | 绑定在 Pages 项目上 |

---

## 问题排查复盘

### 问题现象

1. **无法访问**：自定义域名无法打开，报错涉及 SSL 或连接重置
2. **内容错误**：网络通了，但访问页面只返回 "Hello World"，而不是仓库里的 HTML 内容

---

### 障碍 1：SSL 模式导致的死循环

**现象**：
```
ERR_TOO_MANY_REDIRECTS
```

**原因**：
Cloudflare SSL/TLS 设置为 **Flexible**。Worker/Pages 默认走 HTTPS，Cloudflare 却试图用 HTTP 回源，导致无限重定向。

**解决**：
将 SSL/TLS 模式改为 **Full** 或 **Full (Strict)**。

---

### 障碍 2：本地网络环境干扰 (Fake IP)

**现象**：
```
SSL_ERROR_SYSCALL
```
解析 IP 为 `198.18.0.57`（属于 198.18.0.0/15 保留地址段）

**原因**：
本地开启了代理软件（如 Clash）的**增强模式/Fake IP**，导致本地请求并未真正到达 Cloudflare，而是被代理软件拦截并切断。

**解决**：
- 识别出是本地环境问题
- 通过在线工具验证或调整本地代理设置确认服务其实是正常的
- 使用 `dig @8.8.8.8 assets.ververv.com` 验证真实 DNS 解析

---

### 障碍 3：路由冲突 - Worker "劫持" 了 Pages（最关键）

**现象**：
访问域名返回 "Hello World"

**原因**：
Cloudflare 账户下同时存在两个同名项目：

| 项目类型 | 图标 | 内容 |
|----------|------|------|
| Worker 项目 | `< >` | 包含默认的 "Hello World" 脚本 |
| Pages 项目 | `📄` | 包含真正的构建代码和 HTML |

**错误配置**：域名 `assets.ververv.com` 被绑定到了 **Worker** 上。由于 Worker 优先级极高，它拦截了所有请求并返回脚本里的 "Hello World"，导致请求根本没机会到达 Pages 仓库。

**解决**：
从 Worker 上解绑域名，重新绑定到 Pages 上。

---

## Workers vs Pages 关键区别

| 对比项 | Workers (`< >`) | Pages (`📄`) |
|--------|-----------------|--------------|
| 角色 | 门口的**保安** | 身后的**仓库/工厂** |
| 特长 | 逻辑拦截、API 转发、边缘计算 | 连接 GitHub、执行构建、托管静态文件 |
| 行为 | 代码写什么就返回什么 | 把代码编译成网页展示给用户 |
| 适用场景 | API、中间件、边缘函数 | 静态网站、前端应用 |

**一句话总结**：如果你有 `dist/` 文件夹或者需要 `build` 生成 HTML，请永远选择 **Pages**，并把域名绑在 Pages 上。

---

## 自定义域名配置检查清单

- [x] 使用 Pages 项目（非 Workers）
- [x] Pages 项目中添加了自定义域名
- [x] 域名状态显示 Active
- [x] SSL/TLS 模式为 Full 或 Full (strict)
- [x] DNS 记录由 Cloudflare 自动管理
- [x] 确认没有 Worker 项目绑定同一域名

---

## 相关文档

- [Cloudflare Pages Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [General SSL Errors](https://developers.cloudflare.com/ssl/troubleshooting/general-ssl-errors/)
