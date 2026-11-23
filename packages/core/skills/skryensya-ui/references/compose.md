# Compose without the MCP

The same loop the MCP runs, from files and one CLI.

## 1. Read the installed docs

They ship in `@skryensya/core` and match the installed release:

- `node_modules/@skryensya/core/docs/llms.txt`: the index. Read it first.
- `docs/choose.md`: the person needs to → use, one row per signature. Pick from it.
- `docs/components/<family>.md`: one family. Read only the families you picked. Each page has, per signature, its useWhen and avoidWhen, where it nests, its options, its slots, how it is named, and an emitted example in React and HTML.

Read the docs and the TypeScript types as the API. `dist/` and `src/` are implementation and change without notice.

## 2. Write the tree

A usage tree is JSON. Start from the example on the family page and replace its content; keep its structure.

```json
{
  "contract": "form-field",
  "signature": "FormField",
  "slots": { "label": "Project name" },
  "children": { "contract": "input", "signature": "Input", "options": { "name": "name" } }
}
```

`contract` is the family id (the page's file name), `signature` the heading on its page. A whole page is one tree: a layout signature at the root (`AppShell`, `Stack`, `Main`), everything else nested in `children` or slots.

## 3. Validate and emit

```sh
npx skryensya validate page.json          # React and HTML when valid; the problems when not
npx skryensya validate page.json --json   # the same answer validate_ui gives, as JSON
```

Invalid: fix every problem in the tree and validate again; nothing is emitted. Valid: write the React component, the data module it imports when there is one, or the HTML, exactly as printed, and import every stylesheet in the list.

## 4. Wire it into the project

- **React**: nothing to mount. Each component wires itself up when it renders.
- **Vanilla**: call `initComponents()` from `@skryensya/vanilla` once the page loads. It enhances every component already in the DOM and downloads only their code. After adding markup later (a dialog, a route), call it again with that element.
- **Stylesheets**: through the binding's `css/` folder. Import `tokens.css` once, then each sheet the validator listed with `@skryensya/core/` swapped for `@skryensya/react/css/` (or `@skryensya/vanilla/css/`): `@skryensya/core/components/button.css` becomes `@skryensya/react/css/components/button.css`. `skryensya info <family>` prints a family's sheets in load order and its imports.

## 5. Review

```sh
npx skryensya review page.json
```

Errors are accessibility failures the tree causes: fix them, style never outranks them. Warnings are design smells (competing primary actions, a table with no row headers, a destructive action with no person in the loop): weigh each and keep the ones you decide on.
