import apps from '../../data/apps.json';

export function createSiteRegistry(input: unknown): Readonly<Record<string, string>> {
  if (!Array.isArray(input)) {
    throw new Error('App configuration must be an array');
  }

  const entries: Array<readonly [string, string]> = [];
  for (const item of input) {
    if (typeof item !== 'object' || item === null) continue;
    if (!('key' in item) || !('domain' in item)) continue;
    if (typeof item.key !== 'string' || typeof item.domain !== 'string') continue;
    entries.push([item.domain.toLowerCase(), item.key]);
  }

  return Object.freeze(Object.fromEntries(entries));
}

export const APP_BY_HOST = createSiteRegistry(apps);
