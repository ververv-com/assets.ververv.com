# 新增 App 并部署到 Cloudflare Worker

本文说明如何把一个新 App（示例：`newapp`）加入现有的 `ververv-app-sites` Worker，并绑定独立域名 `newapp.ververv.com`。

## 架构说明

所有 App 共用一个 Cloudflare Worker 和一份 Static Assets 部署包。Worker 根据请求域名选择 App：

```text
peviai.ververv.com -> dist/peviai/
newapp.ververv.com -> dist/newapp/
```

用户访问：

```text
https://newapp.ververv.com/home/
```

Worker 内部读取：

```text
dist/newapp/home/index.html
```

浏览器地址不会出现 `/newapp/`。

## 前置条件

- 当前分支包含 Cloudflare Worker 配置。
- 已安装依赖：`pnpm install`。
- `pnpm cf:whoami` 能显示正确的 Cloudflare 账户。
- `newapp.ververv.com` 所属 Zone 已加入当前 Cloudflare 账户。
- 如果该域名已有 A、AAAA 或 CNAME 记录，部署 Custom Domain 前先确认它可以被替换，避免域名冲突。

## 1. 准备静态资源

新建目录：

```text
static/newapp/
```

将 App 图标、截图和功能图片放入该目录，例如：

```text
static/newapp/icon.png
static/newapp/screenshot-01.webp
static/newapp/screenshot-02.webp
```

公共资源继续放在：

```text
static/common/
```

不要提交 `.DS_Store`。构建脚本也会自动忽略它。

## 2. 添加 App 配置

在 `data/apps.json` 数组中增加一项。最小结构示例：

```json
{
  "key": "newapp",
  "domain": "newapp.ververv.com",
  "name": "New App",
  "email": "support@ververv.com",
  "updated_date": "September 26, 2026",
  "has_iap": false,
  "third_party_services": [],
  "pages": ["homepage", "privacy", "terms"],
  "homepage": {
    "slogan": "New App slogan",
    "sub_slogan": "New App description",
    "app_icon": "newapp/icon.png",
    "app_store_url": "https://apps.apple.com/app/id0000000000",
    "theme_color": "#2563EB",
    "features": [],
    "faqs": []
  },
  "legal": {
    "terms": {
      "service_description": "Describe the service provided by New App."
    }
  }
}
```

字段约定：

- `key` 必须与 `static/newapp/` 目录名、Worker 映射值一致。
- `domain` 是公开域名，用于生成 `config.json` 中的隐私政策和条款 URL。
- `pages` 支持 `homepage`、`privacy`、`terms`。
- 如果使用 Apple Standard EULA，在 `legal.terms.url` 中填写完整外部 URL；此时可以不生成本地 `terms` 页面。
- `homepage.app_icon` 和 `features[].image` 相对于 `static/`，例如 `newapp/icon.png`。
- `homepage.screenshots[]` 会原样写入 HTML，应使用 `../../assets/newapp/screenshot-01.webp` 形式，与现有 App 保持一致。

## 3. 确认 Worker 自动映射

Worker 会从 `data/apps.json` 自动读取所有带 `domain` 的 App，并生成域名到 `key` 的映射。正常新增 App 时不需要修改 `worker/index.ts` 或维护第二份域名表。

资源隔离也会自动使用当前域名对应的 `appKey`：

```text
newapp.ververv.com 可读取 /assets/common/*
newapp.ververv.com 可读取 /assets/newapp/*
newapp.ververv.com 不可读取 /assets/peviai/*
```

运行 `pnpm test` 会验证 Host 映射和跨 App 资源隔离。

### 本地 Terms 页面

如果新 App 的 `pages` 包含 `terms`，还要确认 Worker 支持 `/terms/`。在 `PAGE_ASSETS` 中增加：

```ts
'/terms/': 'terms/index.html'
```

在 `CANONICAL_PATHS` 中增加：

```ts
'/terms': '/terms/'
```

这些路径是所有已绑定 App 共用的；如果某个 App 没有生成 `terms/index.html`，访问时 Static Assets 会返回 404。

## 4. 绑定 Cloudflare Custom Domain

编辑 `wrangler.jsonc`，在 `routes` 中保留所有现有域名并新增：

```jsonc
"routes": [
  {
    "pattern": "peviai.ververv.com",
    "custom_domain": true
  },
  {
    "pattern": "newapp.ververv.com",
    "custom_domain": true
  }
]
```

注意：`wrangler deploy` 会按当前配置更新同一个 Worker。不要为了新增域名删除已有 route，否则可能解绑已上线的 App。

## 5. 本地检查

先运行类型检查和构建：

```bash
pnpm typecheck
pnpm cf:build
pnpm exec wrangler deploy --dry-run
```

确认生成文件存在：

```bash
test -f dist/newapp/home/index.html
test -f dist/newapp/privacy/index.html
test -f dist/newapp/config.json
```

检查 `config.json`：

```bash
cat dist/newapp/config.json
```

其中 URL 应为：

```text
https://newapp.ververv.com/privacy/
https://newapp.ververv.com/terms/
```

如果 `legal.terms.url` 配置了外部条款，则 `terms_of_use_url` 应保持该外部 URL。

## 6. 本地 Worker 验证

先构建，再明确指定需要模拟的域名启动 Worker：

```bash
pnpm cf:build
pnpm exec wrangler dev --host newapp.ververv.com
```

Wrangler 在配置了多个 route 时可能选择默认域名，因此不要只依赖请求的 Host header 来切换 App。另开终端请求本地端口：

```bash
curl --noproxy '*' -I \
  http://127.0.0.1:8787/home/

curl --noproxy '*' \
  http://127.0.0.1:8787/config.json
```

至少检查：

- `/` 返回 308，并跳转到 `/home/`。
- `/home/` 返回 200。
- `/privacy/` 返回 200。
- `/terms/` 在使用本地条款时返回 200。
- `/config.json` 返回 200 且域名正确。
- `/assets/newapp/icon.png` 返回 200。
- `/newapp/home/` 返回 404，不暴露内部路径。
- 通过 `newapp.ververv.com` 请求其他 App 的资源时返回 404。

## 7. 提交并部署

检查改动：

```bash
git diff --check
git status --short
```

提交代码：

```bash
git add data/apps.json static/newapp worker/index.ts wrangler.jsonc
git commit -m "feat: add New App site"
```

执行真实部署：

```bash
pnpm cf:whoami
pnpm cf:deploy
```

部署输出必须同时列出已有域名和新域名，例如：

```text
peviai.ververv.com (custom domain)
newapp.ververv.com (custom domain)
```

## 8. 线上验收

```bash
curl -I https://newapp.ververv.com/
curl -I https://newapp.ververv.com/home/
curl -I https://newapp.ververv.com/privacy/
curl https://newapp.ververv.com/config.json
curl -I https://newapp.ververv.com/assets/newapp/icon.png
curl -I https://newapp.ververv.com/newapp/home/
```

预期状态码：

| URL                       | 状态码 |
| ------------------------- | ------ |
| `/`                       | 308    |
| `/home/`                  | 200    |
| `/privacy/`               | 200    |
| `/config.json`            | 200    |
| `/assets/newapp/icon.png` | 200    |
| `/newapp/home/`           | 404    |

如果本机代理导致 TLS 或 Fake IP 错误，使用公共 DNS 检查：

```bash
dig @8.8.8.8 +short newapp.ververv.com
```

也可以用公共解析结果绕过本机 DNS 验证：

```bash
curl --noproxy '*' \
  --resolve newapp.ververv.com:443:CLOUDFLARE_IP \
  -I https://newapp.ververv.com/home/
```

## 回滚

如果新 App 上线失败：

1. 从 `wrangler.jsonc` 的 `routes` 删除新域名，但保留所有旧域名。
2. 从 `data/apps.json` 删除新 App 的 `domain` 或移除新 App 配置。
3. 重新执行 `pnpm cf:deploy`。
4. 回滚或修复静态资源后再重新部署。

不要直接删除整个 Worker，因为所有 App 共用 `ververv-app-sites`。

## 新增 App 检查清单

- [ ] `static/newapp/` 资源已准备
- [ ] `data/apps.json` 已增加 `key` 和 `domain`
- [ ] `pnpm test` 已验证自动 Host 映射和资源隔离
- [ ] 需要本地条款时已开放 `/terms/`
- [ ] `wrangler.jsonc` 已保留旧域名并增加新域名
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm cf:build` 通过
- [ ] `wrangler deploy --dry-run` 通过
- [ ] Git 已提交
- [ ] `pnpm cf:deploy` 成功
- [ ] 所有旧域名和新域名均完成线上验收
