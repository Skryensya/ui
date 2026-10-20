import { lazy, Suspense } from "react";
import type { CatalogBreakGroup } from "../../lib/debug-catalog";

const groups = {
  layout: lazy(() => import("./break-catalog-layout")),
  navigation: lazy(() => import("./break-catalog-navigation")),
  media: lazy(() => import("./break-catalog-media")),
  forms: lazy(() => import("./break-catalog-forms")),
  utilities: lazy(() => import("./break-catalog-utilities")),
};

export function CatalogBreak({ id, name, group }: { id: string; name: string; group: CatalogBreakGroup }) {
  const Specimens = groups[group];
  return <div className="break-page" data-toc-transparent>
    <header><h1>break: {name}</h1><p className="break-intro">Real public components, adverse props and optional/collection boundaries, inline. Dashed outlines show the container; no CSS repair, truncation or harness clipping is applied. Empty clears optional content/items, never a required accessible name. State stays local; no data is sent or saved.</p><p className="break-case__note">Strings have no declared maxLength in these library props. The fixtures use plausible titles, names, email/URL and multilingual labels, not random long text. A mounted harness is not a certificate that every interaction or environment passed.</p></header>
    <Suspense fallback={<p role="status">Loading real {name} bindings…</p>}><Specimens id={id} /></Suspense>
  </div>;
}
