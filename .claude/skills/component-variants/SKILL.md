---
name: component-variants
description: Author examples for the library in contracts/examples (what the docs Catalog shows and the MCP's get_examples serves): a pattern for a layout and uses of it for each job, filed by intent. Use when asked to add variants, versions, compositions or examples of a component or UI block.
---

The library is `contracts/examples` (read its `README.md` first; the why is ADR-0036). One idea runs through every step: **layout and meaning are separate files' worth of thought.**

- A **pattern** is layout: signatures, nesting, options, and the named fields it fills. No copy, no purpose.
- A **use** is meaning: one **intent** (`domain/area/intent`, `model/taxonomy.ts`), a purpose, and the `{ en, es }` content that fills a pattern.

The same layout for another job is a new **use**, never a new tree. An example is a **fragment**, a **component**, a **composition** (holds other uses by `ctx.render(id)`) or a **page**.

## Steps

### 1. Find what exists

Ask the library before writing: `get_examples` with `subject`, `intent` (a prefix such as `metrics/`), `scale` or `contract`; fetch the likeliest by id and read its `pattern.fields`, `content` and `relations`. Read the contracts you will use (`get_contracts`, or `packages/core/src/<id>.ts`).

Done when you can say, for what you were asked, which of these is true: a layout that already fits (write a use), a layout that nearly fits (extend its fields), or none (write a pattern).

### 2. Plan the set

A table before any code: `id | scale | intent | pattern (new or existing) | purpose`.

- Each row is **distinct**: its intent or its layout is one no other row covers. Two rows that differ in a token (padding, gap, tone) are one row.
- The intent names a **job**, never a shape. Choose it from the taxonomy; when the job is new, add one line there, and a use naming an id that is not there fails the build.
- Cover the scales: small pieces first, the components built from them, then compositions that hold them.
- To clone real UI, screenshot public references first (Mobbin is behind a login; `component.gallery` lists a component across design systems, `ui.shadcn.com` shows composed blocks) with the Playwright in `apps/maker`. Take each reference's purpose and anatomy, never its skin.

Done when every row is distinct and every scale you need has a row.

### 3. Write the patterns

`library/<subject>/<name>.ts`: `definePattern<Content>({ id, subject, scale, title, layout, fields, notes, build })`; export `{ pattern, uses }`; list it in `library/index.ts`.

- **Contract-only.** Every visual decision is a published option. No `attrs.class`, no stylesheet of its own: Storybook, the Maker and the MCP render it exactly as the Catalog does.
- `layout` states the structure with no purpose in it; `fields` documents every field a new use fills; `notes` carries the composition decisions worth copying (why two Boxes, why `fill` and `fit`).
- **No copy in a pattern.** Strings arrive as content. Headings start at `h4`.
- Name form controls from `ctx.ns`; a layout primitive never goes inside a slot that renders a `<span>` (a list row's `trailing`, a switch label): pass loose nodes or `inlineText`.
- When a layout needs something no contract publishes, write a **contract gap** note (what it needs, which contract would own it) and build the nearest honest version. A gap is a finding for the report, never a local workaround.

### 4. Write the uses

`use({ id, intent, title, purpose, content, related? })` beside its pattern.

- Content is generic and real (account, plan, invoice, team), every string a person reads as `{ en, es }`. Proper nouns and figures stay plain.
- A use that only exists to sit in a composition gets `catalog: false`; it is still served by the MCP.
- `subject` on a use files it under another subject than its pattern's (a grid is a card pattern; a grid of panels is a list example).
- `related` is for a **judgement only** ("prefer that one when…"). Same layout, same intent, containment and structural kinship are derived: do not write them.

Done when each use names an intent from the taxonomy and fills every field of its pattern.

### 5. Gate

```sh
pnpm --filter @skryensya/ai-compiler exec vitest run src/examples.test.ts
pnpm --filter @skryensya/docs exec vitest run src/lib/catalog-view.test.ts
pnpm --filter @skryensya/docs exec astro check
```

The first holds every example, in both locales, to its contracts, the accessibility review and its stylesheets; every filing to the taxonomy (an intent nothing is filed under fails); and every pair to both halves written. The second fails naming a stylesheet the Catalog page does not import: add it to `CatalogPage.astro`.

Read each review warning and each validator advisory (a `<div>` in a `<span>` slot is invalid HTML the gate lets through) and fix it or say why it stands.

Done when all three are green.

### 6. Render and look

Validity is not appearance. Docs dev server (`pnpm --filter @skryensya/docs dev:bg`, port 4173), open `/catalog#<id>`, screenshot at 1280px and 390px (`pnpm --filter @skryensya/maker exec playwright screenshot --viewport-size=390,844 --full-page <url> <out.png>`, or a script on `@playwright/test`). Read each screenshot.

Done when each example shows its purpose at both widths: no horizontal overflow, no clipped text, no word broken mid-way, compositions that reflow instead of squeezing.

A defect any composition would show (a figure in the code font, an overlay stretching its chips, a default value the CSS only honours when written as an attribute) is the **component's**: fix it in `packages/core/css`, run `pnpm --filter @skryensya/core exec vitest run`, and drop any workaround a pattern carried. A defect only this arrangement has is the pattern's.

### 7. The MCP

After a change to the library, rebuild the server the tests spawn: `pnpm --filter @skryensya/mcp build`, then `get_examples` the new id and confirm its `relations` say what you meant (`sameLayout` for the layout's other jobs, `sameIntent` for the job's other layouts).

### 8. Report

List what was added (id, scale, intent, pattern, purpose), which uses reuse an existing pattern, review warnings left standing with their reason, and every contract gap.
