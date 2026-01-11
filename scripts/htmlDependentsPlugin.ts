import { sep } from 'node:path';
import { readFile } from "node:fs/promises";

import { dashToCamel } from "./dashToCamel.ts";

const root = process.cwd();
const rootDepth = root.split(sep).length;

export const htmlDependentsPlugin = {
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
        } else {
          imports.push(`import './${backPaths.join('/')}/${namespace}/${component}/${component}';`);
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
