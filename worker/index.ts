/// <reference types="@cloudflare/workers-types" />

interface Env {
    ASSETS: Fetcher;
}

const APP_BY_HOST: Readonly<Record<string, string>> = {
    'peviai.ververv.com': 'peviai'
};

const PAGE_ASSETS: Readonly<Record<string, string>> = {
    '/home/': 'home/index.html',
    '/privacy/': 'privacy/index.html',
    '/config.json': 'config.json'
};

const CANONICAL_PATHS: Readonly<Record<string, string>> = {
    '/': '/home/',
    '/home': '/home/',
    '/privacy': '/privacy/'
};

const PUBLIC_ASSET_PREFIXES = [
    '/assets/common/',
    '/assets/peviai/'
] as const;

function redirect(requestUrl: URL, pathname: string): Response {
    const target = new URL(requestUrl);
    target.pathname = pathname;
    return Response.redirect(target.toString(), 308);
}

function notFound(): Response {
    return new Response('Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response('Method Not Allowed', {
                status: 405,
                headers: {
                    allow: 'GET, HEAD',
                    'content-type': 'text/plain; charset=utf-8'
                }
            });
        }

        const requestUrl = new URL(request.url);
        const appKey = APP_BY_HOST[requestUrl.hostname.toLowerCase()];
        if (!appKey) {
            return notFound();
        }

        const canonicalPath = CANONICAL_PATHS[requestUrl.pathname];
        if (canonicalPath) {
            return redirect(requestUrl, canonicalPath);
        }

        let assetPath: string;
        if (PUBLIC_ASSET_PREFIXES.some(prefix => requestUrl.pathname.startsWith(prefix))) {
            assetPath = requestUrl.pathname;
        } else {
            const pageAsset = PAGE_ASSETS[requestUrl.pathname];
            if (!pageAsset) {
                return notFound();
            }
            assetPath = `/${appKey}/${pageAsset}`;
        }

        const assetUrl = new URL(requestUrl);
        assetUrl.pathname = assetPath;
        return env.ASSETS.fetch(new Request(assetUrl, request));
    }
} satisfies ExportedHandler<Env>;
