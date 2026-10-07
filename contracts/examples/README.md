# contracts/examples

The example library. One place for what the docs **Catalog** shows, what the MCP's `get_examples` serves
and what the Maker starts from. Why it is shaped this way: [ADR-0036](../../docs/decisions/0036-examples-are-patterns-and-uses-filed-by-intent.md).

## The model in one screen

| | is | written as |
| --- | --- | --- |
| **pattern** | *layout*: signatures, nesting, options, and the named fields it fills. No copy, no purpose. | `library/<subject>/<pattern>.ts`, a `build(content, ctx)` |
| **use** | *meaning*: one intent on a pattern, a purpose, and the content (`{ en, es }`) | next to its pattern, in the same file |
| **fixed** | a tree written once, whole, filed under the same taxonomy (the pages, the older hand-composed trees) | `fixed/` |

Filed on **intent** (`domain/area/intent`, `model/taxonomy.ts`) and **subject** (card, list, form…), and by
**scale** (fragment → component → composition → page). The contracts a tree uses are read off the tree.

```
model/       types, taxonomy, registry (builds both locales, derives the graph), library (what a reader sees)
library/     the patterns and their uses, one file per layout, grouped by subject
fixed/       trees that are one of a kind; pages.generated.ts is written by the Templates gallery
```

## Add a use of an existing layout

The point of the split: the same layout for another job is a use, not a new tree.

1. Find the layout: `get_examples` with `subject`, `scale` or `contract`; read `pattern.fields` of the one you like.
2. In its file, add `use({ id, intent, title, purpose, content })`. `content` fills the fields; every string a person reads is `{ en, es }`.
3. Pick the intent from `model/taxonomy.ts`; add a line there if the job is new.

## Add a new layout

1. `library/<subject>/<name>.ts`: `definePattern<Content>({ id, subject, scale, layout, fields, notes, build })`, and export `{ pattern, uses }`.
2. List it in `library/index.ts`. A file that is not listed is not published, and the gate fails it.
3. A composition holds other uses by id: `ctx.render("plan-team")`. It never copies their trees.
4. Name form controls from `ctx.ns` (the use's id): a page may show two examples side by side.

## The gate

`pnpm --filter @skryensya/ai-compiler exec vitest run src/examples.test.ts` holds every example, in both
locales, to its contracts, the accessibility review and its stylesheets; every filing to the taxonomy; and
every translated pair to both halves written. `pnpm --filter @skryensya/docs exec vitest run src/lib/catalog-view.test.ts`
checks the Catalog page imports every stylesheet the examples need.

## Elsewhere in `contracts/`

`semantic/` says when to choose each signature, `changelog/` what changed in each contract. Neither is an example.
