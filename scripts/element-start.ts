#!/usr/bin/env node

import { build, context } from 'esbuild';
import chokidar from 'chokidar';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, sep, dirname } from 'node:path';
import { copyFile, cp, readFile, writeFile } from 'node:fs/promises';

import { fileExists } from '../scripts/fileExists.ts';
import { folderExists } from '../scripts/folderExists.ts';
import { playgroundPlugin } from '../scripts/playgroundPlugin.ts';
import { htmlDependentsPlugin } from '../scripts/htmlDependentsPlugin.ts';
import { rebuildNotifyPlugin } from '../scripts/rebuildNotifyPlugin.ts';
import { createPlaygroundIndex } from '../scripts/createPlaygroundIndex.ts';
import { getDirectories } from './getDirectories.ts';

(async () => {

const plugins = [rebuildNotifyPlugin];

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

// Get local namespaces
const localNamespaces = await getDirectories(join(rootDir, srcDir, componentsDir));
// Get external namespaces; namespace, packageName
const externalNamespaces = new Map<string, string>();
for (let packageName of (external ?? [])) {
  const folders = await getDirectories(join(rootDir, nodeModulesDir, ...packageName.split('/')));
  folders.forEach((namespace) => {
    if (namespace === nodeModulesDir) { return; }
    externalNamespaces.set(namespace, packageName);
  });
}
// Autoload referenced html elements
plugins.push(htmlDependentsPlugin({
  localNamespaces,
  externalNamespaces,
}));

const entryPoints: string[] = [];
if (namespace) {
  console.log(green('Building app...'));
  entryPoints.push(`./${srcDir}/${componentsDir}/${namespace}/app/app.ts`);
  // Handle index.html
  const indexFile = 'index.html';
  if (await fileExists(join(rootDir, srcDir, indexFile))) {
    await copyFile(
      join(rootDir, srcDir, indexFile),
      join(rootDir, distDir, indexFile)
    );
  } else {
    let indexContent = await readFile(join(defaultDir, indexFile), 'utf8');
    indexContent = indexContent.replace(
      '<title>Default</title>',
      `<title>${title ?? 'Default'}</title>`
    );
    indexContent = indexContent.replace(
      '<namespace-app></namespace-app>',
      `<${namespace}-app></${namespace}-app>`
    );
    await writeFile(join(rootDir, distDir, indexFile), indexContent);
  }
  // Handle favicon.svg
  const faviconSvg = 'favicon.svg';
  if (await fileExists(join(rootDir, srcDir, faviconSvg))) {
    await copyFile(
      join(rootDir, srcDir, faviconSvg),
      join(rootDir, distDir, faviconSvg)
    );
  } else {
    await copyFile(
      join(defaultDir, faviconSvg),
      join(rootDir, distDir, faviconSvg)
    );
  }
} else {
  console.log(green('Building components...'));
  if (!(await folderExists(join(srcDir, componentsDir)))) {
    console.log(red('Missing required "src/components" directory.'))
    process.exit();
  }
  const playgroundFile = 'playground.html';
  const indexFile = 'index.html';
  entryPoints.push('playground-entry');
  plugins.push(
    playgroundPlugin({
      after: async (namespaces: any[]) => {
        const indexContent = await createPlaygroundIndex({
          mode: 'dev',
          rootDir,
          srcDir,
          indexFile,
          defaultDir,
          playgroundFile,
          title,
          repo,
          repoComponent,
          navigation,
          namespaces,
        });
        await writeFile(join(rootDir, distDir, indexFile), indexContent);
      }
    })
  );
}

let ctx = await context({
  entryPoints,
  outfile: `./${distDir}/main.js`,
  bundle: true,
  format: 'esm', // Use ES Modules
  target: 'es2024', // Target ES6 syntax
  sourcemap: true, // needed for debug
  minify: false,
  loader: {
    '.css': 'text'
  },
  plugins,
});

// initial rebuild
await ctx.rebuild();
// copy folders and files
(copy ?? []).forEach(async ({ from, to }: { from: string, to: string }) => {
  const toParts = to.split(sep);
  const fromParts = from.split(sep);
  if (fromParts[fromParts.length - 1] === '') {
    console.log(red('element.config.ts "copy" "from" should not end with a "/". Ex: "assets" not "assets/".'));
    process.exit();
  }
  if (toParts[toParts.length - 1] === '') {
    console.log(red('element.config.ts "copy" "to" should not end with a "/". Ex: "assets" not "assets/".'));
    process.exit();
  }
  if (await folderExists(join(rootDir, srcDir, ...fromParts))) {
    await cp(join(rootDir, srcDir, ...fromParts), join(rootDir, distDir, ...toParts), { recursive: true });
  } else if (await fileExists(join(rootDir, srcDir, ...fromParts))) {
    await copyFile(join(rootDir, srcDir, ...fromParts), join(rootDir, distDir, ...toParts));
  }
});

// any change to src should trigger rebuild
const watcher = chokidar.watch('src', {
  ignoreInitial: true, // Don't trigger on startup
});

watcher.on('all', async (event, path) => {
  // Copy to publish folder for component projects
  if (!namespace) {
    const parts = path.split(sep);
    if (parts.length > 4 && parts[0] === srcDir && parts[1] === componentsDir) {
      console.log(`Copy "${parts.slice(2).join('/')}" to publish/*`);
      await copyFile(join(rootDir, ...parts), join(rootDir, publishDir, ...parts.slice(2)));
    }
    // non destructive
    if (event === 'change' || event === 'add') {
      (copy ?? []).array.forEach(async ({ from, to }: { from: string, to: string }) => {
        const withoutSrc = parts.slice(1).join('/');
        if (withoutSrc.startsWith(from)) {
          console.log('copy after', withoutSrc, from, to);
          /*if (await folderExists(join(rootDir, ...parts))) {
            await copyFile(join(rootDir, ...parts), join(rootDir, distDir, to, ...parts.slice(1)));
          } else if (await fileExists(join(rootDir, ...parts))) {
            await copyFile(join(rootDir, ...parts), join(rootDir, distDir, to, ...parts.slice(1)));
          }*/
        }
      });
      if (await folderExists(join(rootDir, ...parts))) {
        
      }
    }
  }
  try {
    await ctx.rebuild();
  } catch (e) {
    console.error('Rebuild failed:', e);
  }
});

let { port } = await ctx.serve({
  servedir: distDir,
});
console.log(green('Dev server started at'), `localhost:${port}`);

})();