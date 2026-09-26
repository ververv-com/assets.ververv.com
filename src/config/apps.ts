import { readFile } from 'node:fs/promises';

import { z } from 'zod';

import { appsSchema, type AppConfig } from './apps.schema.js';

export async function loadApps(filePath: string): Promise<AppConfig[]> {
  const source = await readFile(filePath, 'utf8');
  let rawApps: unknown;

  try {
    rawApps = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}`, { cause: error });
  }

  const result = appsSchema.safeParse(rawApps);
  if (!result.success) {
    throw new Error(`Invalid app configuration:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
