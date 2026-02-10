#!/usr/bin/env node

import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, sep, dirname } from 'node:path';
import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';

import { fileExists } from '../scripts/fileExists.ts';

const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultDir = join(__dirname, '..', 'default');
const configFile = 'element.config.ts';
const rootDir = process.cwd();
const publishDir = 'publish';
const fullConfigPath = pathToFileURL(configFile);
if (!(await fileExists(configFile))) {
  console.log(red('Missing element.config.ts in root.'), 'Add with content:');
  console.log('export default {');
  console.log(`  namespace: 'hello',`);
  console.log('}');
  process.exit();
}
const config = await import(fullConfigPath.href);

const {
  namespace,
  external,
  title,
  navigation,
  repo,
  repoComponent,
  copy,
} = config.default;
const nodeModulesDir = 'node_modules';
const distDir = 'dist';
const srcDir = 'src';
const componentsDir = 'components';

// Publish
console.log('publish');