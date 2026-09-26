import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveRoute } from '../src/worker/routing.js';

test('routes Pevi AI public pages without exposing its internal key', () => {
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/'), {
    type: 'redirect',
    pathname: '/home/',
  });
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/home/'), {
    type: 'asset',
    pathname: '/peviai/home/index.html',
  });
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/privacy/'), {
    type: 'asset',
    pathname: '/peviai/privacy/index.html',
  });
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/config.json'), {
    type: 'asset',
    pathname: '/peviai/config.json',
  });
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/peviai/home/'), {
    type: 'not-found',
  });
});

test('isolates app-owned assets by host', () => {
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/assets/peviai/icon.png'), {
    type: 'asset',
    pathname: '/assets/peviai/icon.png',
  });
  assert.deepEqual(
    resolveRoute('peviai.ververv.com', '/assets/common/app-store-badge.svg'),
    {
      type: 'asset',
      pathname: '/assets/common/app-store-badge.svg',
    },
  );
  assert.deepEqual(resolveRoute('peviai.ververv.com', '/assets/signseal/icon.png'), {
    type: 'not-found',
  });
  assert.deepEqual(resolveRoute('signseal.ververv.com', '/home/'), {
    type: 'not-found',
  });
});
