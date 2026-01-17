#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

import { htmlDependentsPlugin } from '../scripts/htmlDependentsPlugin.ts';
import { rebuildNotifyPlugin } from '../scripts/rebuildNotifyPlugin.ts';
import { fileExists } from '../scripts/fileExists.ts';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { playgroundPlugin } from '../scripts/playgroundPlugin.ts';

const plugins = [htmlDependentsPlugin, rebuildNotifyPlugin];
const entryPoints: string[] = [];

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const indexFile = 'index.html';
const distDir = 'dist';
const srcDir = 'src';
const componentsDir = 'components';
const configFile = 'element.config.ts';
const rootDir = process.cwd();
const buildDir = 'build';
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
} = config.default;

if (namespace) {
  console.log(green('Building app...'));
  entryPoints.push(`./${srcDir}/${componentsDir}/${namespace}/app/app.ts`);
} else {
  // dynamically resolve all found components
  entryPoints.push('playground-entry');
  plugins.push(
    playgroundPlugin({
      after: async (namespaces: any[]) => {
        // actually build index file instead of copying from dist
      }
    })
  );
}

build({
  entryPoints,
  bundle: true,
  platform: 'browser',
  outfile: `./${buildDir}/main.js`,
  sourcemap: false,
  minify: true, // aka production
  format: 'esm', // Use ES Modules
  target: 'es2024', // Target ES6 syntax
  loader: {
    '.html': 'text',
    '.css': 'text'
  },
  plugins,
}).then(async () => {
  if (await fileExists(join(rootDir, distDir, indexFile))) {
    await copyFile(join(rootDir, distDir, indexFile), join(rootDir, buildDir, indexFile));
  }
}).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
