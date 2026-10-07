import { useState } from "react";
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
import { Code, Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import {
  publicationRequestSchema,
  type ReferenceIngest,
  type PublicationPreview,
} from "@skryensya/reference-model";
import type { ReferenceClient } from "./client";
import { toneOf } from "./status";
export function Publication({
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
      {!editable && (
        <Callout tone="info" title="Accept the reference first">
          Publication starts from an accepted reference. Review the
          classification, then accept it from the action bar.
        </Callout>
      )}
      <Stack gap="xs">
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
          <Input
            value={exampleId}
            onChange={(e) => invalidate(() => setExampleId(e.target.value))}
          />
        </FormField>
        <FormField label="Title (English)">
          <Input
            value={titleEn}
            onChange={(e) => invalidate(() => setTitleEn(e.target.value))}
          />
        </FormField>
        <FormField label="Title (Spanish)">
          <Input
            value={titleEs}
            onChange={(e) => invalidate(() => setTitleEs(e.target.value))}
          />
        </FormField>
        <FormField label="Purpose (English)">
          <Textarea
            value={purposeEn}
            onChange={(e) => invalidate(() => setPurposeEn(e.target.value))}
          />
        </FormField>
        <FormField label="Purpose (Spanish)">
          <Textarea
            value={purposeEs}
            onChange={(e) => invalidate(() => setPurposeEs(e.target.value))}
          />
        </FormField>
        {kind === "use" && (
          <FormField label="Existing pattern ID">
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
              <Textarea
                className="studio-mono"
                value={fields}
                onChange={(e) => invalidate(() => setFields(e.target.value))}
              />
            </FormField>
            <FormField label="Layout (English)">
              <Input
                value={layoutEn}
                onChange={(e) => invalidate(() => setLayoutEn(e.target.value))}
              />
            </FormField>
            <FormField label="Layout (Spanish)">
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
