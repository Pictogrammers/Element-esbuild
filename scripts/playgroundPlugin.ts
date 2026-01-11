import { join, sep, dirname } from 'node:path';

import { getDirectories } from './getDirectories.ts';
import { fileExists } from './fileExists.ts';
import { folderExists } from './folderExists.ts';

const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const srcDir = 'src';
const componentsDir = 'components';

export const playgroundPlugin = {
  name: 'playground-plugin',
  setup(build: any) {
    const entryPointName = 'playground-entry';
    const virtualNamespace = 'playground-module'; // Use a custom namespace

    // 1. Intercept the entry point resolution
    build.onResolve({ filter: new RegExp(`^${entryPointName}$`) }, (args: any) => {
      // Return a path with the custom namespace
      return {
        path: entryPointName,
        namespace: virtualNamespace,
      };
    });

    // 2. Load the virtual module content
    build.onLoad({ filter: /.*/, namespace: virtualNamespace }, async (args: any) => {
      const entryPoints: string[] = [];
      const namespaces = await getDirectories(join(srcDir, componentsDir));
        if (namespaces.length === 0) {
          console.log(red('Missing at least 1 namespace folder under "src/components/"'));
          process.exit();
        }
        for (let namespace of namespaces) {
          const namespaceDir = join(srcDir, componentsDir, namespace);
          const components = await getDirectories(namespaceDir);
          for (let component of components) {
            if (await fileExists(join(srcDir, componentsDir, namespace, component, `${component}.ts`))) {
              entryPoints.push(`import '${componentsDir}/${namespace}/${component}/${component}';`);
              if (await folderExists(join(namespaceDir, component, '__examples__'))) {
                const examples =  await getDirectories(join(namespaceDir, component, '__examples__'));
                for (let example of examples) {
                  if (await fileExists(join(namespaceDir, component, '__examples__', example, `${example}.ts`))) {
                    entryPoints.push(`import '${componentsDir}/${namespace}/${component}/__examples__/${example}/${example}';`);
                  } else {
                    console.log(red(`Missing ${componentsDir}/${namespace}/${component}/__examples__/${example}/${example}.ts`));
                  }
                }
              }
            }
          }
        }
      // Define your virtual file content here
      return {
        contents: [
          `console.log('Playground...');`,
          ...entryPoints
        ].join('\n'),
        resolveDir: join(process.cwd(), srcDir), 
      };
    });
  },
};
