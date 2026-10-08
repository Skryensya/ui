import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@skryensya/react/button";
import { Badge } from "@skryensya/react/badge";
import { Callout } from "@skryensya/react/callout";
import { FormField } from "@skryensya/react/form-field";
import { Textarea } from "@skryensya/react/input";
import { NativeSelect } from "@skryensya/react/select-native";
import { Checkbox } from "@skryensya/react/selection";
import { Tabs } from "@skryensya/react/tabs";
import { Combobox } from "@skryensya/react/combobox";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Icon } from "@skryensya/react/icon";
import { Code, Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import { Loader } from "@skryensya/react/loader";
import {
  subjects,
  SCALES,
  traits,
  densities,
  confirmClassification,
  type ReferenceIngest,
  type RawCapture,
  type ClassificationFields,
} from "@skryensya/reference-model";
import type { ReferenceClient } from "./client";
import { Screenshot, type NaturalSize } from "./Screenshot";
import { Publication } from "./Publication";
import { PaneSplitter } from "./PaneSplitter";
import { toneOf } from "./status";
import { comboboxCopy, intentItems } from "./intents";
const tabs = ["Review", "Evidence", "Similar", "Publication"] as const;
type Tab = (typeof tabs)[number];
type Zoom = "actual" | "fit";
const evidenceViews = ["Text", "Structure", "DOM", "Source"] as const;
type EvidenceView = (typeof evidenceViews)[number];
function textOf(node: RawCapture["root"]): string {
  return [node.text, ...node.children.map(textOf)].filter(Boolean).join("\n");
}
function treeOf(node: RawCapture["root"]): unknown {
  return {
    tag: node.tag,
    role: node.role,
    rect: node.rect,
    children: node.children.map(treeOf),
  };
}
const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
export function Workbench({
  client,
  id,
  queue = [],
  listName = "References",
}: {
  client: ReferenceClient;
  id: string;
  /** The list the reference was opened from, for previous and next. */
  queue?: readonly string[];
  /** The view it was opened from, named on the way back. */
  listName?: string;
}) {
  const [ingest, setIngest] = useState<ReferenceIngest>(),
    [raw, setRaw] = useState<RawCapture>(),
    [tab, setTab] = useState<Tab>("Review"),
    [evidence, setEvidence] = useState<EvidenceView>("Text"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [similar, setSimilar] = useState<ReferenceIngest[]>(),
    /* A phone cannot show most captures at their own size; it starts fitted. */
    [zoom, setZoom] = useState<Zoom>(() =>
      typeof matchMedia === "function" &&
      matchMedia("(max-width: 900px)").matches
        ? "fit"
        : "actual",
    ),
    [natural, setNatural] = useState<NaturalSize>();
  const [edits, setEdits] = useState<ClassificationFields>({}),
    [baseRevision, setBaseRevision] = useState<number>(),
    [notes, setNotes] = useState<string>(),
    [rating, setRating] = useState<number>();
  const automatic = useRef(false),
    layout = useRef<HTMLDivElement>(null);
  const dirty =
    !!Object.keys(edits).length || notes !== undefined || rating !== undefined;
  const position = queue.indexOf(id),
    previous = position > 0 ? queue[position - 1] : undefined,
    next =
      position >= 0 && position < queue.length - 1
        ? queue[position + 1]
        : undefined;
  useEffect(() => {
    let active = true;
    const load = () => {
      void client
        .get(id)
        .then((i) => {
          if (active)
            setIngest((previous) =>
              !previous || i.revision >= previous.revision ? i : previous,
            );
        })
        .catch((e: Error) => {
          if (active) setError(e.message);
        });
    };
    load();
    const stop = client.subscribe(id, load);
    void client
      .raw(id)
      .then((r) => {
        if (active) setRaw(r);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      stop();
    };
  }, [client, id]);
  useEffect(() => {
    if (ingest?.status === "captured" && !automatic.current) {
      automatic.current = true;
      act(() => client.decide(ingest, "classify"));
    }
  }, [ingest?.status]);
  useEffect(() => {
    if (!ingest || tab !== "Similar" || similar) return;
    void client
      .list({ structureHash: ingest.capture.structureHash })
      .then((rows) => setSimilar(rows.filter((i) => i.id !== id)))
      .catch((e: Error) => setError(e.message));
  }, [ingest?.capture.structureHash, tab]);
  /* J and K walk the list the reference came from, the way a review queue is read. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        typing(event.target)
      )
        return;
      const target =
        event.key === "j" ? next : event.key === "k" ? previous : undefined;
      if (!target || dirty) return;
      event.preventDefault();
      location.hash = `/ingests/${target}`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, dirty]);
  function act(run: () => Promise<ReferenceIngest>) {
    setBusy(true);
    setError("");
    void run()
      .then(setIngest)
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  }
  if (!ingest)
    return (
      <div className="studio-workbench__loading">
        {error ? (
          <Callout tone="danger" title="Could not open this reference">
            {error}
          </Callout>
        ) : (
          <Loader label="Opening reference" />
        )}
      </div>
    );
  const current = ingest,
    editable = ["captured", "processing", "review", "rejected"].includes(
      current.status,
    );
  const changed = () => {
    if (!dirty) setBaseRevision(current.revision);
  };
  const setField = <K extends keyof ClassificationFields>(
    key: K,
    value: NonNullable<ClassificationFields[K]>["value"],
  ) => {
    changed();
    setEdits((f) => ({ ...f, [key]: { value, source: "human" } }));
  };
  const valueOf = <K extends keyof ClassificationFields>(
    key: K,
  ): NonNullable<ClassificationFields[K]>["value"] | undefined =>
    (edits[key] ?? current.classification?.[key])?.value as
      NonNullable<ClassificationFields[K]>["value"] | undefined;
  function discard() {
    setEdits({});
    setNotes(undefined);
    setRating(undefined);
    setBaseRevision(undefined);
  }
  async function save() {
    const i = await client.save(
      { ...current, revision: baseRevision ?? current.revision },
      { fields: Object.keys(edits).length ? edits : undefined, notes, rating },
    );
    discard();
    return i;
  }
  const provenance = (key: keyof ClassificationFields) => {
    if (edits[key]) return "Human decision · unsaved";
    const value = current.classification?.[key];
    return value
      ? value.source === "human"
        ? "Human-confirmed"
        : `Classifier proposal · ${Math.round((value.confidence ?? 0) * 100)}%`
      : "Not classified";
  };
  /*
   * NATURAL SIZE. The screenshot is in device pixels; the page it came from was laid out in CSS
   * pixels. Dividing by the capture's scale factor shows it at the size the reader saw it.
   */
  const scale =
    current.capture.viewport.deviceScaleFactor ??
    raw?.viewport.deviceScaleFactor ??
    (natural && raw?.bounds.width ? natural.width / raw.bounds.width : 1);
  const cssWidth = natural ? Math.round(natural.width / scale) : undefined,
    cssHeight = natural ? Math.round(natural.height / scale) : undefined;
  const imageStyle: CSSProperties =
    zoom === "actual" && cssWidth
      ? { width: cssWidth, maxWidth: "none" }
      : { width: "100%", maxWidth: cssWidth ?? "100%" };
  /* Decisions this status can take. One that cannot apply is not drawn, rather than drawn disabled. */
  const decisions = [
    ["captured", "review"].includes(current.status) && (
      <Button
        key="classify"
        variant="ghost"
        disabled={busy || dirty}
        onClick={() => act(() => client.decide(current, "classify"))}
      >
        Propose classification
      </Button>
    ),
    ["accepted", "rejected", "processing"].includes(current.status) && (
      <Button
        key="review"
        variant="ghost"
        disabled={busy || dirty}
        onClick={() => act(() => client.decide(current, "review"))}
      >
        Return to review
      </Button>
    ),
    ["captured", "review", "accepted"].includes(current.status) && (
      <Button
        key="reject"
        variant="soft"
        tone="danger"
        disabled={busy || dirty}
        onClick={() => act(() => client.decide(current, "reject"))}
      >
        Reject
      </Button>
    ),
    ["captured", "review"].includes(current.status) && (
      <Button
        key="accept"
        tone="accent"
        disabled={busy || dirty || current.status !== "review"}
        onClick={() => act(() => client.decide(current, "accept"))}
      >
        Accept
      </Button>
    ),
  ].filter(Boolean);
  const panel = (t: Tab) => {
    switch (t) {
      case "Review":
        return (
          <Stack gap="lg">
            <fieldset className="studio-fieldset" disabled={!editable || busy}>
              <legend>Closed catalogue vocabulary</legend>
              <FormField label="Subject" hint={provenance("subject")}>
                <NativeSelect
                  value={valueOf("subject") ?? ""}
                  onChange={(e) =>
                    setField(
                      "subject",
                      e.target.value as NonNullable<
                        ClassificationFields["subject"]
                      >["value"],
                    )
                  }
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id}>{s.id}</option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Scale" hint={provenance("scale")}>
                <NativeSelect
                  value={valueOf("scale") ?? ""}
                  onChange={(e) =>
                    setField(
                      "scale",
                      e.target.value as NonNullable<
                        ClassificationFields["scale"]
                      >["value"],
                    )
                  }
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {SCALES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </NativeSelect>
              </FormField>
              <Combobox
                {...comboboxCopy}
                key={`intent-${current.revision}-${edits.intent ? "edit" : "saved"}`}
                label="Intent"
                hint={provenance("intent")}
                items={intentItems}
                placeholder="Search intents…"
                disabled={!editable || busy}
                defaultValue={valueOf("intent")}
                defaultInputValue={valueOf("intent") ?? ""}
                onValueChange={({ value: [value] }) => {
                  if (value)
                    setField(
                      "intent",
                      value as NonNullable<
                        ClassificationFields["intent"]
                      >["value"],
                    );
                }}
              />
              <FormField label="Density" hint={provenance("density")}>
                <NativeSelect
                  value={valueOf("density") ?? ""}
                  onChange={(e) =>
                    setField(
                      "density",
                      e.target.value as NonNullable<
                        ClassificationFields["density"]
                      >["value"],
                    )
                  }
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {densities.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </NativeSelect>
              </FormField>
              <fieldset className="studio-fieldset">
                <legend>Traits</legend>
                <div className="studio-traits">
                  {traits.map((t) => (
                    <Checkbox
                      key={t}
                      checked={(valueOf("traits") ?? []).includes(t)}
                      onCheckedChange={({ checked }) => {
                        const selected = valueOf("traits") ?? [];
                        setField(
                          "traits",
                          checked === true
                            ? [...selected, t]
                            : selected.filter((v) => v !== t),
                        );
                      }}
                    >
                      {t}
                    </Checkbox>
                  ))}
                </div>
                <span className="studio-provenance">
                  {provenance("traits")}
                </span>
              </fieldset>
              <Inline>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!current.classification}
                  onClick={() => {
                    changed();
                    setEdits(
                      confirmClassification({
                        ...current.classification,
                        ...edits,
                      }),
                    );
                  }}
                >
                  Confirm all proposed values
                </Button>
              </Inline>
            </fieldset>
            <fieldset className="studio-fieldset" disabled={!editable || busy}>
              <legend>Review</legend>
              <FormField label="Rating">
                <NativeSelect
                  value={rating ?? current.review?.rating ?? ""}
                  onChange={(e) => {
                    changed();
                    setRating(Number(e.target.value));
                  }}
                >
                  <option value="" disabled>
                    Unrated
                  </option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Review notes">
                <Textarea
                  value={notes ?? current.review?.notes ?? ""}
                  onChange={(e) => {
                    changed();
                    setNotes(e.target.value);
                  }}
                />
              </FormField>
            </fieldset>
            <Text size="caption" tone="tertiary">
              Classifier: {current.classification?.classifier ?? "Not run"}{" "}
              {current.classification?.classifierVersion}
            </Text>
          </Stack>
        );
      case "Evidence": {
        const code = (text: string | undefined, empty: string) => (
          <pre className="studio-code studio-code--fill">
            {raw ? text || empty : "Loading…"}
          </pre>
        );
        return (
          <div className="studio-evidence">
            <SegmentedControl
              label="Evidence"
              size="sm"
              value={evidence}
              onValueChange={(value) => setEvidence(value as EvidenceView)}
              options={evidenceViews.map((value) => ({
                value,
                label: value,
              }))}
            />
            {evidence === "Text" &&
              code(raw && textOf(raw.root), "No text captured.")}
            {evidence === "Structure" && (
              <>
                <Text size="sm" tone="secondary">
                  Fingerprint <Code>{current.capture.structureHash}</Code>
                </Text>
                {code(raw && JSON.stringify(treeOf(raw.root), null, 2), "")}
              </>
            )}
            {evidence === "DOM" &&
              code(raw && JSON.stringify(raw.root, null, 2), "")}
            {evidence === "Source" && (
              <>
                {code(
                  JSON.stringify(
                    {
                      source: current.source,
                      capture: current.capture,
                      truncated: raw?.truncated,
                      originalPageTitle: raw?.pageTitle,
                      classificationRuns: current.classificationRuns,
                    },
                    null,
                    2,
                  ),
                  "",
                )}
                <Text size="sm" tone="tertiary">
                  Raw capture remains in asset storage after publication. No
                  captured scripts are executed.
                </Text>
              </>
            )}
          </div>
        );
      }
      case "Similar":
        return (
          <Stack gap="md">
            <Text size="sm" tone="secondary">
              Captures with exactly this structure (no embeddings).
            </Text>
            {!similar ? (
              <Loader label="Looking for matches" />
            ) : similar.length ? (
              <div className="studio-similar">
                {similar.map((i) => (
                  <a
                    key={i.id}
                    className="studio-similar__item"
                    href={`#/ingests/${i.id}`}
                  >
                    <Screenshot client={client} id={i.id} thumbnail />
                    <span>{i.source.title || i.source.hostname}</span>
                    <Badge tone={toneOf(i.status)} size="sm">
                      {i.status}
                    </Badge>
                  </a>
                ))}
              </div>
            ) : (
              <Text size="sm" tone="tertiary">
                No other capture shares this structure.
              </Text>
            )}
          </Stack>
        );
      case "Publication":
        return <Publication client={client} ingest={current} act={act} />;
    }
  };
  return (
    <div className="studio-workbench" data-zoom={zoom}>
      <header className="studio-actionbar">
        <div className="studio-actionbar__lead">
          <Inline gap="xs" align="center" wrap={false}>
            <Button variant="ghost" size="sm" href="#">
              ← {listName}
            </Button>
            {queue.length > 1 && position >= 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Previous reference"
                  aria-keyshortcuts="K"
                  title="Previous reference (K)"
                  disabled={!previous || dirty}
                  onClick={() => (location.hash = `/ingests/${previous}`)}
                >
                  <Icon name="chevron-left" />
                </Button>
                <Text
                  as="span"
                  size="caption"
                  tone="tertiary"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {position + 1} / {queue.length}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Next reference"
                  aria-keyshortcuts="J"
                  title="Next reference (J)"
                  disabled={!next || dirty}
                  onClick={() => (location.hash = `/ingests/${next}`)}
                >
                  <Icon name="chevron-right" />
                </Button>
              </>
            )}
          </Inline>
          <div className="studio-actionbar__title">
            <Inline gap="sm" align="center" wrap={false}>
              <Heading as="h1" size="h4" flush>
                {current.source.title || current.source.hostname}
              </Heading>
              <Badge tone={toneOf(current.status)}>{current.status}</Badge>
            </Inline>
            <Text size="caption" tone="tertiary">
              <a href={current.source.url} target="_blank" rel="noreferrer">
                {current.source.hostname}
              </a>{" "}
              ·{" "}
              {new Date(current.capture.capturedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · revision {current.revision}
            </Text>
          </div>
        </div>
        <div className="studio-actionbar__actions">
          {busy && <Loader size="sm" label="Working" />}
          {dirty ? (
            <Inline gap="sm" align="center">
              <Text as="span" size="sm" tone="secondary">
                Unsaved changes
              </Text>
              <Button variant="ghost" onClick={discard}>
                Discard
              </Button>
              <Button tone="accent" disabled={busy} onClick={() => act(save)}>
                Save human decisions
              </Button>
            </Inline>
          ) : null}
          {decisions.length > 0 && (
            <Inline
              gap="sm"
              align="center"
              title={
                dirty ? "Save or discard your changes to decide" : undefined
              }
            >
              {decisions}
            </Inline>
          )}
        </div>
      </header>
      {(error || (dirty && baseRevision !== current.revision)) && (
        <div className="studio-workbench__alerts">
          {error && (
            <Callout tone="danger" title="Something went wrong">
              {error}
            </Callout>
          )}
          {dirty && baseRevision !== current.revision && (
            <Callout tone="warning" title="This reference changed">
              Your draft is preserved; discard it to load the new revision.
            </Callout>
          )}
        </div>
      )}
      <div
        ref={layout}
        className="studio-workbench__body"
        style={
          { "--studio-capture-width": `${cssWidth ?? 0}px` } as CSSProperties
        }
      >
        <section className="studio-canvas" aria-label="Captured reference">
          <div className="studio-canvas__bar">
            <SegmentedControl
              label="Capture zoom"
              size="sm"
              value={zoom}
              onValueChange={(value) => setZoom(value as Zoom)}
              options={[
                { value: "actual", label: "Actual size" },
                { value: "fit", label: "Fit" },
              ]}
            />
            <Text as="span" size="caption" tone="tertiary">
              {cssWidth && cssHeight
                ? `${cssWidth} × ${cssHeight} px${scale !== 1 ? ` · @${Number(scale.toFixed(2))}x` : ""}`
                : "Measuring…"}
              {raw ? ` · ${raw.mode}` : ""}
            </Text>
          </div>
          <div className="studio-canvas__scroll" tabIndex={0}>
            <Screenshot
              client={client}
              id={id}
              className="studio-canvas__frame"
              style={imageStyle}
              onNaturalSize={setNatural}
            />
          </div>
        </section>
        <aside className="studio-inspector" aria-label="Reference inspector">
          <PaneSplitter target={layout} label="Resize inspector" />
          <Tabs
            aria-label="Reference workbench"
            value={tab}
            onValueChange={({ value }) => setTab(value as Tab)}
            items={tabs.map((t) => ({
              value: t,
              label: t,
              children: t === tab ? panel(t) : null,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}
