import assert from 'node:assert/strict';
import { test } from 'node:test';

import apps from '../data/apps.json';
import { appsSchema } from '../src/config/apps.schema.js';
import { createSiteRegistry } from '../src/config/site-registry.js';

test('current app configuration is valid', () => {
  const result = appsSchema.safeParse(apps);
  assert.equal(result.success, true);
});

test('app keys and domains must be unique', () => {
  const duplicate = [...apps, apps[apps.length - 1]];
  const result = appsSchema.safeParse(duplicate);
  assert.equal(result.success, false);
});

test('site registry includes only apps with custom domains', () => {
  assert.deepEqual(createSiteRegistry(apps), {
    'peviai.ververv.com': 'peviai',
  });
});
