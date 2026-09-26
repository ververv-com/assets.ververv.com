import { resolveRoute } from '../src/worker/routing.js';

function notFound(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          allow: 'GET, HEAD',
          'content-type': 'text/plain; charset=utf-8',
        },
      });
    }

    const requestUrl = new URL(request.url);
    const route = resolveRoute(requestUrl.hostname, requestUrl.pathname);

    if (route.type === 'not-found') return notFound();
    if (route.type === 'redirect') {
      const target = new URL(requestUrl);
      target.pathname = route.pathname;
      return Response.redirect(target.toString(), 308);
    }

    const assetUrl = new URL(requestUrl);
    assetUrl.pathname = route.pathname;
    return env.ASSETS.fetch(new Request(assetUrl, request));
  },
} satisfies ExportedHandler<CloudflareEnv>;
