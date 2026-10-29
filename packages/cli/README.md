# @skryensya/cli

Connects skryensya/ui to a project. It never copies component source: it writes one managed
stylesheet and installs the packages, the same two things you would do by hand.

## Install

The CLI is a GitHub Release asset like the rest of the kit, and it versions with it: `skryensya --version` is the
release it belongs to, and `add` installs the packages of that same release.

```bash
npx https://github.com/Skryensya/ui/releases/download/v0.0.3/skryensya-cli-0.0.3.tgz add button
```

```
skryensya list [--category <name>] [--json]    the catalog
skryensya info <name>                           CSS, imports and extra packages of one entry
skryensya add <name> [<name>...]                add it to this project
```

`add` options: `--framework <next|astro|react-router|tanstack-start|vite>`, `--binding <react|vanilla>`, `--dry-run`, `--no-install`,
`--cwd <dir>`.

## What `add` does

1. Finds the framework (or takes `--framework`) and asks its **adapter** where the stylesheet goes and
   how it reaches the page.
2. Writes that stylesheet whole, from the list of components added so far (it is cumulative and
   idempotent: the same command twice changes nothing).
3. Installs what is missing with the project's own manager (pnpm, npm, yarn or bun, read from the
   `packageManager` field or the nearest lockfile): the binding (`@skryensya/react` or `vanilla`) and a
   third-party peer when an integration needs one. **Never `@skryensya/core`**: the binding brings it
   and re-exports its stylesheets under `css/`, which is what the managed file imports.
4. Prints how to use each entry and what is left to do by hand (the one import that wires the
   stylesheet, a client directive, an integration to register).

## Adapters

One file per framework in `src/frameworks/`, implementing `FrameworkAdapter`: `detect`, `defaultBinding`,
`cssFile`, `wiring`, `notes`. Commands never ask which framework it is, so a new one is a new file and a
line in `frameworks/index.ts`.

| Framework | Stylesheet | Imported from | Default binding |
|---|---|---|---|
| Next.js | `app/skryensya.css` (`src/app/…`, or `styles/…` on the pages router) | `app/layout.tsx`, or `pages/_app.tsx` | react |
| Astro | `src/styles/skryensya.css` | a layout in `src/layouts/` | react with `@astrojs/react`, else vanilla |
| React Router (framework mode) | `app/skryensya.css` | `app/root.tsx` | react |
| TanStack Start | `src/styles/skryensya.css` | `src/routes/__root.tsx` | react |
| Vite | `src/skryensya.css` | `src/main.tsx` (or `index.tsx`) | react if the project has it, else vanilla |

When a project matches several, the most specific wins: a meta-framework outranks the Vite under it, so a
TanStack Start app is not mistaken for a plain Vite one. Two equally specific frameworks in one
`package.json` are reported as ambiguous and need `--framework`. Frameworks that run on Vite but are
not supported yet (SvelteKit, Nuxt, Solid Start…) are not treated as plain Vite: the CLI says it does
not support them instead of writing a stylesheet nothing imports.

## The catalog

Read from `@skryensya/core/install-manifest.json`, generated from the contracts and the stylesheets
(so it cannot drift), plus the integrations (`hook-form`, `data-table`). `build` inlines it into
`dist/cli.js`: the published CLI has no runtime dependencies and works offline.
