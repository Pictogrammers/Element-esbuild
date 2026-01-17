#!/usr/bin/env node
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);

// scripts/element-build.ts
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

// scripts/htmlDependentsPlugin.ts
import { sep } from "node:path";
import { readFile } from "node:fs/promises";

// scripts/dashToCamel.ts
function dashToCamel(str) {
  return str.replace(/-([a-z])/g, (m) => m[1].toUpperCase());
}

// scripts/htmlDependentsPlugin.ts
var root = process.cwd();
var rootDepth = root.split(sep).length;
var htmlDependentsPlugin = {
  name: "html-dependents-plugin",
  setup(build2) {
    build2.onLoad({ filter: /\.html$/ }, async (args) => {
      const parts = args.path.split(sep).splice(rootDepth);
      const [src, componentsDir3, currentNamspace, currentComponent, ...file] = parts;
      const contents = await readFile(args.path, "utf8");
      const matches = contents.matchAll(/<\/(?<namespace>\w+)-(?<value>[^>]+)/g);
      const components = /* @__PURE__ */ new Map();
      for (const match of matches) {
        const { namespace: namespace2, value } = match.groups;
        const component = dashToCamel(value);
        components.set(`${namespace2}-${component}`, [namespace2, component]);
      }
      const imports = [];
      components.forEach(([namespace2, component]) => {
        const depth = parts.length - 4;
        const backPaths = new Array(depth).fill("..");
        if (namespace2 === currentNamspace) {
          if (component === currentComponent) {
            return;
          }
          imports.push(`import './${backPaths.join("/")}/${component}/${component}';`);
        } else {
          imports.push(`import './${backPaths.join("/")}/${namespace2}/${component}/${component}';`);
        }
      });
      imports.push(`export default \`${contents}\`;`);
      return {
        contents: imports.join("\n"),
        loader: "js"
      };
    });
  }
};

// scripts/rebuildNotifyPlugin.ts
var green = (text) => `\x1B[32m${text}\x1B[0m`;
var rebuildNotifyPlugin = {
  name: "rebuild-notify",
  setup(build2) {
    build2.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`Build ended with ${result.errors.length} errors`);
      } else {
        console.log(green("Build succeeded!"));
      }
    });
  }
};

// scripts/fileExists.ts
import { access } from "node:fs/promises";
import { constants } from "node:fs";
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// scripts/element-build.ts
import { copyFile, writeFile as writeFile2 } from "node:fs/promises";
import { dirname as dirname2, join as join3 } from "node:path";

// scripts/playgroundPlugin.ts
import { join } from "node:path";

// scripts/getDirectories.ts
import { readdir } from "node:fs/promises";
async function getDirectories(dirPath) {
  const directories = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        directories.push(entry.name);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
  return directories;
}

// scripts/folderExists.ts
import { access as access2 } from "node:fs/promises";
import { constants as constants2 } from "node:fs";
async function folderExists(folderPath) {
  try {
    await access2(folderPath, constants2.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// scripts/playgroundPlugin.ts
import { readFile as readFile2 } from "node:fs/promises";

// scripts/capitalizeFirstChracter.ts
function capitalizeFirstCharacter(str) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// scripts/camelToDash.ts
function camelToDash(str) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

// scripts/playgroundPlugin.ts
var red = (text) => `\x1B[31m${text}\x1B[0m`;
var rootDir = process.cwd();
var srcDir = "src";
var componentsDir = "components";
function playgroundPlugin(options) {
  return {
    name: "playground-plugin",
    setup(build2) {
      const entryPointName = "playground-entry";
      const virtualNamespace = "playground-module";
      build2.onResolve({ filter: new RegExp(`^${entryPointName}$`) }, (args) => {
        return {
          path: entryPointName,
          namespace: virtualNamespace
        };
      });
      build2.onLoad({ filter: /.*/, namespace: virtualNamespace }, async (args) => {
        const entryPoints2 = [];
        const namespaces = await getDirectories(join(srcDir, componentsDir));
        if (namespaces.length === 0) {
          console.log(red('Missing at least 1 namespace folder under "src/components/"'));
          process.exit();
        }
        const meta = [];
        for (let namespace2 of namespaces) {
          const metaNamespace = {
            namespace: namespace2,
            components: []
          };
          meta.push(metaNamespace);
          const namespaceDir = join(srcDir, componentsDir, namespace2);
          const components = await getDirectories(namespaceDir);
          for (let component of components) {
            if (await fileExists(join(srcDir, componentsDir, namespace2, component, `${component}.ts`))) {
              let readme = "";
              if (await fileExists(join(srcDir, componentsDir, namespace2, component, "README.md"))) {
                readme = await readFile2(join(srcDir, componentsDir, namespace2, component, "README.md"), "utf8");
              }
              const metaComponent = {
                namespace: namespace2,
                component,
                tag: `${namespace2}-${camelToDash(component)}`,
                examples: [],
                className: "",
                classExtends: "",
                readme
              };
              entryPoints2.push(`import '${componentsDir}/${namespace2}/${component}/${component}';`);
              if (await folderExists(join(namespaceDir, component, "__examples__"))) {
                const examples = await getDirectories(join(namespaceDir, component, "__examples__"));
                for (let example of examples) {
                  if (await fileExists(join(namespaceDir, component, "__examples__", example, `${example}.ts`))) {
                    entryPoints2.push(`import '${componentsDir}/${namespace2}/${component}/__examples__/${example}/${example}';`);
                    metaComponent.examples.push({
                      namespace: namespace2,
                      component,
                      example,
                      tag: `x-${namespace2}-${camelToDash(component)}-${camelToDash(example)}`,
                      className: `X${capitalizeFirstCharacter(namespace2)}${capitalizeFirstCharacter(component)}${capitalizeFirstCharacter(example)}`
                    });
                  } else {
                    console.log(red(`Missing ${componentsDir}/${namespace2}/${component}/__examples__/${example}/${example}.ts`));
                  }
                }
              }
              const data = await readFile2(join(srcDir, componentsDir, namespace2, component, `${component}.ts`), "utf8");
              const matches = data.match(/class (\w+) extends (\w+)/);
              if (!matches) {
                console.log(red(`Component "${namespace2}-${component}" must extend HtmlElement or base class`));
                process.exit();
              }
              metaComponent.className = matches[1];
              metaComponent.classExtends = matches[2];
              metaNamespace.components.push(metaComponent);
            }
          }
        }
        options.after(meta);
        return {
          contents: entryPoints2.join("\n"),
          resolveDir: join(process.cwd(), srcDir)
        };
      });
    }
  };
}

// scripts/createPlaygroundIndex.ts
import { join as join2 } from "node:path";
import { readFile as readFile3 } from "node:fs/promises";
async function createPlaygroundIndex({
  mode,
  rootDir: rootDir3,
  srcDir: srcDir3,
  indexFile: indexFile2,
  defaultDir: defaultDir2,
  playgroundFile: playgroundFile2,
  title: title2,
  repo: repo2,
  repoComponent: repoComponent2,
  navigation: navigation2,
  namespaces
}) {
  let indexContent = "";
  if (await fileExists(join2(rootDir3, srcDir3, indexFile2))) {
    indexContent = await readFile3(join2(rootDir3, srcDir3, indexFile2), "utf8");
  } else {
    console.log(defaultDir2, playgroundFile2);
    indexContent = await readFile3(join2(defaultDir2, playgroundFile2), "utf8");
  }
  indexContent = indexContent.replace(
    "<title>Default</title>",
    `<title>${title2 ?? "Default"}</title>`
  );
  indexContent = indexContent.replace(
    "<h1>Default</h1>",
    `<h1>${title2 ?? "Default"}</h1>`
  );
  const navItems = structuredClone(navigation2 ?? []);
  for (let navItem of navItems) {
    navItem.items = [];
  }
  let defaultItem;
  if (navItems.length === 0) {
    defaultItem = { label: "Components", items: [] };
    navItems.push(defaultItem);
  } else {
    defaultItem = navItems.find((x) => !x.extends && !x.components && !x.namespaces);
    if (!defaultItem) {
      defaultItem = { label: "Other", items: [] };
      navItems.push(defaultItem);
    }
  }
  const componentMap = /* @__PURE__ */ new Map();
  namespaces.forEach(({ components }) => {
    components.forEach(({ component, namespace: namespace2, tag, readme, examples, className, classExtends }) => {
      componentMap.set(className, {
        className,
        // MyComponent
        classExtends,
        // MyModal
        component,
        // component
        namespace: namespace2,
        // my
        tag,
        // my-component
        readme,
        // # My Component
        examples: examples.map((example) => example.className)
      });
      examples.forEach((example) => {
        componentMap.set(example.className, {
          className: example.className,
          // XMyComponentBasic
          classExtends: example.classExtends,
          // HtmlElement
          component: example.component,
          // myComponentBasic
          namespace: example.namespace,
          // x
          tag: example.tag,
          // x-my-component-basic
          example: example.example
          // Basic
        });
      });
      for (let navItem of navItems) {
        if (navItem.include && navItem.include.includes(className)) {
          navItem.items.push({
            namespace: namespace2,
            component,
            className,
            tag
          });
          return;
        }
      }
      for (let navItem of navItems) {
        if (navItem === defaultItem) {
          continue;
        }
        if (navItem.exclude && navItem.exclude.includes(className)) {
          continue;
        }
        if (navItem.namespaces && !navItem.namespaces.includes(namespace2)) {
          continue;
        }
        if (navItem.extends && !navItem.extends.includes(classExtends)) {
          continue;
        }
        navItem.items.push({
          namespace: namespace2,
          component,
          className,
          tag
        });
        return;
      }
      defaultItem.items.push({
        namespace: namespace2,
        component,
        examples,
        className,
        tag
      });
    });
  });
  indexContent = indexContent.replace(/([ ]*)<!-- \[Navigation\] -->/, (match, indent) => {
    return navItems.map(({ label, items }) => {
      return [
        indent,
        `<div>${label}</div>`,
        "<ul>",
        items.map(({ component, namespace: namespace2, tag, className }) => {
          return [
            `<li data-tag="${tag}" data-class-name="${className}" data-component="${component}"><a href="#${tag}">${component}</a></li>`
          ].join(`
${indent}`);
        }).join(`
${indent}`),
        "</ul>"
      ].join(`
${indent}`);
    }).join(`
${indent}`);
  });
  if (repo2) {
    const github = "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z";
    const generic = "M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12.75,13.5C15.5,13.5 16.24,11.47 16.43,10.4C17.34,10.11 18,9.26 18,8.25C18,7 17,6 15.75,6C14.5,6 13.5,7 13.5,8.25C13.5,9.19 14.07,10 14.89,10.33C14.67,11 14,12 12,12C10.62,12 9.66,12.35 9,12.84V8.87C9.87,8.56 10.5,7.73 10.5,6.75C10.5,5.5 9.5,4.5 8.25,4.5C7,4.5 6,5.5 6,6.75C6,7.73 6.63,8.56 7.5,8.87V15.13C6.63,15.44 6,16.27 6,17.25C6,18.5 7,19.5 8.25,19.5C9.5,19.5 10.5,18.5 10.5,17.25C10.5,16.32 9.94,15.5 9.13,15.18C9.41,14.5 10.23,13.5 12.75,13.5M8.25,16.5A0.75,0.75 0 0,1 9,17.25A0.75,0.75 0 0,1 8.25,18A0.75,0.75 0 0,1 7.5,17.25A0.75,0.75 0 0,1 8.25,16.5M8.25,6A0.75,0.75 0 0,1 9,6.75A0.75,0.75 0 0,1 8.25,7.5A0.75,0.75 0 0,1 7.5,6.75A0.75,0.75 0 0,1 8.25,6M15.75,7.5A0.75,0.75 0 0,1 16.5,8.25A0.75,0.75 0 0,1 15.75,9A0.75,0.75 0 0,1 15,8.25A0.75,0.75 0 0,1 15.75,7.5Z";
    const repoIcon = repo2.includes("github.com") ? github : generic;
    indexContent = indexContent.replace(/([ ]*)<!-- \[Repo\] -->/, (match, indent) => {
      return [
        indent,
        `<a href="${repo2}">`,
        '  <svg viewBox="0 0 24 24">',
        `    <path fill="currentColor" d="${repoIcon}" />`,
        "  </svg>",
        "  <span>View Repo</span>",
        "</a>"
      ].join(`
${indent}`);
    });
    indexContent = indexContent.replace(/const repo = '';/, (match) => {
      return `const repo = '${repo2}';`;
    });
    indexContent = indexContent.replace(/const repoComponent = '';/, (match) => {
      return `const repoComponent = '${repoComponent2.replace(/\$repo/g, repo2)}';`;
    });
    indexContent = indexContent.replace(/const repoIcon = '';/, (match) => {
      return `const repoIcon = '${repoIcon}';`;
    });
  }
  if (mode === "dev") {
    indexContent = indexContent.replace(/([ ]*)<!-- \[info\] -->/, (match, indent) => {
      return [
        indent,
        "<p>This page is generated from <code>npm start</code>. To render only specific components use <code>npm start c-button</code>.</p>"
      ].join(`
${indent}`);
    });
  }
  const classNames = [...componentMap.keys()];
  indexContent = indexContent.replace(/([ ]*)const componentMap = new Map\(\);/, (match, indent) => {
    return [
      `${indent}const componentMap = new Map();`,
      ...classNames.map((className) => {
        const data = componentMap.get(className);
        return `componentMap.set('${className}', ${JSON.stringify(data)});`;
      })
    ].join(`${indent}
`);
  });
  indexContent = indexContent.replace(/([ ]*)const navigation = \[\];/, (match, indent) => {
    return `${indent}const navigation = ${JSON.stringify(navItems, null, "  ")};`;
  });
  return indexContent;
}

// scripts/element-build.ts
var plugins = [htmlDependentsPlugin, rebuildNotifyPlugin];
var entryPoints = [];
var green2 = (text) => `\x1B[32m${text}\x1B[0m`;
var red2 = (text) => `\x1B[31m${text}\x1B[0m`;
var playgroundFile = "playground.html";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname2(__filename);
var defaultDir = join3(__dirname, "..", "default");
var indexFile = "index.html";
var srcDir2 = "src";
var componentsDir2 = "components";
var configFile = "element.config.ts";
var rootDir2 = process.cwd();
var buildDir = "build";
var fullConfigPath = pathToFileURL(configFile);
if (!await fileExists(configFile)) {
  console.log(red2("Missing element.config.ts in root."), "Add with content:");
  console.log("export default {");
  console.log(`  namespace: 'hello',`);
  console.log("}");
  process.exit();
}
var config = await import(fullConfigPath.href);
var {
  namespace,
  title,
  repo,
  repoComponent,
  navigation
} = config.default;
if (namespace) {
  console.log(green2("Building app..."));
  entryPoints.push(`./${srcDir2}/${componentsDir2}/${namespace}/app/app.ts`);
} else {
  entryPoints.push("playground-entry");
  plugins.push(
    playgroundPlugin({
      after: async (namespaces) => {
        const indexContent = await createPlaygroundIndex({
          mode: "production",
          rootDir: rootDir2,
          srcDir: srcDir2,
          indexFile,
          defaultDir,
          playgroundFile,
          title,
          repo,
          repoComponent,
          navigation,
          namespaces
        });
        await writeFile2(join3(rootDir2, buildDir, indexFile), indexContent);
      }
    })
  );
}
build({
  entryPoints,
  bundle: true,
  platform: "browser",
  outfile: `./${buildDir}/main.js`,
  sourcemap: false,
  minify: true,
  // aka production
  format: "esm",
  // Use ES Modules
  target: "es2024",
  // Target ES6 syntax
  loader: {
    ".html": "text",
    ".css": "text"
  },
  plugins
}).then(async () => {
  const faviconSvg = "favicon.svg";
  if (await fileExists(join3(rootDir2, srcDir2, faviconSvg))) {
    await copyFile(
      join3(rootDir2, srcDir2, faviconSvg),
      join3(rootDir2, buildDir, faviconSvg)
    );
  } else {
    await copyFile(
      join3(defaultDir, faviconSvg),
      join3(rootDir2, buildDir, faviconSvg)
    );
  }
}).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
