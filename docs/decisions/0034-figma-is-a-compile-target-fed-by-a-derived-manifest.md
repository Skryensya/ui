---
num: 34
title: Figma is a compile target fed by a derived manifest
short: "Figma, downstream"
summary: >-
  Figma receives the design system; it never defines it. A compiler reads the contract, its
  stylesheets through a simulated cascade, and the token graph, and writes a Figma manifest; a
  local plugin reconciles a file against that manifest by tags, never by names. Only a small Figma
  realization is authored, and it may not restate anything Core declares.
---

A Figma library is usually drawn by hand and kept in step with code by review. That makes it a
second source of truth for option values, defaults and colours, and the two drift. Skryensya
already has one author for all of that, Core (decision 13), so Figma is treated like a binding
that happens to be a file: `packages/figma` compiles `artifacts/figma-manifest.json` from the
contract, the stylesheets and the tokens, and a local plugin reconciles a Figma file against it.
Removing the package leaves every other part of the system untouched.

Three choices in it are not the obvious ones:

- **Per-cell values come from simulating the cascade, not from a token lookup or a browser.** A
  styling hook has one name and a value per selector, so "the background of a soft danger button"
  is a cascade question. A browser answers it with literals and loses the aliases; a lookup cannot
  answer it at all. The compiler runs the contract's own sheets through jsdom and postcss, with
  var() chains intact, so a layer binds to the token its hook points at, and a formula becomes a
  component variable that still names the tokens it mixes.
- **Formulas are evaluated under a stated evaluation context, never approximated.** Figma variables
  hold literals and aliases. A density-scaled length or a colour-mix is evaluated against recorded
  assumptions (density 1, frost on, a hover-capable pointer), and anything outside the supported set
  is reported, not guessed.
- **Only the Figma realization is authored.** Which option splits into sets, which booleans fold
  into a state axis, what a slot holds: a few lines per component, each stating why Core cannot say
  it, and a test proving it names no option value.

The Button slice proved the lifecycle: a second sync writes nothing, a token change writes only
variables, and a contract change creates new variants in place and leaves existing ones untouched.
See [the POC report](../figma-button-poc.md), which also lists what must change before a second
component.
