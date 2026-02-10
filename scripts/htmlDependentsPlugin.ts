import { join, sep } from 'node:path';
import { readFile } from "node:fs/promises";

import { dashToCamel } from "./dashToCamel.ts";

const nodeModulesDir = 'node_modules';
const root = process.cwd();
const rootDepth = root.split(sep).length;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

interface PluginOptions {
  localNamespaces: string[];
  externalNamespaces: Map<string, string>;
}

const projectRoot = process.env.INIT_CWD;
let rootNodeModules: string = '';
if (projectRoot) {
  rootNodeModules = join(projectRoot, 'node_modules');
} else {
  console.log('INIT_CWD not available. The script was likely not run via `npm run`.');
  process.exit();
}

export function htmlDependentsPlugin({
  localNamespaces,
  externalNamespaces,
}: PluginOptions) {
  return {
    name: 'html-dependents-plugin',
    setup(build: any) {
      // Intercept files with the .html extension
      build.onLoad({ filter: /\.html$/ }, async (args: any) => {
        const parts = args.path.split(sep).splice(rootDepth);
        const [src, componentsDir, currentNamspace, currentComponent, ...file] = parts;
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
          const depth = parts.length - 4;
          const backPaths = (new Array(depth)).fill('..');
          if (namespace === currentNamspace) {
            if (component === currentComponent) {
              return;
            }
            imports.push(`import './${backPaths.join('/')}/${component}/${component}';`);
          } else if (localNamespaces.includes(namespace)) {
            imports.push(`import './${backPaths.join('/')}/${namespace}/${component}/${component}';`);
          } else if (externalNamespaces.has(namespace)) {
            backPaths.push('..'); // src
            backPaths.push('..'); // components
            backPaths.push('..'); // node_modules
            const pkg = externalNamespaces.get(namespace);
            //imports.push(`import './${backPaths.join('/')}/${nodeModulesDir}/${pkg}/${namespace}/${component}/${component}';`);
            imports.push(`import '${pkg}/${namespace}/${component}';`);
          } else {
            console.log(red(`Unable to find namespace folder "${namespace}". Possibly missing 'external' in element.config.ts`));
            process.exit();
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
}
