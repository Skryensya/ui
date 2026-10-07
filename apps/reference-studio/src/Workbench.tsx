import { useEffect, useRef, useState } from "react";
import { Button } from "@skryensya/react/button";
import { Badge } from "@skryensya/react/badge";
import {
  subjects,
  SCALES,
  intents,
  traits,
  densities,
  confirmClassification,
  publicationRequestSchema,
  type ReferenceIngest,
  type RawCapture,
  type ClassificationFields,
  type PublicationPreview,
  type PublicationRequest,
} from "@skryensya/reference-model";
import type { ReferenceClient } from "./client";
import { Screenshot } from "./Screenshot";
const tabs = [
  "Reference",
  "Structure",
  "DOM",
  "Text",
  "Source",
  "Similar",
  "Publication",
] as const;
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
function Publication({
  client,
  ingest,
  act,
}: {
  client: ReferenceClient;
  ingest: ReferenceIngest;
  act: (run: () => Promise<ReferenceIngest>) => void;
}) {
  const [kind, setKind] = useState(""),
    [preview, setPreview] = useState<PublicationPreview>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [exampleId, setExampleId] = useState(
      `reference-${ingest.id.slice(0, 8)}`,
    ),
    [titleEn, setTitleEn] = useState(ingest.source.title ?? ""),
    [titleEs, setTitleEs] = useState(""),
    [purposeEn, setPurposeEn] = useState(""),
    [purposeEs, setPurposeEs] = useState(""),
    [patternId, setPatternId] = useState(""),
    [content, setContent] = useState("{}"),
    [tree, setTree] = useState(""),
    [fields, setFields] = useState("{}"),
    [layoutEn, setLayoutEn] = useState(""),
    [layoutEs, setLayoutEs] = useState("");
  const editable = ingest.status === "accepted";
  const invalidate = (run: () => void) => {
    run();
    setPreview(undefined);
  };
  async function generate() {
    setBusy(true);
    setError("");
    setPreview(undefined);
    try {
      const request = publicationRequestSchema.parse({
        kind,
        exampleId,
        title: { en: titleEn, es: titleEs },
        purpose: { en: purposeEn, es: purposeEs },
        ...(kind === "use"
          ? { patternId, content: JSON.parse(content) }
          : { tree: JSON.parse(tree) }),
        ...(kind === "pattern"
          ? {
              content: JSON.parse(content),
              fields: JSON.parse(fields),
              layout: { en: layoutEn, es: layoutEs },
            }
          : {}),
      });
      setPreview(await client.preview(ingest, request));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Publication</h2>
      <p>
        Acceptance keeps evidence in the working store. Publication creates a
        reviewed Git change. Author a curated UsageTree or fill an existing
        pattern; captured DOM is never catalogue code.
      </p>
      <p>
        PR source provenance: <code>{ingest.source.url}</code>. Check the URL
        and curated copy for private information before publishing.
      </p>
      <fieldset disabled={!editable || busy}>
        <legend>Curated example</legend>
        <label>
          Publication mode
          <select
            value={kind}
            onChange={(e) => invalidate(() => setKind(e.target.value))}
          >
            <option value="">Choose explicitly…</option>
            <option value="use">Existing pattern + new use</option>
            <option value="pattern">New pattern + first use</option>
            <option value="fixed">Fixed example</option>
          </select>
        </label>
        <label>
          Example ID
          <input
            value={exampleId}
            onChange={(e) => invalidate(() => setExampleId(e.target.value))}
          />
        </label>
        <label>
          Title (English)
          <input
            value={titleEn}
            onChange={(e) => invalidate(() => setTitleEn(e.target.value))}
          />
        </label>
        <label>
          Title (Spanish)
          <input
            value={titleEs}
            onChange={(e) => invalidate(() => setTitleEs(e.target.value))}
          />
        </label>
        <label>
          Purpose (English)
          <textarea
            value={purposeEn}
            onChange={(e) => invalidate(() => setPurposeEn(e.target.value))}
          />
        </label>
        <label>
          Purpose (Spanish)
          <textarea
            value={purposeEs}
            onChange={(e) => invalidate(() => setPurposeEs(e.target.value))}
          />
        </label>
        {kind === "use" && (
          <label>
            Existing pattern ID
            <input
              value={patternId}
              onChange={(e) => invalidate(() => setPatternId(e.target.value))}
              placeholder="heading-stack"
            />
          </label>
        )}
        {kind !== "use" && kind && (
          <label>
            Curated UsageTree JSON{" "}
            {kind === "pattern" && '(whole string slots may use "{{field}}")'}
            <textarea
              className="code"
              rows={12}
              value={tree}
              onChange={(e) => invalidate(() => setTree(e.target.value))}
              placeholder={
                '{"contract":"typography","signature":"Text","children":"Curated copy"}'
              }
            />
          </label>
        )}
        {(kind === "use" || kind === "pattern") && (
          <label>
            Bilingual content JSON
            <textarea
              className="code"
              rows={8}
              value={content}
              onChange={(e) => invalidate(() => setContent(e.target.value))}
            />
          </label>
        )}
        {kind === "pattern" && (
          <>
            <label>
              Field descriptions JSON (English and Spanish)
              <textarea
                className="code"
                value={fields}
                onChange={(e) => invalidate(() => setFields(e.target.value))}
              />
            </label>
            <label>
              Layout (English)
              <input
                value={layoutEn}
                onChange={(e) => invalidate(() => setLayoutEn(e.target.value))}
              />
            </label>
            <label>
              Layout (Spanish)
              <input
                value={layoutEs}
                onChange={(e) => invalidate(() => setLayoutEs(e.target.value))}
              />
            </label>
          </>
        )}
        <Button disabled={!kind} onClick={() => void generate()}>
          {busy
            ? "Validating repository changes…"
            : "Generate and validate preview"}
        </Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <section>
          <h3>Exact repository changes</h3>
          <p>
            Base: <code>{preview.baseSha}</code> · Validation:{" "}
            {preview.validation.valid ? "passed" : "failed"}
          </p>
          {preview.files.map((f) => (
            <details key={f.path} open>
              <summary>{f.path}</summary>
              <pre>{f.content}</pre>
            </details>
          ))}
          <details>
            <summary>Repository gate results</summary>
            <pre>{preview.validation.output}</pre>
          </details>
          <Button
            disabled={
              !editable ||
              !preview.validation.valid ||
              preview.revision !== ingest.revision
            }
            onClick={() => {
              if (
                confirm(
                  "Create a branch and pull request with these exact files?",
                )
              )
                act(() => client.publish(ingest, preview.digest));
            }}
          >
            Create GitHub pull request
          </Button>
        </section>
      )}
      <h3>Publication attempts</h3>
      {ingest.publications.map((p) => (
        <article className="attempt" key={p.id}>
          <Badge>{p.status}</Badge>
          <p>
            Example: {p.exampleId} · {p.kind}
          </p>
          <p>
            Branch: <code>{p.branch}</code>
          </p>
          <p>
            Commit: <code>{p.commitSha ?? "Not committed"}</code>
          </p>
          {p.prUrl && (
            <a href={p.prUrl} target="_blank" rel="noreferrer">
              PR #{p.prNumber}
            </a>
          )}
          <ul>
            {p.generatedFiles.map((f) => (
              <li key={f}>
                <code>{f}</code>
              </li>
            ))}
          </ul>
          {p.error && <p role="alert">{p.error}</p>}
          {["failed", "pending", "pr-open"].includes(p.status) &&
            ["accepted", "publishing"].includes(ingest.status) && (
              <Button onClick={() => act(() => client.reconcile(ingest, p.id))}>
                Refresh GitHub receipt
              </Button>
            )}
          {p.status === "pr-open" && (
            <Button onClick={() => act(() => client.merged(ingest, p.id))}>
              Verify merge and mark published
            </Button>
          )}
        </article>
      ))}
    </section>
  );
}
export function Workbench({
  client,
  id,
}: {
  client: ReferenceClient;
  id: string;
}) {
  const [ingest, setIngest] = useState<ReferenceIngest>(),
    [raw, setRaw] = useState<RawCapture>(),
    [tab, setTab] = useState<(typeof tabs)[number]>("Reference"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [similar, setSimilar] = useState<ReferenceIngest[]>([]);
  const [edits, setEdits] = useState<ClassificationFields>({}),
    [baseRevision, setBaseRevision] = useState<number>(),
    [notes, setNotes] = useState<string>(),
    [rating, setRating] = useState<number>();
  const automatic = useRef(false);
  const dirty =
    !!Object.keys(edits).length || notes !== undefined || rating !== undefined;
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
    if (!ingest || tab !== "Similar") return;
    void client
      .list({ structureHash: ingest.capture.structureHash })
      .then((rows) => setSimilar(rows.filter((i) => i.id !== id)))
      .catch((e: Error) => setError(e.message));
  }, [ingest?.capture.structureHash, tab]);
  function act(run: () => Promise<ReferenceIngest>) {
    setBusy(true);
    setError("");
    void run()
      .then(setIngest)
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  }
  if (!ingest) return <p role="status">{error || "Opening reference…"}</p>;
  const current = ingest,
    editable = ["captured", "processing", "review", "rejected"].includes(
      current.status,
    );
  const changed = () => {
    if (!dirty) setBaseRevision(current.revision);
  };
  async function save() {
    const i = await client.save(
      { ...current, revision: baseRevision ?? current.revision },
      { fields: Object.keys(edits).length ? edits : undefined, notes, rating },
    );
    setEdits({});
    setNotes(undefined);
    setRating(undefined);
    setBaseRevision(undefined);
    return i;
  }
  const provenance = (key: keyof ClassificationFields) => {
    if (edits[key]) return <small>Human decision · unsaved</small>;
    const value = current.classification?.[key];
    return value ? (
      <small>
        {value.source === "human"
          ? "Human-confirmed"
          : `Classifier proposal · ${Math.round((value.confidence ?? 0) * 100)}%`}
      </small>
    ) : (
      <small>Not classified</small>
    );
  };
  return (
    <>
      <a href="#">← Inbox</a>
      <div className="title-row">
        <h1>{current.source.title || current.source.hostname}</h1>
        <Badge>{current.status}</Badge>
      </div>
      <p>
        <a href={current.source.url} target="_blank" rel="noreferrer">
          {current.source.hostname}
        </a>{" "}
        · {new Date(current.capture.capturedAt).toLocaleString()} · revision{" "}
        {current.revision}
      </p>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Working…</p>}
      {dirty && baseRevision !== current.revision && (
        <p role="alert">
          This reference changed. Your draft is preserved; reload before saving.
        </p>
      )}
      <div className="workbench">
        <section>
          <div className="tabs" role="tablist" aria-label="Reference workbench">
            {tabs.map((t) => (
              <Button
                key={t}
                role="tab"
                aria-selected={t === tab}
                variant={t === tab ? "solid" : "ghost"}
                onClick={() => setTab(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="reference-panel" role="tabpanel" aria-label={tab}>
            {tab === "Reference" && <Screenshot client={client} id={id} />}
            {tab === "DOM" && <pre>{JSON.stringify(raw?.root, null, 2)}</pre>}
            {tab === "Structure" && (
              <>
                <p>
                  Structure fingerprint:{" "}
                  <code>{current.capture.structureHash}</code>
                </p>
                <pre>{raw && JSON.stringify(treeOf(raw.root), null, 2)}</pre>
              </>
            )}
            {tab === "Text" && <pre>{raw && textOf(raw.root)}</pre>}
            {tab === "Source" && (
              <>
                <pre>
                  {JSON.stringify(
                    {
                      source: current.source,
                      capture: current.capture,
                      truncated: raw?.truncated,
                      originalPageTitle: raw?.pageTitle,
                      classificationRuns: current.classificationRuns,
                    },
                    null,
                    2,
                  )}
                </pre>
                <p>
                  Raw capture remains in asset storage after publication. No
                  captured scripts are executed.
                </p>
              </>
            )}
            {tab === "Similar" && (
              <>
                <p>Exact structural matches (no embeddings).</p>
                {similar.map((i) => (
                  <p key={i.id}>
                    <a href={`#/ingests/${i.id}`}>
                      {i.source.title || i.source.hostname}
                    </a>
                  </p>
                ))}
              </>
            )}
            {tab === "Publication" && (
              <Publication client={client} ingest={current} act={act} />
            )}
          </div>
        </section>
        <aside aria-label="Classification and review">
          <h2>Classification</h2>
          <fieldset disabled={!editable || busy}>
            <legend>Closed catalogue vocabulary</legend>
            <label>
              Subject
              <select
                value={
                  edits.subject?.value ??
                  current.classification?.subject?.value ??
                  ""
                }
                onChange={(e) => {
                  changed();
                  setEdits((f) => ({
                    ...f,
                    subject: {
                      value: e.target.value as NonNullable<
                        ClassificationFields["subject"]
                      >["value"],
                      source: "human",
                    },
                  }));
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {subjects.map((s) => (
                  <option key={s.id}>{s.id}</option>
                ))}
              </select>
              {provenance("subject")}
            </label>
            <label>
              Scale
              <select
                value={
                  edits.scale?.value ??
                  current.classification?.scale?.value ??
                  ""
                }
                onChange={(e) => {
                  changed();
                  setEdits((f) => ({
                    ...f,
                    scale: {
                      value: e.target.value as NonNullable<
                        ClassificationFields["scale"]
                      >["value"],
                      source: "human",
                    },
                  }));
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {SCALES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {provenance("scale")}
            </label>
            <label>
              Intent
              <select
                value={
                  edits.intent?.value ??
                  current.classification?.intent?.value ??
                  ""
                }
                onChange={(e) => {
                  changed();
                  setEdits((f) => ({
                    ...f,
                    intent: {
                      value: e.target.value as NonNullable<
                        ClassificationFields["intent"]
                      >["value"],
                      source: "human",
                    },
                  }));
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {intents.map((i) => (
                  <option key={i.id}>{i.id}</option>
                ))}
              </select>
              {provenance("intent")}
            </label>
            <label>
              Density
              <select
                value={
                  edits.density?.value ??
                  current.classification?.density?.value ??
                  ""
                }
                onChange={(e) => {
                  changed();
                  setEdits((f) => ({
                    ...f,
                    density: {
                      value: e.target.value as NonNullable<
                        ClassificationFields["density"]
                      >["value"],
                      source: "human",
                    },
                  }));
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {densities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {provenance("density")}
            </label>
            <fieldset>
              <legend>Traits</legend>
              {traits.map((t) => (
                <label className="check" key={t}>
                  <input
                    type="checkbox"
                    checked={(
                      edits.traits?.value ??
                      current.classification?.traits?.value ??
                      []
                    ).includes(t)}
                    onChange={(e) => {
                      changed();
                      const selected =
                        edits.traits?.value ??
                        current.classification?.traits?.value ??
                        [];
                      setEdits((f) => ({
                        ...f,
                        traits: {
                          value: e.target.checked
                            ? [...selected, t]
                            : selected.filter((v) => v !== t),
                          source: "human",
                        },
                      }));
                    }}
                  />
                  {t}
                </label>
              ))}
              {provenance("traits")}
            </fieldset>
            <label>
              Review notes
              <textarea
                value={notes ?? current.review?.notes ?? ""}
                onChange={(e) => {
                  changed();
                  setNotes(e.target.value);
                }}
              />
            </label>
            <label>
              Rating
              <select
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
              </select>
            </label>
            <Button
              variant="ghost"
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
              Confirm classification values
            </Button>
            <Button disabled={!dirty} onClick={() => act(save)}>
              Save human decisions
            </Button>
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => {
                setEdits({});
                setNotes(undefined);
                setRating(undefined);
                setBaseRevision(undefined);
              }}
            >
              Discard draft / reload
            </Button>
          </fieldset>
          <div className="actions">
            <Button
              disabled={
                busy ||
                dirty ||
                !["captured", "review"].includes(current.status)
              }
              onClick={() => act(() => client.decide(current, "classify"))}
            >
              Propose classification
            </Button>
            <Button
              disabled={busy || dirty || current.status !== "review"}
              onClick={() => act(() => client.decide(current, "accept"))}
            >
              Accept
            </Button>
            <Button
              disabled={
                busy ||
                dirty ||
                !["captured", "review", "accepted"].includes(current.status)
              }
              onClick={() => act(() => client.decide(current, "reject"))}
            >
              Reject
            </Button>
            <Button
              disabled={
                busy ||
                dirty ||
                !["accepted", "rejected", "processing"].includes(current.status)
              }
              onClick={() => act(() => client.decide(current, "review"))}
            >
              Return to review
            </Button>
          </div>
          <small>
            Classifier: {current.classification?.classifier ?? "Not run"}{" "}
            {current.classification?.classifierVersion}
          </small>
        </aside>
      </div>
    </>
  );
}
