import { APP_BY_HOST } from '../config/site-registry.js';

const PAGE_ASSETS: Readonly<Record<string, string>> = {
  '/home/': 'home/index.html',
  '/privacy/': 'privacy/index.html',
  '/config.json': 'config.json',
};

const CANONICAL_PATHS: Readonly<Record<string, string>> = {
  '/': '/home/',
  '/home': '/home/',
  '/privacy': '/privacy/',
};

export type RouteResolution =
  | { type: 'asset'; pathname: string }
  | { type: 'redirect'; pathname: string }
  | { type: 'not-found' };

function isAllowedAsset(pathname: string, appKey: string): boolean {
  return (
    pathname.startsWith('/assets/common/') || pathname.startsWith(`/assets/${appKey}/`)
  );
}

export function resolveRoute(hostname: string, pathname: string): RouteResolution {
  const appKey = APP_BY_HOST[hostname.toLowerCase()];
  if (!appKey) return { type: 'not-found' };

  const canonicalPath = CANONICAL_PATHS[pathname];
  if (canonicalPath) return { type: 'redirect', pathname: canonicalPath };

  if (isAllowedAsset(pathname, appKey)) {
    return { type: 'asset', pathname };
  }

  const pageAsset = PAGE_ASSETS[pathname];
  if (!pageAsset) return { type: 'not-found' };
  return { type: 'asset', pathname: `/${appKey}/${pageAsset}` };
}
