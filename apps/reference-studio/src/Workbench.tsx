import { useEffect, useRef, useState } from "react";
import { Button } from "@skryensya/react/button";
import { Badge } from "@skryensya/react/badge";
import { Callout } from "@skryensya/react/callout";
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@skryensya/react/details";
import { FormField } from "@skryensya/react/form-field";
import { Input, Textarea } from "@skryensya/react/input";
import { NativeSelect } from "@skryensya/react/select-native";
import { Checkbox } from "@skryensya/react/selection";
import { Tabs } from "@skryensya/react/tabs";
import { Code, Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import { Loader } from "@skryensya/react/loader";
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
import { toneOf } from "./status";
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
    <Stack gap="lg">
      <Stack gap="xs">
        <Heading as="h2" size="h4" flush>
          Publication
        </Heading>
        <Text tone="secondary" size="sm">
          Acceptance keeps evidence in the working store. Publication creates a
          reviewed Git change. Author a curated UsageTree or fill an existing
          pattern; captured DOM is never catalogue code.
        </Text>
      </Stack>
      <Callout tone="warning" title="Check for private information">
        PR source provenance: <Code>{ingest.source.url}</Code>. Check the URL
        and curated copy for private information before publishing.
      </Callout>
      <fieldset className="studio-fieldset" disabled={!editable || busy}>
        <legend>Curated example</legend>
        <FormField label="Publication mode">
          {" "}
          <NativeSelect
            value={kind}
            onChange={(e) => invalidate(() => setKind(e.target.value))}
          >
            <option value="">Choose explicitly…</option>
            <option value="use">Existing pattern + new use</option>
            <option value="pattern">New pattern + first use</option>
            <option value="fixed">Fixed example</option>
          </NativeSelect>
        </FormField>
        <FormField label="Example ID">
          {" "}
          <Input
            value={exampleId}
            onChange={(e) => invalidate(() => setExampleId(e.target.value))}
          />
        </FormField>
        <FormField label="Title (English)">
          {" "}
          <Input
            value={titleEn}
            onChange={(e) => invalidate(() => setTitleEn(e.target.value))}
          />
        </FormField>
        <FormField label="Title (Spanish)">
          {" "}
          <Input
            value={titleEs}
            onChange={(e) => invalidate(() => setTitleEs(e.target.value))}
          />
        </FormField>
        <FormField label="Purpose (English)">
          {" "}
          <Textarea
            value={purposeEn}
            onChange={(e) => invalidate(() => setPurposeEn(e.target.value))}
          />
        </FormField>
        <FormField label="Purpose (Spanish)">
          {" "}
          <Textarea
            value={purposeEs}
            onChange={(e) => invalidate(() => setPurposeEs(e.target.value))}
          />
        </FormField>
        {kind === "use" && (
          <FormField label="Existing pattern ID">
            {" "}
            <Input
              value={patternId}
              onChange={(e) => invalidate(() => setPatternId(e.target.value))}
              placeholder="heading-stack"
            />
          </FormField>
        )}
        {kind !== "use" && kind && (
          <FormField
            label="Curated UsageTree JSON"
            hint={
              kind === "pattern"
                ? 'Whole string slots may use "{{field}}".'
                : undefined
            }
          >
            <Textarea
              className="studio-mono"
              rows={12}
              value={tree}
              onChange={(e) => invalidate(() => setTree(e.target.value))}
              placeholder={
                '{"contract":"typography","signature":"Text","children":"Curated copy"}'
              }
            />
          </FormField>
        )}
        {(kind === "use" || kind === "pattern") && (
          <FormField label="Bilingual content JSON">
            {" "}
            <Textarea
              className="studio-mono"
              rows={8}
              value={content}
              onChange={(e) => invalidate(() => setContent(e.target.value))}
            />
          </FormField>
        )}
        {kind === "pattern" && (
          <>
            <FormField label="Field descriptions JSON (English and Spanish)">
              {" "}
              <Textarea
                className="studio-mono"
                value={fields}
                onChange={(e) => invalidate(() => setFields(e.target.value))}
              />
            </FormField>
            <FormField label="Layout (English)">
              {" "}
              <Input
                value={layoutEn}
                onChange={(e) => invalidate(() => setLayoutEn(e.target.value))}
              />
            </FormField>
            <FormField label="Layout (Spanish)">
              {" "}
              <Input
                value={layoutEs}
                onChange={(e) => invalidate(() => setLayoutEs(e.target.value))}
              />
            </FormField>
          </>
        )}
        <Button tone="accent" disabled={!kind} onClick={() => void generate()}>
          {busy
            ? "Validating repository changes…"
            : "Generate and validate preview"}
        </Button>
      </fieldset>
      {error && (
        <Callout tone="danger" title="Preview failed">
          {error}
        </Callout>
      )}
      {preview && (
        <Stack as="section" gap="md">
          <Stack gap="xs">
            <Heading as="h3" size="h4" flush>
              Exact repository changes
            </Heading>
            <Inline gap="sm" align="center">
              <Text as="span" tone="secondary" size="sm">
                Base <Code>{preview.baseSha}</Code>
              </Text>
              <Badge tone={preview.validation.valid ? "success" : "danger"}>
                {preview.validation.valid
                  ? "Validation passed"
                  : "Validation failed"}
              </Badge>
            </Inline>
          </Stack>
          <div>
            {preview.files.map((f) => (
              <Details key={f.path} open>
                <DetailsSummary>{f.path}</DetailsSummary>
                <DetailsContent>
                  <pre className="studio-code">{f.content}</pre>
                </DetailsContent>
              </Details>
            ))}
            <Details>
              <DetailsSummary>Repository gate results</DetailsSummary>
              <DetailsContent>
                <pre className="studio-code">{preview.validation.output}</pre>
              </DetailsContent>
            </Details>
          </div>
          <Inline>
            <Button
              tone="accent"
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
          </Inline>
        </Stack>
      )}
      <Stack as="section" gap="sm">
        <Heading as="h3" size="h4" flush>
          Publication attempts
        </Heading>
        {!ingest.publications.length && (
          <Text tone="tertiary" size="sm">
            Nothing published from this reference yet.
          </Text>
        )}
        {ingest.publications.map((p) => (
          <article className="studio-panel" key={p.id}>
            <Stack gap="sm">
              <Inline justify="between" align="center">
                <Text as="span" weight="emphasis">
                  {p.exampleId} · {p.kind}
                </Text>
                <Badge tone={toneOf(p.status)}>{p.status}</Badge>
              </Inline>
              <Text size="sm" tone="secondary">
                Branch <Code>{p.branch ?? "Not created"}</Code> · Commit{" "}
                <Code>{p.commitSha ?? "Not committed"}</Code>
              </Text>
              {p.prUrl && (
                <a href={p.prUrl} target="_blank" rel="noreferrer">
                  PR #{p.prNumber}
                </a>
              )}
              {p.generatedFiles.length > 0 && (
                <ul className="studio-meta">
                  {p.generatedFiles.map((f) => (
                    <li key={f}>
                      <Code>{f}</Code>
                    </li>
                  ))}
                </ul>
              )}
              {p.error && (
                <Callout tone="danger" title="Publication failed">
                  {p.error}
                </Callout>
              )}
              <Inline gap="sm">
                {["failed", "pending", "pr-open"].includes(p.status) &&
                  ["accepted", "publishing"].includes(ingest.status) && (
                    <Button
                      variant="ghost"
                      onClick={() => act(() => client.reconcile(ingest, p.id))}
                    >
                      Refresh GitHub receipt
                    </Button>
                  )}
                {p.status === "pr-open" && (
                  <Button
                    onClick={() => act(() => client.merged(ingest, p.id))}
                  >
                    Verify merge and mark published
                  </Button>
                )}
              </Inline>
            </Stack>
          </article>
        ))}
      </Stack>
    </Stack>
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
    if (edits[key]) return "Human decision · unsaved";
    const value = current.classification?.[key];
    return value
      ? value.source === "human"
        ? "Human-confirmed"
        : `Classifier proposal · ${Math.round((value.confidence ?? 0) * 100)}%`
      : "Not classified";
  };
  const panel = (t: (typeof tabs)[number]) => {
    switch (t) {
      case "Reference":
        return <Screenshot client={client} id={id} />;
      case "DOM":
        return (
          <pre className="studio-code">
            {JSON.stringify(raw?.root, null, 2)}
          </pre>
        );
      case "Structure":
        return (
          <Stack gap="sm">
            <Text size="sm" tone="secondary">
              Structure fingerprint <Code>{current.capture.structureHash}</Code>
            </Text>
            <pre className="studio-code">
              {raw && JSON.stringify(treeOf(raw.root), null, 2)}
            </pre>
          </Stack>
        );
      case "Text":
        return <pre className="studio-code">{raw && textOf(raw.root)}</pre>;
      case "Source":
        return (
          <Stack gap="sm">
            <pre className="studio-code">
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
            <Text size="sm" tone="tertiary">
              Raw capture remains in asset storage after publication. No
              captured scripts are executed.
            </Text>
          </Stack>
        );
      case "Similar":
        return (
          <Stack gap="sm">
            <Text size="sm" tone="secondary">
              Exact structural matches (no embeddings).
            </Text>
            {similar.length ? (
              <ul>
                {similar.map((i) => (
                  <li key={i.id}>
                    <a href={`#/ingests/${i.id}`}>
                      {i.source.title || i.source.hostname}
                    </a>
                  </li>
                ))}
              </ul>
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
    <Stack gap="lg">
      <Stack gap="sm">
        <a href="#">← Back to list</a>
        <Inline justify="between" align="center">
          <Heading as="h1" size="h3" flush>
            {current.source.title || current.source.hostname}
          </Heading>
          <Badge tone={toneOf(current.status)}>{current.status}</Badge>
        </Inline>
        <Text size="sm" tone="secondary">
          <a href={current.source.url} target="_blank" rel="noreferrer">
            {current.source.hostname}
          </a>{" "}
          · {new Date(current.capture.capturedAt).toLocaleString()} · revision{" "}
          {current.revision}
        </Text>
      </Stack>
      {error && (
        <Callout tone="danger" title="Something went wrong">
          {error}
        </Callout>
      )}
      {busy && (
        <Inline gap="sm" align="center">
          <Loader size="sm" />
          <Text as="span" size="sm" tone="secondary" role="status">
            Working…
          </Text>
        </Inline>
      )}
      {dirty && baseRevision !== current.revision && (
        <Callout tone="warning" title="This reference changed">
          Your draft is preserved; reload before saving.
        </Callout>
      )}
      <div className="studio-workbench">
        <section className="studio-panel">
          <Tabs
            aria-label="Reference workbench"
            value={tab}
            onValueChange={({ value }) =>
              setTab(value as (typeof tabs)[number])
            }
            items={tabs.map((t) => ({
              value: t,
              label: t,
              children: t === tab ? panel(t) : null,
            }))}
          />
        </section>
        <aside
          className="studio-panel studio-aside"
          aria-label="Classification and review"
        >
          <Stack gap="lg">
            <Heading as="h2" size="h4" flush>
              Classification
            </Heading>
            <fieldset className="studio-fieldset" disabled={!editable || busy}>
              <legend>Closed catalogue vocabulary</legend>
              <FormField label="Subject" hint={provenance("subject")}>
                {" "}
                <NativeSelect
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
                </NativeSelect>
              </FormField>
              <FormField label="Scale" hint={provenance("scale")}>
                {" "}
                <NativeSelect
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
                </NativeSelect>
              </FormField>
              <FormField label="Intent" hint={provenance("intent")}>
                {" "}
                <NativeSelect
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
                </NativeSelect>
              </FormField>
              <FormField label="Density" hint={provenance("density")}>
                {" "}
                <NativeSelect
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
                </NativeSelect>
              </FormField>
              <fieldset className="studio-fieldset">
                <legend>Traits</legend>
                <Stack gap="xs">
                  {traits.map((t) => (
                    <Checkbox
                      key={t}
                      checked={(
                        edits.traits?.value ??
                        current.classification?.traits?.value ??
                        []
                      ).includes(t)}
                      onCheckedChange={({ checked }) => {
                        changed();
                        const selected =
                          edits.traits?.value ??
                          current.classification?.traits?.value ??
                          [];
                        setEdits((f) => ({
                          ...f,
                          traits: {
                            value:
                              checked === true
                                ? [...selected, t]
                                : selected.filter((v) => v !== t),
                            source: "human",
                          },
                        }));
                      }}
                    >
                      {t}
                    </Checkbox>
                  ))}
                </Stack>
                <span className="studio-provenance">
                  {provenance("traits")}
                </span>
              </fieldset>
              <FormField label="Review notes">
                {" "}
                <Textarea
                  value={notes ?? current.review?.notes ?? ""}
                  onChange={(e) => {
                    changed();
                    setNotes(e.target.value);
                  }}
                />
              </FormField>
              <FormField label="Rating">
                {" "}
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
              <Inline gap="sm">
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
                <Button
                  tone="accent"
                  disabled={!dirty}
                  onClick={() => act(save)}
                >
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
              </Inline>
            </fieldset>
            <Stack gap="sm">
              <Heading as="h3" size="h4" flush>
                Decision
              </Heading>
              <Inline gap="sm">
                <Button
                  disabled={
                    busy ||
                    dirty ||
                    !["captured", "review"].includes(current.status)
                  }
                  variant="ghost"
                  onClick={() => act(() => client.decide(current, "classify"))}
                >
                  Propose classification
                </Button>
                <Button
                  disabled={busy || dirty || current.status !== "review"}
                  tone="accent"
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
                  variant="soft"
                  tone="danger"
                  onClick={() => act(() => client.decide(current, "reject"))}
                >
                  Reject
                </Button>
                <Button
                  disabled={
                    busy ||
                    dirty ||
                    !["accepted", "rejected", "processing"].includes(
                      current.status,
                    )
                  }
                  variant="ghost"
                  onClick={() => act(() => client.decide(current, "review"))}
                >
                  Return to review
                </Button>
              </Inline>
            </Stack>
            <Text size="caption" tone="tertiary">
              Classifier: {current.classification?.classifier ?? "Not run"}{" "}
              {current.classification?.classifierVersion}
            </Text>
          </Stack>
        </aside>
      </div>
    </Stack>
  );
}
