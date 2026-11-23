---
name: skryensya-ui
description: Builds interfaces with skryensya/ui (@skryensya/react, @skryensya/vanilla): choosing components, composing them as a usage tree, validating and reviewing it, emitting React or HTML, and making the page operable by agents with @skryensya/core/agent. Use whenever a project has @skryensya/* installed, the skryensya-ui MCP tools are connected, or the user mentions skryensya/ui.
---

# Build with skryensya/ui

skryensya/ui is a design system whose **contract** is the source of truth: each component is one contract that renders the same DOM in React (`@skryensya/react`) and in plain HTML enhanced by Vanilla (`@skryensya/vanilla`). You do not write components by hand. You propose a **usage tree** (data: which signature, its options, attrs, slots, children), the kit validates it against the contract and emits the code. Code you write without that check looks plausible and is wrong.

## Pick your path

1. **The skryensya-ui MCP tools are connected** (`discover_ui`, `get_contract`, `validate_ui`, `review_ui`): follow the server's instructions. They are the loop; this skill adds only steps 3 and 4 below.
2. **No MCP**: read [references/compose.md](references/compose.md). It covers the installed docs and the CLI's `validate`/`review`, which answer from the same code the MCP does.

Every path ends the same way:

3. **Make it agent-ready**: [references/agent-ready.md](references/agent-ready.md).
4. **Check it** (below).

## Rules for every path

- **The tree is the source.** Change the tree and validate again; never patch emitted markup or JSX by hand. Use emitted React, its data file and its HTML as they come, and import every stylesheet the result lists.
- **Choose by useWhen.** Prefer the signature whose useWhen fits over one whose avoidWhen names your case. When nothing fits a shape, use a layout primitive (`Stack`, `Inline`, `Grid`, `Box`) with an intentional gap.
- **Four fields, easily confused.** `options` are values the signature declares (`variant`, `href`); `attrs` go to the host element untouched (`aria-label`, `id`); `slots` are named content or a collection (`items: [{ options, slots }]`); `children` is the children slot.
- **Name every control.** A FormField's label, the component's own `label` slot, its text, or `attrs: { "aria-label": … }`. People using screen readers and agents both find controls by name.
- **The kit's widget, never a role.** Before giving anything `role="listbox"`, `"menu"`, `"dialog"`, `"tablist"`, `"switch"`, `"slider"`, `"radiogroup"`, `"toolbar"` or `"tree"`, find the component in `choose.md`: a role on a Box is a promise of keyboard behaviour nothing keeps.
- **Style through hooks.** Override a component's `--sk-*` custom properties (each family page lists them) and pick values from its options (`appearance`, `variant`, `tone`). Restyling its classes breaks with the next release.
- **Install from the release.** The packages are GitHub Release tarballs, not npm packages yet. Install them with the URLs at https://ui.skryensya.dev/installation. Then `skryensya add <names>` (the CLI from the same release) wires each component's CSS and packages and prints the setup its binding needs.

## When you're done

1. **Review** the whole page: `review_ui`, or `skryensya review page.json`. Fix every error (each is an accessibility failure the tree causes); weigh the warnings.
2. **Typecheck** the project and run its tests, including the agent test from agent-ready.md.
3. **Look at it.** Validation proves conformance to the contract, not appearance: render the page and check contrast, focus and reflow where it is drawn.
4. **Report** each command you ran with its exit code, what you could not check, and anything the docs or contracts got wrong.
