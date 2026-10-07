---
num: 36
title: Examples are layouts and meanings, filed by intent, in one library
short: "Example library"
summary: >-
  The examples an agent copies, the Catalog a person browses and the pages the Maker starts from are one
  library in `contracts/examples`. A pattern is layout only; a use is one intent put on a pattern, with
  its content in both languages. Every example is filed on a three-level intent taxonomy and a subject,
  its components are read off its tree, and the graph between examples (same layout, same intent,
  containment, structural kinship) is derived, so the MCP can answer "what else is this shape good for"
  and "what are the other ways to do this job".
---

`contracts/snippets` held 26 hand-written trees plus the Templates' pages, each a finished UI with its
words in it. That made two things impossible. An agent that liked a layout but needed it for another job
had to read a quota card and imagine a balance card, because the layout and the meaning were one tree.
And an agent asking "how do I show how much of a limit is used" could only match the sentence, because
nothing said what an example was FOR beyond that sentence.

The docs Catalog then grew its own copy of the same idea (three subjects, forty-seven variants) under
`apps/docs`, where the MCP could not reach it.

## Two halves, kept apart

- **A pattern is layout.** Which signatures, nested how, with which options, and the named fields it
  fills. It carries no copy and says nothing about purpose: "a labelled figure, a meter under it and a
  quiet note beside a ghost action" holds a storage quota or a seat count equally well.
- **A use is meaning.** One intent from the taxonomy, a sentence for when a page picks it, and the
  content, every string either plain (a proper noun, a figure) or `{ en, es }`. A use never writes a
  tree: the pattern's `build` does, from the use's content.

One pattern has many uses, and one intent has many uses on different patterns. A composition holds other
uses by id and renders them (`ctx.render`), never copies them, so a fix to a card reaches every
composition that contains it, and containment is a fact the graph reads instead of a field someone keeps.

A **fixed** example is the third kind: a tree written once, whole, filed under the same taxonomy. The
pages and the older hand-composed trees are fixed. A tree that is one of a kind has no layout to separate
from its meaning; when one earns a second use or a Spanish copy it becomes a pattern with its first use.

## Filed on two axes, the third derived

- **Intent**: what the reader is trying to do, `domain/area/intent`. The id is the path, so a prefix is
  a query. An intent names a job, never a shape. Adding one is a line in `model/taxonomy.ts`, and a use
  naming an id that is not there fails the build, as does an intent nothing is filed under.
- **Subject**: what a person would call it (card, list, form, hero…). It groups the Catalog; it does not
  constrain which contracts a use employs.
- **Components**: the contract families the tree touches, read off the tree by the walker in Core, so
  "what do we have that uses Meter" cannot drift.

## The graph is derived

Same layout (uses of one pattern), same intent (other patterns, the alternatives), containment, and
structural similarity are computed. Similarity weighs a signature by how rare it is: unweighted, every
card is like every other because they all share Box, Stack, Heading and Text. Only a judgement is
written, as `related` on a use: "prefer that one when…", or why two things only look alike.

## One reader

`library` (in `@skryensya/examples`) is the registry with every pair resolved to one locale. The MCP's
`get_examples` filters it by intent prefix, subject, scale, pattern, contract and words, and returns
with an id the tree, the pattern's fields, the use's content and the relations. The Catalog page and the
Maker read the same. The gate is one test (`ai-compiler/src/examples.test.ts`): every tree against its
contracts, its review and its stylesheets in both locales; every filing against the taxonomy; every
translated pair with both halves written.

## What this costs

An example is more to write: a pattern, its fields and a use, instead of a tree. That is paid back the
second time a layout is used, and the first time is no worse than the tree it replaces. `snippets`
(a flat English list) still exists, derived, so the consumers that only need a tree are not rewritten in
the same change.
