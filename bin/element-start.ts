#!/usr/bin/env node

import { context } from 'esbuild';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, sep, dirname } from 'node:path';
import { copyFile, readFile, writeFile } from 'node:fs/promises';

import { fileExists } from '../scripts/fileExists.ts';
import { dashToCamel } from '../scripts/dashToCamel.ts';
import { getDirectories } from '../scripts/getDirectories.ts';
import { folderExists } from '../scripts/folderExists.ts';
import { playgroundPlugin } from '../scripts/playgroundPlugin.ts';
import { htmlDependentsPlugin } from '../scripts/htmlDependentsPlugin.ts';
import { rebuildNotifyPlugin } from '../scripts/rebuildNotifyPlugin.ts';
import { camelToDash } from '../scripts/camelToDash.ts';

const plugins = [htmlDependentsPlugin, rebuildNotifyPlugin];

const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultDir = join(__dirname, '..', 'default');
const configFile = 'element.config.ts';
const rootDir = process.cwd();
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
  title,
  navigation,
  repo,
  repoComponent,
} = config.default;
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
        let indexContent = '';
        if (await fileExists(join(rootDir, srcDir, indexFile))) {
          indexContent = await readFile(join(rootDir, srcDir, indexFile), 'utf8');
        } else {
          indexContent = await readFile(join(defaultDir, playgroundFile), 'utf8');
        }
        indexContent = indexContent.replace(
          '<title>Default</title>',
          `<title>${title ?? 'Default'}</title>`
        );
        indexContent = indexContent.replace(
          '<h1>Default</h1>',
          `<h1>${title ?? 'Default'}</h1>`
        );
        const navItems = structuredClone(navigation ?? []);
        for (let navItem of navItems) {
            navItem.items = [];
        }
        let defaultItem;
        if (navItems.length === 0) {
          defaultItem = { label: 'Components', items: [] };
          navItems.push(defaultItem);
        } else {
          defaultItem = navItems.find((x: any) => !x.extends && !x.components && !x.namespaces);
          if (!defaultItem) {
            defaultItem = { label: 'Other', items: [] };
            navItems.push(defaultItem);
          }
        }
        const componentMap = new Map();
        // Loop and organize into lists
        namespaces.forEach(({ components }: any) => {
          components.forEach(({ component, namespace, tag, readme, examples, className, classExtends }: any)  => {
            // Front end data
            componentMap.set(className, {
              className, // MyComponent
              classExtends, // MyModal
              component, // component
              namespace, // my
              tag, // my-component
              readme, // # My Component
              examples: examples.map((example: any) => example.className)
            });
            examples.forEach((example: any) => {
              componentMap.set(example.className, {
                className: example.className, // XMyComponentBasic
                classExtends: example.classExtends, // HtmlElement
                component: example.component, // myComponentBasic
                namespace: example.namespace, // x
                tag: example.tag, // x-my-component-basic
                example: example.example, // Basic
              });
            });
            // Quick insert any direct includes
            for (let navItem of navItems) {
              if (navItem.include && navItem.include.includes(className)) {
                navItem.items.push({
                  namespace,
                  component,
                  className,
                });
                return;
              }
            }
            // Move on to any other nav groups
            for (let navItem of navItems) {
              // skip default nav group
              if (navItem === defaultItem) {
                continue;
              }
              // ignore if excluded
              if (navItem.exclude && navItem.exclude.includes(className)) {
                continue;
              }
              // ignore if not in namespace
              if (navItem.namespaces && !navItem.namespaces.includes(namespace)) {
                continue;
              }
              // ignore if not extending the required class
              if (navItem.extends && !navItem.extends.includes(classExtends)) {
                continue;
              }
              navItem.items.push({
                namespace,
                component,
                className,
              });
              return;
            }
            defaultItem.items.push({
              namespace,
              component,
              examples,
              className,
            });
          });
        });
        // Replace left nav
        indexContent = indexContent.replace(/([ ]*)<!-- \[Navigation\] -->/, (match: any, indent: any) => {
          return navItems.map(({ label, items }: any) => {
            return [
              indent,
              `<div>${label}</div>`,
              '<ul>',
              items.map(({component, namespace}: any) => {
                return [
                  `<li><a href="#${namespace}-${camelToDash(component)}">${component}</a></li>`
                ].join(`\n${indent}`);
              }).join(`\n${indent}`),
              '</ul>'
            ].join(`\n${indent}`)
          }).join(`\n${indent}`);
        });
        // Repo
        if (repo) {
          const github = 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z';
          const generic = 'M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12.75,13.5C15.5,13.5 16.24,11.47 16.43,10.4C17.34,10.11 18,9.26 18,8.25C18,7 17,6 15.75,6C14.5,6 13.5,7 13.5,8.25C13.5,9.19 14.07,10 14.89,10.33C14.67,11 14,12 12,12C10.62,12 9.66,12.35 9,12.84V8.87C9.87,8.56 10.5,7.73 10.5,6.75C10.5,5.5 9.5,4.5 8.25,4.5C7,4.5 6,5.5 6,6.75C6,7.73 6.63,8.56 7.5,8.87V15.13C6.63,15.44 6,16.27 6,17.25C6,18.5 7,19.5 8.25,19.5C9.5,19.5 10.5,18.5 10.5,17.25C10.5,16.32 9.94,15.5 9.13,15.18C9.41,14.5 10.23,13.5 12.75,13.5M8.25,16.5A0.75,0.75 0 0,1 9,17.25A0.75,0.75 0 0,1 8.25,18A0.75,0.75 0 0,1 7.5,17.25A0.75,0.75 0 0,1 8.25,16.5M8.25,6A0.75,0.75 0 0,1 9,6.75A0.75,0.75 0 0,1 8.25,7.5A0.75,0.75 0 0,1 7.5,6.75A0.75,0.75 0 0,1 8.25,6M15.75,7.5A0.75,0.75 0 0,1 16.5,8.25A0.75,0.75 0 0,1 15.75,9A0.75,0.75 0 0,1 15,8.25A0.75,0.75 0 0,1 15.75,7.5Z';
          const repoIcon = repo.includes('github.com') ? github : generic;
          indexContent = indexContent.replace(/([ ]*)<!-- \[Repo\] -->/, (match: any, indent: any) => {
            return [
              indent,
              `<a href="${repo}">`,
              '  <svg viewBox="0 0 24 24">',
              `    <path fill="currentColor" d="${repoIcon}" />`,
              '  </svg>',
              '  <span>View Repo</span>',
              '</a>'
            ].join(`\n${indent}`)
          });
          indexContent = indexContent.replace(/const repo = '';/, (match: any) => {
            return `const repo = '${repo}';`;
          });
          indexContent = indexContent.replace(/const repoComponent = '';/, (match: any) => {
            return `const repoComponent = '${repoComponent.replace(/\$repo/g, repo)}';`;
          });
          indexContent = indexContent.replace(/const repoIcon = '';/, (match: any) => {
            return `const repoIcon = '${repoIcon}';`;
          });
        }
        // Components
        const classNames = [...componentMap.keys()];
        indexContent = indexContent.replace(/([ ]*)const componentMap = new Map\(\);/, (match: any, indent: any) => {
          return [
            `${indent}const componentMap = new Map();`,
            ...classNames.map((className: any) => {
              const data = componentMap.get(className);
              return `componentMap.set('${className}', ${JSON.stringify(data)});`;
            })
          ].join(`${indent}\n`)
        });
        // Components
        indexContent = indexContent.replace(/([ ]*)const navigation = \[\];/, (match: any, indent: any) => {
          return`${indent}const navigation = ${JSON.stringify(navItems, null, '  ')};`;
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
  minify: false,
  loader: {
    '.css': 'text'
  },
  plugins,
});

await ctx.watch();
let { port } = await ctx.serve({
  servedir: distDir,
});
console.log(green('Dev server started at'), `localhost:${port}`);
