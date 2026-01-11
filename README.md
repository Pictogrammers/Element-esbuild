# Element-esbuild

Element [esbuild](https://esbuild.github.io/) tooling for developing Web Components with the [Element](https://github.com/Pictogrammers/Element/) utility.

## Features

- Application - Bundle a single application
- Components - Bundle a shared component library

Default folder structure for both:

- `src/index.html` - optional
- `src/favicon.svg` - optional
- `src/components/*` - required
  - `namespace/` - required
    - `app/app.ts` - required for app

## `element.config.ts`

Example configuration options.

```typescript
export default {
  // root hello/app/app.ts
  namespace: 'hello', // for applications
}
```

Leaving off the `namespace` will treat the repo as a component library. Each component will be built individually instead of a single application.
