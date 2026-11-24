# changelog

Category: content. Stylesheet: `@skryensya/core/components/changelog.css`. Signatures: `Changelog`, `ChangelogEntry`, `ChangelogRelease`.

## Changelog

**Use when**

- there is a version history of something: release notes, a contract's changelog
- the reader comes to learn whether they already have the change they are reading, and a version answers that

**Avoid when**

- they are instructions to read and follow, in order but without versions; that is a Procedure
- what matters is which stage someone is at, what they have done and what is left; that is Steps
- it is a single piece of news; one entry with no history around it is not a history

Alternatives: `Procedure`, `Steps`.

- React: `import { Changelog } from "@skryensya/react/changelog"`.
- HTML: a `<ol>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ChangelogRelease` | yes |

**Example** (canonical tree `changelog/version-history`; its copy is placeholder, replace it)

```tsx
import {
  Changelog,
  ChangelogEntry,
  ChangelogRelease,
} from "@skryensya/react/changelog";

export function ChangelogExample() {
  return (
    <Changelog>
      <ChangelogRelease version="0.2.0-dev">
        <ChangelogEntry
          kind="breaking"
          kindLabel="breaking"
          title="El evento cambió de nombre"
          target="valueChange"
        >
          El anterior ya no se emite.
        </ChangelogEntry>
        <ChangelogEntry
          kind="rework"
          kindLabel="rework"
          title="collapsible pasa a ser false por defecto"
          target="collapsible"
        >
          Es como se comportaba un acordeón de una sola
          sección.
        </ChangelogEntry>
      </ChangelogRelease>
      <ChangelogRelease
        date="2026-07-29"
        version="0.1.0"
        dateLabel="29 de julio de 2026"
      >
        <ChangelogEntry
          kind="bugfix"
          kindLabel="bugfix"
          title="La parte se busca sólo como hija directa"
          target="content"
        >
          El enhancer la buscaba en cualquier descendiente.
        </ChangelogEntry>
        <ChangelogEntry
          kind="feature"
          kindLabel="feature"
          title="Primera publicación del contrato"
        >
          Sale con sus tres firmas.
        </ChangelogEntry>
        <ChangelogEntry
          kindLabel="chore"
          title="El enhancer se publica con el resto del paquete"
        >
          Ni el markup ni las opciones se mueven.
        </ChangelogEntry>
      </ChangelogRelease>
    </Changelog>
  );
}
```

```html
<ol class="sk-changelog" reversed role="list">
  <li class="sk-changelog__release" data-unreleased>
    <span class="sk-changelog__marker" aria-hidden="true"></span>
    <span class="sk-changelog__version">0.2.0-dev</span>
    <ol class="sk-changelog__entries" role="list">
      <li
        class="sk-changelog__entry"
        data-kind="breaking"
        data-layout="stacked"
        data-gap="xs"
      >
        <span
          class="sk-changelog__kind sk-badge"
          data-size="md"
          data-tone="danger"
        >
          breaking
        </span>
        <code class="sk-changelog__target">valueChange</code>
        <span class="sk-changelog__title">El evento cambió de nombre</span>
        <div class="sk-changelog__text">El anterior ya no se emite.</div>
      </li>
      <li
        class="sk-changelog__entry"
        data-kind="rework"
        data-layout="stacked"
        data-gap="xs"
      >
        <span
          class="sk-changelog__kind sk-badge"
          data-size="md"
          data-tone="warning"
        >
          rework
        </span>
        <code class="sk-changelog__target">collapsible</code>
        <span class="sk-changelog__title">
          collapsible pasa a ser false por defecto
        </span>
        <div class="sk-changelog__text">
          Es como se comportaba un acordeón de una sola
          sección.
        </div>
      </li>
    </ol>
  </li>
  <li class="sk-changelog__release">
    <span class="sk-changelog__marker" aria-hidden="true"></span>
    <span class="sk-changelog__version">0.1.0</span>
    <time class="sk-changelog__date" datetime="2026-07-29">
      29 de julio de 2026
    </time>
    <ol class="sk-changelog__entries" role="list">
      <li
        class="sk-changelog__entry"
        data-kind="bugfix"
        data-layout="stacked"
        data-gap="xs"
      >
        <span
          class="sk-changelog__kind sk-badge"
          data-size="md"
          data-tone="accent"
        >
          bugfix
        </span>
        <code class="sk-changelog__target">content</code>
        <span class="sk-changelog__title">
          La parte se busca sólo como hija directa
        </span>
        <div class="sk-changelog__text">
          El enhancer la buscaba en cualquier
          descendiente.
        </div>
      </li>
      <li
        class="sk-changelog__entry"
        data-kind="feature"
        data-layout="stacked"
        data-gap="xs"
      >
        <span
          class="sk-changelog__kind sk-badge"
          data-size="md"
          data-tone="success"
        >
          feature
        </span>
        <span class="sk-changelog__title">
          Primera publicación del contrato
        </span>
        <div class="sk-changelog__text">Sale con sus tres firmas.</div>
      </li>
      <li
        class="sk-changelog__entry"
        data-kind="chore"
        data-layout="stacked"
        data-gap="xs"
      >
        <span
          class="sk-changelog__kind sk-badge"
          data-size="md"
          data-tone="neutral"
        >
          chore
        </span>
        <span class="sk-changelog__title">
          El enhancer se publica con el resto del
          paquete
        </span>
        <div class="sk-changelog__text">
          Ni el markup ni las opciones se mueven.
        </div>
      </li>
    </ol>
  </li>
</ol>
```

Stylesheets: `@skryensya/core/components/badge.css`, `@skryensya/core/components/changelog.css`.

## ChangelogEntry

**Use when**

- one change, with its kind and which part of the contract it touched

**Avoid when**

- outside a ChangelogRelease: a change that is not under a version does not say since when it can be relied on

- React: `import { ChangelogEntry } from "@skryensya/react/changelog"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `ChangelogRelease`.

**Options**

| Option | Values | Default |
|---|---|---|
| `kind` | "breaking" \| "feature" \| "bugfix" \| "rework" \| "chore" | `"chore"` |
| `size` | "xs" \| "sm" \| "md" | `"md"` |
| `gap` | "none" \| "xs" \| "sm" \| "md" \| "lg" | `"xs"` |
| `layout` | "stacked" \| "inline" | `"stacked"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |
| `kind` (React: `kindLabel`) | text | yes |
| `target` | text |  |
| `title` | text | yes |

## ChangelogRelease

**Use when**

- a version and everything that shipped in it
- there is unpublished work: write the version with a -dev suffix and leave the date out

**Avoid when**

- outside a Changelog: the rail and the order are drawn by the list, not by a loose release
- you want to mark 'unpublished' with a separate option; the missing date already says it, and two fields saying the same thing can contradict each other

- React: `import { ChangelogRelease } from "@skryensya/react/changelog"`.
- HTML: a `<li>`, no JavaScript needed.

- Goes inside: `Changelog`.

**Options**

| Option | Values | Default |
|---|---|---|
| `date` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `ChangelogEntry` | yes |
| `date` (React: `dateLabel`) | text |  |
| `version` | text | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-changelog-bead`, `--sk-changelog-connector-color`, `--sk-changelog-connector-size`, `--sk-changelog-date-fg`, `--sk-changelog-entry-gap`, `--sk-changelog-entry-row-gap`, `--sk-changelog-fade`, `--sk-changelog-heading-gap`, `--sk-changelog-marker-color`, `--sk-changelog-marker-gap`, `--sk-changelog-marker-offset`, `--sk-changelog-marker-shift`, `--sk-changelog-marker-size`, `--sk-changelog-measure`, `--sk-changelog-rail`, `--sk-changelog-release-gap`, `--sk-changelog-target-fg`, `--sk-changelog-text-fg`, `--sk-changelog-title-fg`, `--sk-changelog-version-fg`.
