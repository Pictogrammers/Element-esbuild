# Element-esbuild

Element [esbuild](https://esbuild.github.io/) tooling for developing Web Components with the [Element](https://github.com/Pictogrammers/Element/) utility.

## Features

- Application - Bundle a single application
- Components - Bundle a shared component library
  - `__examples__` components map to the library

Default folder structure for both:

- `src/index.html` - optional
- `src/favicon.svg` - optional
- `src/components/*` - required
  - `namespace/` - required
    - `app/app.ts` - required for app
      - `__examples__`
        - `basic/basic.ts` - for component library

## `element.config.ts`

Example configuration for a app.

```typescript
export default {
  // root hello/app/app.ts
  namespace: 'hello', // for applications
}
```

Example configuration for a component library.

```typescript
export default {
  repo: 'https://...',
  navigation: [{
    label: 'Components',
    // default group
  }, {
    label: 'Overlays',
    extends: ['MyOverlay'], // group all components extend class
    include: ['MyOverlay'], // also include MyOverlay component
    exclude: ['MyExclude'],
    namespaces: ['my'], // filter to only my-* components
  }],
}
```

Leaving off the `namespace` will treat the repo as a component library. Each component will be built individually instead of a single application. The component's `__examples__` folders will render as demo.
