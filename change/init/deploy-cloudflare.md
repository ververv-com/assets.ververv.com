# Cloudflare Pages 部署记录

## 部署信息

| 项目 | 值 |
|------|-----|
| 项目名称 | `assets-ververv-com` |
| Pages 域名 | `assets-ververv-com.pages.dev` |
| 自定义域名 | `assets.ververv.com`（配置中） |
| 部署时间 | 2025-12-12 |

---

## 可访问 URL

**Pages.dev 域名**（已生效）：
- 首页：https://assets-ververv-com.pages.dev/
- 隐私协议：https://assets-ververv-com.pages.dev/photocleaner/privacy.html
- 配置文件：https://assets-ververv-com.pages.dev/photocleaner/config.json

**自定义域名**（SSL 证书待生效）：
- 首页：https://assets.ververv.com/
- 隐私协议：https://assets.ververv.com/photocleaner/privacy.html

---

## 部署配置

### Build Settings

| 配置项 | 值 |
|--------|-----|
| Build command | `pnpm install && pnpm run build` |
| Deploy command | `npx wrangler pages deploy dist --project-name=assets-ververv-com --commit-dirty=true` |
| Root directory | `/` |

### 首次部署命令（含创建项目）

```bash
npx wrangler pages project create assets-ververv-com --production-branch=main && npx wrangler pages deploy dist --project-name=assets-ververv-com --commit-dirty=true
```

### 后续部署命令（项目已存在）

```bash
npx wrangler pages deploy dist --project-name=assets-ververv-com --commit-dirty=true
```

---

## 部署过程遇到的问题

### 问题 1：Must specify a project name

**错误信息**：
```
✘ [ERROR] Must specify a project name.
```

**解决方案**：
Deploy command 添加 `--project-name=assets-ververv-com` 参数。

---

### 问题 2：Authentication error

**错误信息**：
```
✘ [ERROR] A request to the Cloudflare API failed.
Authentication error [code: 10000]
```

**解决方案**：
创建新的 API Token，需包含 **Cloudflare Pages - Edit** 权限。

---

### 问题 3：Project not found

**错误信息**：
```
✘ [ERROR] Project not found. The specified project name does not match any of your existing projects.
```

**解决方案**：
首次部署需要先创建项目：
```bash
npx wrangler pages project create assets-ververv-com --production-branch=main
```

---

### 问题 4：自定义域名 SSL 证书未生效

**现象**：
- DNS 解析正确（104.21.89.73, 172.67.156.243）
- 但 HTTPS 访问失败，SSL 握手错误

**原因**：
自定义域名需要在 Workers & Pages 项目中配置，Cloudflare 才会自动签发 SSL 证书。

**配置步骤**：
1. Workers & Pages → assets-ververv-com → Settings
2. Domains & Routes → + Add → Custom domain
3. 输入 `assets.ververv.com`
4. 等待 SSL 证书生成（5-15 分钟）

**注意**：
- 不要手动添加 CNAME DNS 记录
- 让 Cloudflare 在添加自定义域名时自动创建 DNS 记录

---

### 问题 5：域名已在使用

**错误信息**：
```
This domain is already in use. Please delete the corresponding record in DNS settings.
```

**解决方案**：
1. 先删除 DNS 中的 `assets` 记录
2. 再在 Workers & Pages 中添加自定义域名
3. Cloudflare 会自动创建正确的 DNS 记录

---

## 自定义域名配置检查清单

- [ ] Workers & Pages 项目中添加了自定义域名
- [ ] 域名状态显示 Active
- [ ] SSL/TLS → Edge Certificates 中有对应证书
- [ ] SSL/TLS 模式为 Full 或 Full (strict)
- [ ] DNS 记录由 Cloudflare 自动管理

---

## 相关文档

- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Pages Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [General SSL Errors](https://developers.cloudflare.com/ssl/troubleshooting/general-ssl-errors/)
