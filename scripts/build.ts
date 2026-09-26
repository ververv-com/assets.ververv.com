import { buildSites } from '../src/build/index.js';

try {
  await buildSites({ deployTarget: process.env.DEPLOY_TARGET });
} catch (error) {
  console.error('\nBuild failed:', error);
  process.exitCode = 1;
}
