import ejs from 'ejs';

import type { AppConfig } from '../config/apps.schema.js';

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

export function renderAppTemplate(template: string, app: AppConfig): string {
  return ejs.render(template, {
    ...app,
    helpers: { hexToRgb },
  });
}

export function renderIndexTemplate(template: string, apps: AppConfig[]): string {
  return ejs.render(template, { apps });
}

export function renderRootRedirect(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=home/">
    <link rel="canonical" href="home/">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="home/">home/</a></p>
</body>
</html>`;
}
