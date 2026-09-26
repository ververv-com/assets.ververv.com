# Ververv App Sites

Data-driven static websites for Ververv iOS apps, served by one Cloudflare Worker with a custom domain per app.

## Requirements

- Node.js 20 or newer
- pnpm 10.25.0
- Wrangler authentication for deployment commands

## Commands

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `pnpm build`     | Build GitHub Pages output, including `dist/CNAME`    |
| `pnpm cf:build`  | Build Cloudflare Static Assets output                |
| `pnpm cf:dev`    | Build and run the Worker locally                     |
| `pnpm test`      | Run configuration, build-contract, and routing tests |
| `pnpm typecheck` | Run strict TypeScript checks                         |
| `pnpm check`     | Run the full local/CI validation pipeline            |
| `pnpm cf:whoami` | Show the authenticated Cloudflare account            |
| `pnpm cf:deploy` | Build and deploy the shared production Worker        |

## Structure

```text
data/apps.json            App content and public-domain configuration
static/                   App-owned and shared assets
templates/                EJS templates that define public HTML
src/build/                Static-site build pipeline
src/config/               Runtime validation and site registry
src/worker/               Pure host/path routing logic
worker/index.ts           Cloudflare Worker entry point
tests/                    Configuration, output, and routing contracts
wrangler.jsonc            Worker, Static Assets, and Custom Domain config
```

See [the app deployment guide](doc/add-app-to-cloudflare-worker.md) before adding a domain or deploying a new app.
