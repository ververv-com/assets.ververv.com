import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadApps } from '../config/apps.js';
import type { AppConfig, PageType } from '../config/apps.schema.js';
import { DEFAULT_PATHS, type BuildPaths } from './paths.js';
import { renderAppTemplate, renderIndexTemplate, renderRootRedirect } from './render.js';

const PAGE_TEMPLATES: Readonly<Record<PageType, string>> = {
  privacy: 'privacy.ejs',
  terms: 'terms.ejs',
  homepage: 'homepage.ejs',
};

export interface BuildOptions {
  deployTarget?: string;
  paths?: BuildPaths;
  log?: (message: string) => void;
}

function pageOutputDirectory(pageType: PageType): string {
  return pageType === 'homepage' ? 'home' : pageType;
}

function publicBaseUrl(app: AppConfig): string {
  return app.domain ? `https://${app.domain}` : `https://s.ververv.com/${app.key}`;
}

async function writeApp(
  app: AppConfig,
  paths: BuildPaths,
  log: (message: string) => void,
): Promise<void> {
  log(`\n👉 正在构建: ${app.name} (${app.key})`);
  const appDirectory = path.join(paths.dist, app.key);
  await mkdir(appDirectory, { recursive: true });

  for (const pageType of app.pages) {
    const template = await readFile(
      path.join(paths.templates, PAGE_TEMPLATES[pageType]),
      'utf8',
    );
    const outputDirectory = pageOutputDirectory(pageType);
    const pageDirectory = path.join(appDirectory, outputDirectory);
    await mkdir(pageDirectory, { recursive: true });
    await writeFile(
      path.join(pageDirectory, 'index.html'),
      renderAppTemplate(template, app),
    );
    log(`   ✓ ${outputDirectory}/index.html`);
  }

  if (app.pages.includes('homepage')) {
    await writeFile(path.join(appDirectory, 'index.html'), renderRootRedirect());
    log('   ✓ index.html (redirect)');
  }

  const baseUrl = publicBaseUrl(app);
  const appConfig = {
    app_name: app.name,
    contact: app.email,
    privacy_policy_url: `${baseUrl}/privacy/`,
    terms_of_use_url: app.legal?.terms?.url || `${baseUrl}/terms/`,
  };
  await writeFile(
    path.join(appDirectory, 'config.json'),
    JSON.stringify(appConfig, null, 2),
  );
  log('   ✓ config.json');
}

export async function buildSites(options: BuildOptions = {}): Promise<void> {
  const paths = options.paths ?? DEFAULT_PATHS;
  const log = options.log ?? console.log;

  log('🚀 [Build] 开始构建...');
  await rm(paths.dist, { recursive: true, force: true });
  await mkdir(paths.dist, { recursive: true });
  log('🗑️  已清理 dist 目录');

  await cp(paths.static, path.join(paths.dist, 'assets'), {
    recursive: true,
    filter: (source) => path.basename(source) !== '.DS_Store',
  });
  log('📦 已复制静态资源');

  const apps = await loadApps(paths.data);
  log(`📋 读取到 ${apps.length} 个 App 配置`);

  for (const app of apps) {
    await writeApp(app, paths, log);
  }

  const indexTemplate = await readFile(path.join(paths.templates, 'index.ejs'), 'utf8');
  await writeFile(
    path.join(paths.dist, 'index.html'),
    renderIndexTemplate(indexTemplate, apps),
  );
  log('\n✓ 首页 index.html 已生成');

  if (options.deployTarget !== 'cloudflare') {
    await writeFile(path.join(paths.dist, 'CNAME'), 's.ververv.com');
    log('✓ CNAME 文件已生成: s.ververv.com');
  }

  log('\n✅ 构建成功!');
  log(`📁 输出目录: ${paths.dist}`);
}
