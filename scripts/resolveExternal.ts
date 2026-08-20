// This is very dumb, when npm link is used esbuild won't resolve
// the local packages so this gets around that.

import { join } from 'node:path';

const projectRoot = process.env.INIT_CWD;
let rootNodeModules: string = '';
if (projectRoot) {
  rootNodeModules = join(projectRoot, 'node_modules');
} else {
  console.log('INIT_CWD not available. The script was likely not run via `npm run`.');
  process.exit();
}

interface PluginOptions {
  external: string[];
}

export function resolveExternal({ external }: PluginOptions) {
  return {
    name: 'resolve-external',
    setup(build: any) {
      const skipResolve = {};
      build.onResolve({ filter: new RegExp(`^@pictogrammers/element`) }, async (args: any) => {
        if (args.pluginData === skipResolve) return;
        // Manually resolve the path, perhaps pointing to a custom location
        console.log('>>>', args.path, args.kind);
        return build.resolve(args.path, {
          resolveDir: rootNodeModules,
          kind: args.kind,
          pluginData: skipResolve
        });
      });
      external.forEach((pkgName) => {
        build.onResolve({ filter: new RegExp(`^${pkgName}/`) }, async (args: any) => {
          if (args.pluginData === skipResolve) return;
          // Manually resolve the path, perhaps pointing to a custom location
          return build.resolve(args.path, {
            resolveDir: rootNodeModules,
            kind: args.kind,
            pluginData: skipResolve
          });
        });
      });
    },
  };
}
