# Writing guide

This guide describes **how** things are written: register, grammatical person, punctuation, page
structure, and what changes between Spanish and English. It is not the glossary.
[`CONTEXT.md`](../CONTEXT.md) decides **which word** names each concept, with its own `_Avoid_`
lists, and remains the only authority on terminology. This guide never redefines a term; if an
example here contradicts `CONTEXT.md`, `CONTEXT.md` wins or changes, but the two never coexist.

Every rule here comes from a real file in this repository or from a measured comparison with five
public design systems, cited. Where current practice is inconsistent, the guide says so and counts it.

## Which language where

[Decision 21](decisions/0021-english-is-the-repository-language-and-spanish-is-a-product-locale.md)
settles this with one question: is the artifact addressed to a reader of the product, or to a
contributor? Product-facing text is a locale and is written in both languages; everything else is
English, in one copy.

| Content | Language | Where |
|---|---|---|
| Docs site prose and demo copy | Spanish and English, both written by hand | `apps/docs/src/i18n/messages/**`, an `es` and an `en` block per file |
| Contract changelog | Both, in one file | `contracts/changelog/*.yaml`, `es:` and `en:` keys |
| Contract judgment (`useWhen`, `avoidWhen`) | English | `contracts/semantic/*.yaml` |
| Decision records, `docs/**`, `CONTEXT.md`, `README.md` | English | this file |
| Code, comments, identifiers, package metadata | English | everywhere else |
| Commit messages | See [`CONTRIBUTING.md`](../CONTRIBUTING.md#commit-messages) | not decided here |

A page's two locales share everything structural (`components/pages/<Name>Page.astro`, the layout,
the rail) and differ only in their message block. Prose is translated, never machine-generated:
decision 21 rejected machine translation for judgment prose because an adequate translation turns a
decision into a description.

## Shared voice

This does not change with the language:

- **No filler.** No "in this article we will see", no "it is important to note", no motivational
  closings. Every sentence carries a decision or a fact.
- **Name the mechanism, not only the conclusion.** Not "this is safer", but why: what breaks without
  the rule and what prevents it.
- **One concept, one name.** If `CONTEXT.md` named something, that name is the only one used, never a
  synonym to vary the prose.
- **Real examples, never `foo`/`bar`.** Examples save, cancel, delete, download, configure: actions
  that exist in real interfaces. An invented example does not prove the pattern works.
- **Numbers and names, not adjectives.** "4.5:1 against the background (WCAG 2.2, 1.4.3)", not "good
  contrast". Words that are never used: powerful, flexible, robust, intuitive, simply, easily, "all
  you have to do", and their Spanish equivalents.

## Register by genre

Grammatical person depends on what kind of document it is, not on who writes it:

- **Component pages and tutorials** address the reader directly, in the second person and the
  imperative: "Usa `ghost` en barras o filas donde la caja sobra" (`button.ts`).
- **Reference and rules** (`CONTEXT.md`, decision records, this guide) are impersonal. They describe a
  system; they do not accompany anyone.

Mixing the two inside one document is the error to avoid: it breaks the signal of what kind of
document is being read.

Component pages carry a second split, by tab, described in [Two registers](#two-registers).

## Component pages

### What the comparison found

On 2026-09-30 the copy of our component pages was compared with six equivalent pages (button, text
input, dialog, checkbox, tabs, alert) in five systems:
[GOV.UK](https://design-system.service.gov.uk/components/),
[Carbon](https://carbondesignsystem.com/components/overview/components/),
[DSFR](https://www.systeme-de-design.gouv.fr/version-courante/fr/composants),
[Singapore Government DS](https://www.designsystem.tech.gov.sg/components/button) and
[Material 3](https://m3.material.io/components). Sources were read from each project's repository
where the site blocked downloads (Carbon MDX, GOV.UK Markdown, DSFR Markdown). On our side, all 108
files under `i18n/messages/components`, in both locales. The metrics are regex counts over prose only,
without headings, tables or code: good for orders of magnitude, not decimals.

| Corpus | Words per sentence | Imperative openers | Sentences with code | End user, per 1000 words | should + must, per 1000 |
|---|---|---|---|---|---|
| GOV.UK | 18.9 | 21% | 11% | 25.0 | 8.7 |
| Singapore DS | 12.5 | 43% | 0% | 15.9 | 3.7 |
| Carbon | 16.2 | 8% | 5% | 14.2 | 7.7 |
| Material 3 | 14.6 | 14% | 0% | 11.0 | 8.8 |
| DSFR (French) | 16.9 | 31% (infinitive) | 21% | 7.2 | n/a |
| Ours, Guidelines tab | 11.0 | 31% | 4% | 6.0 | 2.4 |
| Ours, everything else | 14.6 | 8% | 39% | 0.6 | 0.7 |

What it says:

- **Our Guidelines tab already writes like the references**: short sentences, imperative rules, almost
  no code, and do/don't pairs that give their reason ("Si todas las etiquetas destacan, ninguna
  destaca", `badge.ts`).
- **That tab is 7% of our words.** The other 93% almost never names the person using the interface
  (0.6 per 1000 words against 7 to 25), and 12% of its sentences have an identifier as subject, against
  0 to 4% elsewhere. That register is right for readers who integrate the component; the problem is
  that it is the first thing every reader sees.
- **Sections the five systems have on 6 of 6 pages, and we do not:**

| Section | The five systems | Ours |
|---|---|---|
| When to use / when not to use | 6/6 in GOV.UK, Carbon, DSFR, Singapore; inside Usage in Material 3 | 20 of 108 pages (`guide.use*`, `guide.avoid*`) |
| Guidance for the component's own text | Carbon "Content" 6/6, DSFR "Règles éditoriales" 6/6, Material 3 "Label text" 5/6 | No section; a few pairs (Input, Dialog, Badge, Tooltip) |
| Accessibility section | Carbon, DSFR, Singapore 6/6; Material 3 5/6; GOV.UK inside every rule | 49 of 116 pages have the tab |
| Guidance first | GOV.UK, Carbon, DSFR, Singapore open on guidance | Only Material 3 opens, like us, on an overview |

### Page structure, by tab

The tabs are those of `ComponentPageShell.astro`. What goes where:

1. **Page header.** The lede, whose first sentence is the task the component solves (see
   [Ledes](#ledes)). No page ships without one; 12 of 108 do today (accordion, breadcrumb, callout,
   empty-state, file-upload, megamenu, menu, number-field, popover, split-button, toolbar,
   typography).
2. **Overview (Resumen).** Base example, anatomy, options, then examples from simple to complex
   ([below](#examples-go-from-simple-to-complex)). Native variants and advanced alternatives come after
   the main path, marked as such. The technical register is allowed here.
3. **Guidelines (Guía de uso).** In this order:
    1. Purpose in one sentence (`guidelinesLede`), not a repeat of the lede and not a setup procedure.
    2. When to use and when not to use, consistent with `useWhen`/`avoidWhen` in the semantic contract.
       Every "not" ends in the alternative: "Una lista de acciones que cuelga de un botón es un Menu"
       (`dialog.ts`).
    3. Do/don't pairs about a real interface, never about the demo on the page.
    4. Content, for every component that carries text: how to write its label, title, message or
       placeholder.
4. **Reference (Referencia) and Changes (Cambios).** Generated from the contract; no hand-written prose.
5. **Accessibility (Accesibilidad).** Required for every interactive component, in three parts: what
   the component already does, what is left to the author, and a Key / Action table.
6. **Installation and Style hooks.** Unchanged: install, CSS, vanilla init, contract notes, React,
   `StylingHooks` last.

### Ledes

The first sentence of the lede says what the component does for the interface, in terms of the task.
How it is built goes in the second sentence or in Reference. Of the 96 current ledes, roughly 48 open
with the task, 35 with the implementation, 7 with what the component is not, 2 with the tour of the
page and 4 with a count ("Tres formas de elegir un color").

| Write | Instead of |
|---|---|
| "Dialog detiene la página hasta que la persona decide algo." | "Un `<dialog class="sk-dialog">` centrado." |
| "Una ventana es para lo que tiene que quedar abierto mientras sigues trabajando: una paleta de herramientas, un inspector, un chat." (`window.ts`) | "Sobre @zag-js/password-input, la misma máquina en las dos capas." (`password-input.ts`) |

The purpose sentence usually exists already: it is the page's `guidelinesLede`, one tab away. For
Dialog the fix is to swap the order. A lede that defines by contrast ("Canvas no es un lienzo…")
keeps the contrast as its second sentence, after the task. A lede that announces the tour of the page
(`tabs.ts`) moves the tour into the Overview body.

### Two registers

- **Guidelines** is about the person and the task. The subject of a sentence is the person, the
  interface or the component by name, never a prop: "Dialog detiene la página…", not "`open` bloquea…".
- **Overview and Reference** are about the implementation. Identifiers as subjects are fine:
  "`variant` decide qué tan fuerte se ve el botón".

The person using the final interface is "la persona" or "quien…" in Spanish and "people" or "the
person" in English, as Material 3 does. Not "el usuario" / "the user": the reader of the docs is also a
user, of the library. Ten message files still say "el usuario".

### Guidelines content

- **A rule and its reason, together.** "Usa un solo `accent` por región. Si todo es la acción
  principal, nada lo es." GOV.UK does this on every rule; it is the pattern our best pairs already
  follow.
- **All the reasons, when there are several.** Our Input says the placeholder "desaparece al escribir";
  GOV.UK adds that not every screen reader announces it. The accessibility reason is the one that must
  not be dropped.
- **A pair is about the product.** "No pongas dos `solid` + `accent` en la misma fila" is a rule; "Compara
  el disparador destructivo con la confirmación destructiva" (`button.dd.emphasis.do`) describes the
  demo.
- **Pair titles are rules that read alone**: "Vistas, no pasos", "Informa, no se presiona", "Un
  contador con tope".
- **Content guidance per component with text.** For controls: an infinitive verb plus its object
  ("Guardar cambios"), a bare verb only for common actions ("Cancelar", "Cerrar"), 1 to 3 words on
  one line (`button.css` keeps a label on one line; `button-single-line.test.ts` guards the docs),
  sentence case, never naming the control or its position ("Botón de enviar", "el botón de abajo"),
  never repeating the instruction next to it, and naming the cost on a destructive confirmation
  ("Borrar para siempre", not "Aceptar"). For fields: a visible label, never a placeholder in its place.

### Force levels

Each level always uses the same words, so the reader tells an obligation from advice without
thinking about it.

| Level | When | Spanish | English | Example |
|---|---|---|---|---|
| Required | Breaking it breaks accessibility or the contract | Debe / No + verb | Must / Do not | "Un botón solo icono debe tener nombre accesible." |
| Recommended | Breaking it makes the interface worse | Usa / No uses | Use / Do not use | "No uses dos `solid` + `accent` a la vista." |
| Judgment | Depends on context | Considera / Prefiere | Consider / Prefer | "Considera `ghost` en filas con más de tres acciones." |

In English, "Do not", never "Don't", as GOV.UK writes it and as our English copy already does.

### Headings

A heading names its topic first; the thesis may follow a colon. GOV.UK headings are tasks or rules
("Avoid placeholder text", "Do not disable tabs"), which scan. Ours are often theses ("El rótulo no es
del Input", "Sigue siendo el dialog"), which read well but cannot be found in a table of contents.
The "topic: thesis" form already exists in our copy ("`format`: la validación que el navegador no
trae") and keeps both: "Etiqueta: la pone FormField".

Headings are written in the page's language: "Showcases" appears in 103 Spanish message files and
becomes "Ejemplos".

### Examples go from simple to complex

The rule is not "start easy, end hard" as a tutorial convention. **Each example more complex than the
previous one exists because it demonstrates a capability a real use needs**, never to add variety or
to cover props for completeness.

The model is `tabs.ts`, with three numbered examples:

- **`1. Básico`**: two triggers, two panels, nothing else. The minimal real case: "Resumen" and
  "Actividad".
- **`2. Estados e iconos`**: adds icons and a disabled tab, and the disabled tab has a product reason
  in the copy: "Los ajustes estarán disponibles después de aprobar la solicitud."
- **`3. Orientación y estado`**: adds vertical orientation and manual activation, tied to a workspace
  settings scenario where moving focus with the arrows must not trigger a heavy panel change.

**The test before adding a more complex example**: if the real scenario that needs the new prop or
variant cannot be named in one sentence, the example has not earned its place. "To show that it
exists" is not a scenario.

**Numbered headings** mean the page tells one continuous story. When sections are independent facets
(Button's variants, sizes, icon, icon only, as a link), they are not numbered, but they still go from
the most common to the most specialized.

**Advanced or optional alternatives are marked as such and say what they add.** Dialog presents
`Confirm` first and only then "Opción: Dialog Vaul", with a "Qué añade" section. Native alternatives
follow the rule `CONTEXT.md` sets for `Native alternative`: documented separately and secondarily,
after the enhanced path (Accordion's "Details nativo", Select's "Select nativo").

### Template

Button, rewritten with these rules:

````markdown
# Button

Button ejecuta una acción en la página: enviar un formulario, guardar, confirmar o descartar.
Es el <button> nativo con styling hooks, un enhancer vanilla mínimo y un componente React.

## Resumen
[Ejemplo base: "Guardar cambios"]
### Anatomía
### Énfasis: `variant` decide qué tan fuerte se ve
- Usa `solid` para la acción principal o una confirmación.
- Usa `soft` para una acción visible pero secundaria.
- Usa `ghost` en barras o filas donde la caja sobra.
### Acción destructiva: el disparador y la confirmación no pesan igual

## Guía de uso
Un botón hace algo aquí; si lleva a otro lugar, es un enlace.
### Cuándo usar
- Para una acción que cambia algo en la página: guardar, enviar, confirmar.
### Cuándo no usar
- Para ir a otra página: usa Button.navigation.
- Para una acción secundaria dentro de un párrafo: usa Link.
### Una sola acción principal
Hazlo: un `accent` por región, el resto `neutral`.
Evítalo: dos `solid` + `accent` en la misma fila. Si todo es la acción principal, nada lo es.
### Contenido
- Empieza con un verbo en infinitivo: "Guardar cambios", no "Cambios".
- En la confirmación destructiva, di el costo: "Borrar para siempre", no "Aceptar".

## Accesibilidad
### Lo que ya hace
- Renderiza un <button> nativo, o un <a> cuando recibe href.
### Lo que te toca
- Un botón solo icono debe tener aria-label.
### Teclado
| Tecla | Acción |
| Enter, Espacio | Activa el botón |
````

## Spanish

### Person: tú, never vos or usted

When a document addresses the reader, the form is **tú** (`usa`, `necesitas`, `quieres`). Never
**usted** (distant, does not fit the direct tone) nor **vos** (Rioplatense regionalism). The voseo was
swept on 2026-09-14: imperatives like `probá`, `usá`, `elegí` became `prueba`, `usa`, `elige`.

The vocabulary that came with it was not fully swept. As of 2026-09-30, in
`i18n/messages/components`:

| Word | Files | Replace with |
|---|---|---|
| acá | 9 | aquí |
| recién | 9 | solo, apenas, hasta que |
| de a una / de a uno | 3 | una a una, de una en una |
| chico (size) | 6 | pequeño |
| grilla | 11 | cuadrícula (open: "grilla" is common in Latin America) |

A new slip is an inconsistency to fix, not a second valid register. A vocabulary guard like
`no-em-dash.test.ts` would keep these from coming back.

### Accents and punctuation

- **"solo" never takes an accent** (RAE, 2010). "sólo" appears in 63 message files.
- **No em dash** (U+2014); `no-em-dash.test.ts` rejects it. Its replacement is a colon, commas or
  parentheses, never a spaced hyphen: seven files carry "  -  " where a dash used to be ("un texto
  corto  -  casi siempre una URL  - ", `qr-code.ts`).
- **Curly quotes** (`“…”`) to cite a word as a mention rather than a use, never straight ones.
- **Bold** on the first mention of a term the paragraph explains; *italics* for the word being
  defined.

### Code-switching: what is translated and what is not

A Spanish paragraph may name English concepts in the same sentence without marking them as quotes
("Button es un componente estático").

**Never translated** (identifiers, or proper names fixed by `CONTEXT.md`):

- Component or pattern names: `Button`, `TileButton`, `Vaul`, `Avatar`.
- Prop, class, attribute or file names: `data-icon-only`, `sk-interactive`, `button.css`.
- Terms fixed by `CONTEXT.md`: `styling hook`, `state layer`, `enhancer`, `machine`, `ramp`.

**Always translated** (content, not identifiers):

- Visible demo copy: `Guardar`/`Save`, `Cancelar`/`Cancel`.
- Accessible text: `aria-label="Configuración"` on a Spanish page, `aria-label="Settings"` on the
  English one. The accessible name follows the language of the page that shows it.
- Prose, connectors, explanations, headings.
- Plain English words that have a Spanish equivalent and are not `CONTEXT.md` terms: "Showcases"
  (103 files) becomes "Ejemplos", "patterns" (11) "patrones", "browser" (2) "navegador", "feedback"
  (4) "respuesta" or "aviso", "scrollea" (6) "se desplaza".

### List punctuation

A bulleted list takes one of two forms, depending on whether the items are one sentence split up or
independent sentences:

- **One sentence split into items**: each item ends in a semicolon, the second to last adds "; y", and
  the last closes with a period.
- **Independent statements**: each item is a full sentence with its own period, no closing "y".

Mixing the two is the error to avoid.

## English

The English pages mirror the Spanish register: direct, second person where the genre calls for it,
no filler, no marketing adjectives. "Avatar is the visual token for a person or entity" states what a
thing is and moves on. No contractions: "Do not", "does not", "it is". Component names are proper
nouns, never translated and never lowercased mid-sentence. Curly quotes; American punctuation, with
the period inside a closing quote and a serial comma in lists of three or more.

## Code block labels

The `label` of a `CodeBlock` or `ComponentPreview` names the language or artifact (`CSS`,
`JavaScript`, `HTML`, `terminal`), never with a possessive ("tu CSS", "your JS"). Languages with a full
name and an abbreviation use the full name: `JavaScript`, not `JS`.

The label is not only text: `CodeBlock.astro` infers the highlighting language from it when `lang`
is not passed (it looks for `CSS`, `React`, `JavaScript`, `TypeScript`). A label that is none of the
recognized names needs an explicit `lang`, or highlighting falls back to `html`.

A descriptive label is fine when the example asks for it (`una instancia`,
`components/button.css`); the rule is against the possessive and the abbreviation. It does not apply
to an `aria-label` inside a demo, which is interface content and follows code-switching.

## Decision records (`docs/decisions/`)

A decision record is the record of why the system has the shape it has, including what was discarded.
The form is fixed:

- **File**: `NNNN-slug.md`, a four-digit number followed by the principle in English kebab-case.
- **Frontmatter**: `num`, `title`, `short` (for navigation), `summary` (the whole argument in one
  paragraph, shown without opening the document).
- **Opening**: the problem or the principle in one or two sentences, before any technical detail.
- **Rejected alternatives, each with its reason**: never "other options were considered", but the
  concrete options and what each one loses.
- **Accepted cost**: the section that names what the decision costs. A record without it reads as if
  the decision had no cost, which is never true.
- **Enforcement**: how the rule is kept (validator, test, convention, nothing). If the obvious
  enforcement was tried and failed, that is recorded with the same priority as the decision.
- **Cross-references**: another decision is named by number and linked by relative path,
  `[decision 21](decisions/0021-english-is-the-repository-language-and-spanish-is-a-product-locale.md)`.

## README and repository metadata

`README.md`, `package.json` and anything that describes the repository for tooling or for someone
cloning it for the first time: English, terse, no marketing adjectives. "A Turborepo for the
`skryensya/ui` design system", not "a powerful, flexible design system".

## Code comments

English, per decision 21. The old clause that allowed either language "when locally consistent"
constrained nothing, since every file passes it on its own, and left 1,687 lines of Spanish comments
behind; the remaining migration is tracked in `docs/pending-tasks.md`. When editing a file that still
has Spanish comments, new comments are written in English.

## Commit messages

[`CONTRIBUTING.md`](../CONTRIBUTING.md#commit-messages) is the authority, and `.husky/commit-msg`
enforces the shape: Conventional Commits, a subject of at most 100 characters, an optional body of at
most 300 characters after a blank line, no `Co-authored-by:` or `Signed-off-by:` trailers. This guide
does not restate the rules, so the two cannot drift. One commit is one subject.

## Checklist

- Does the term exist in `CONTEXT.md`? Use it as is.
- Component page or tutorial, or reference and rules? Second person or impersonal, never mixed.
- Does the lede exist, and is its first sentence the task, without naming the implementation?
- Does Guidelines have a purpose sentence, "Cuándo usar" and "Cuándo no usar", consistent with
  `useWhen`/`avoidWhen`, each "not" ending in the alternative?
- Do the do/don't pairs talk about a real interface, and give their reason?
- Does the component carry text? Then Guidelines has a Content block.
- Is it interactive? Then it has an Accessibility tab: what it does, what is left to the author,
  keyboard.
- In Guidelines, is the subject the person or the task, never a prop?
- Force verbs: Debe/No, Usa/No uses, Considera/Prefiere, and nothing in between.
- Headings: topic first, thesis after a colon, in the page's language.
- A more complex example: can its real scenario be named in one sentence?
- Spanish: tú; "solo" without an accent; no "acá", "recién", "de a una"; no em dash and no spaced
  hyphen in its place.
- Identifiers are never translated; demo copy and `aria-label` always are.
- Code block label: no possessive, full language name, explicit `lang` if unrecognized.
