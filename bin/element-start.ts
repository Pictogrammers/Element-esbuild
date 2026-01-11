#!/usr/bin/env node

import { context } from 'esbuild';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, sep, dirname } from 'node:path';
import { copyFile, readFile, writeFile } from 'node:fs/promises';

import { fileExists } from '../scripts/fileExists.ts';
import { dashToCamel } from '../scripts/dashToCamel.ts';

const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultDir = join(__dirname, '..', 'default');
const configFile = 'element.config.ts';
const rootDir = process.cwd();
const fullConfigPath = pathToFileURL(configFile);
const config = await import(fullConfigPath.href);

const { namespace, title } = config.default;
const distDir = 'dist';
const srcDir = 'src';
const componentsDir = 'components';

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
  // loop all folders
}

const htmlDependentsPlugin = {
  name: 'html-dependents-plugin',
  setup(build: any) {
    // Intercept files with the .html extension
    build.onLoad({ filter: /\.html$/ }, async (args: any) => {
      const [currentFile, currentComponent, currentNamspace] = args.path.split(sep).reverse();
      // Read the file contents as text
      const contents = await readFile(args.path, 'utf8');
      const matches = contents.matchAll(/<\/(?<namespace>\w+)-(?<value>[^>]+)/g);
      const components = new Map<string, string[]>();
      for (const match of matches) {
        const { namespace, value } = match.groups as any;
        const component = dashToCamel(value);
        components.set(`${namespace}-${component}`, [namespace, component]);
      }
      const imports: string[] = [];
      components.forEach(([namespace, component]) => {
        if (namespace === currentNamspace) {
          if (component === currentComponent) {
            return;
          }
          imports.push(`import './../${component}/${component}';`);
        } else {
          imports.push(`import './../../${namespace}/${component}/${component}';`);
        }
      });
      imports.push(`export default \`${contents}\`;`);
      return {
        contents: imports.join('\n'),
        loader: 'js',
      };
    });
  },
};

const rebuildNotifyPlugin = {
  name: 'rebuild-notify',
  setup(build: any) {
    build.onEnd((result: any) => {
      if (result.errors.length > 0) {
        console.error(`Build ended with ${result.errors.length} errors`);
      } else {
        console.log(green('Build succeeded!'));
      }
      // You can add logic here to restart a server, send a signal, etc.
    });
  },
};

let ctx = await context({
  entryPoints,
  outfile: `./${distDir}/main.js`,
  bundle: true,
  format: 'esm', // Use ES Modules
  target: 'es2024', // Target ES6 syntax
  minify: false,
  loader: {
    '.css': 'text'
  },
  plugins: [htmlDependentsPlugin, rebuildNotifyPlugin],
});

await ctx.watch();
let { port } = await ctx.serve({
  servedir: distDir,
});
console.log(green('Dev server started at'), `localhost:${port}`);
