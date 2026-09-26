import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { buildSites } from '../src/build/index.js';
import { DEFAULT_PATHS } from '../src/build/paths.js';

test('Cloudflare build preserves the public Pevi AI contract', async (context) => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ververv-build-'));
  context.after(() => rm(temporaryDirectory, { recursive: true, force: true }));

  await buildSites({
    deployTarget: 'cloudflare',
    log: () => undefined,
    paths: { ...DEFAULT_PATHS, dist: temporaryDirectory },
  });

  const config = JSON.parse(
    await readFile(path.join(temporaryDirectory, 'peviai/config.json'), 'utf8'),
  ) as unknown;
  assert.deepEqual(config, {
    app_name: 'Pevi AI',
    contact: 'support@ververv.com',
    privacy_policy_url: 'https://peviai.ververv.com/privacy/',
    terms_of_use_url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  });

  const homepage = await readFile(
    path.join(temporaryDirectory, 'peviai/home/index.html'),
    'utf8',
  );
  assert.match(homepage, /&copy; \d{4} Keli Inc\. All rights reserved\./);
  assert.match(homepage, /mailto:support@ververv\.com/);

  await assert.rejects(readFile(path.join(temporaryDirectory, 'CNAME')));
});
