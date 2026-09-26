import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface BuildPaths {
  data: string;
  templates: string;
  static: string;
  dist: string;
}

export const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));

export const DEFAULT_PATHS: BuildPaths = {
  data: path.join(ROOT_DIR, 'data', 'apps.json'),
  templates: path.join(ROOT_DIR, 'templates'),
  static: path.join(ROOT_DIR, 'static'),
  dist: path.join(ROOT_DIR, 'dist'),
};
