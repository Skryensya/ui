/*
 * Diagnostic only, for /debug/loader-break. Renders the REAL `@skryensya/react` Loader, LoaderStatus
 * and Shimmer once per stress scenario. The page around it adds labels and nothing else: no fonts,
 * no token overrides, no simulated themes. A loader observed under those is a different loader.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Button } from "@skryensya/react/button";
import { Loader, LoaderStatus } from "@skryensya/react/loader";
import { Shimmer } from "@skryensya/react/shimmer";
import type { ReactNode } from "react";

function Case({
  label,
  note,
  broke,
  fixed,
  children,
}: {
  label: string;
  note?: string;
  /** What visibly broke in this scenario, written after the look. The page reads as the report. */
  broke?: string;
  /** A scenario that broke and has since been fixed, so the page shows the before as well as the after. */
  fixed?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
      {fixed ? <p className="break-case__fixed">WAS BROKEN, NOW {fixed}</p> : null}
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-group" data-toc-transparent>
      <h2 className="break-group__title">{title}</h2>
      {children}
    </section>
  );
}

export function LoaderBreak() {
  return (
    <>
      <Group title="Loader. Labelled, decorative, and the one value in between">
        <Case label="Labelled: a real status">
          <Loader label="Cargando resultados" />
        </Case>
        <Case label="Decorative: beside a control that already carries the status">
          <Button disabled post={<Loader />}>
            Guardando
          </Button>
        </Case>
        <Case
          fixed='falls back to decorative (aria-hidden, no role): the same path as no label at all.'
          label='An explicit empty label (label="")'
          note='A computed status not yet set used to still get role="status" + aria-label="" - an explicit, empty accessible name on a live region, which is worse than none.'
        >
          <Loader label="" />
        </Case>
      </Group>

      <Group title="LoaderStatus. Announces a skeleton screen's wait, draws nothing">
        <Case label="A real label">
          <LoaderStatus label="Cargando artículos" />
        </Case>
        <Case
          fixed="warns in dev (console.error): the region announces an empty string otherwise, with nothing visible to notice it by."
          label="An empty label"
          note="LoaderStatus's own doc comment already named this risk; nothing checked for it until now."
        >
          <LoaderStatus label="" />
        </Case>
      </Group>

      <Group title="Shimmer. Paints the text itself; it owns no name or role of its own">
        <Case label="Default, once, and reversed">
          <div className="break-row">
            <Shimmer>Generating response…</Shimmer>
            <Shimmer once>Reading 4 files</Shimmer>
            <Shimmer reverse>Reversed sweep</Shimmer>
          </div>
        </Case>
        <Case label="Inactive: same element and colour, animation off">
          <Shimmer active={false}>Paused</Shimmer>
        </Case>
        <Case
          label="Non-text content inside (an icon beside the words)"
          note="The sweep is background-clip: text, which paints glyphs - not arbitrary child elements. An icon sibling to the shimmered words keeps its own fill and never shimmers; by the component's own doc comment ('temporary live text') that is the intended scope, not a bug. Inferred from shimmer.css, not screenshotted."
        >
          <Shimmer>
            <span aria-hidden="true">⏳</span> Thinking…
          </Shimmer>
        </Case>
      </Group>
    </>
  );
}
