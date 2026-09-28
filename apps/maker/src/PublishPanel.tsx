import { useEffect, useState } from "react";
import { suggestSiteName, siteNameProblem } from "@skryensya/maker-server/names";
import { Button } from "@skryensya/react/button";
import { FormField } from "@skryensya/react/form-field";
import { Icon } from "@skryensya/react/icon";
import { Input } from "@skryensya/react/input";
import { Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import { IconButton } from "./IconButton";
import { getProject, publishingStatus, publishProject, unpublishProject, type Project, type PublishOutcome } from "./projects";
import type { SyncState } from "./sync";
import type { Maker } from "./state";

/*
 * PUBLISHING A PROJECT to https://<name>.skryensya.dev/ (ADR-0033). What goes up is the project as
 * the server holds it, so publishing waits until every change here is saved. The name is the
 * project's once used; taking the site down keeps it. A URL that runs code refuses the publication.
 */
export function PublishPanel({ maker, sync, onClose, onPublished }: { maker: Maker; sync: SyncState; onClose: () => void; onPublished: () => void }) {
  const [status, setStatus] = useState<{ configured: boolean; domain: string | null }>();
  const [project, setProject] = useState<Project>();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [outcome, setOutcome] = useState<PublishOutcome>();
  const [confirming, setConfirming] = useState(false);

  const reload = async () => {
    const [nextStatus, nextProject] = await Promise.all([publishingStatus(), getProject(maker.projectId)]);
    setStatus(nextStatus);
    setProject(nextProject);
    setName((current) => current || nextProject.publication?.siteName || suggestSiteName(nextProject.name));
  };

  useEffect(() => {
    reload().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [maker.projectId]);

  const problem = name ? siteNameProblem(name) : "A site needs a name.";
  const published = project?.publication;
  const unsavedHere = sync !== "saved";
  const behind = published && project && project.revision > published.revision;

  const publish = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setOutcome(await publishProject(maker.projectId, name));
      await reload();
      onPublished();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    setConfirming(false);
    setBusy(true);
    try {
      await unpublishProject(maker.projectId);
      setOutcome(undefined);
      await reload();
      onPublished();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="maker-publish">
      <Stack gap="md">
        <Inline justify="between" align="center">
          <Heading as="h2" size="h4">
            Publish
          </Heading>
          <IconButton icon={{ role: "close" }} label="Close publish" onClick={onClose} />
        </Inline>

        {status && !status.configured ? (
          <Text size="sm">
            Publishing is off on this Maker. Put the Worker's publish token in <code>apps/maker/.env.local</code> as{" "}
            <code>SITES_PUBLISH_TOKEN</code> and restart it (see <code>apps/sites-worker/README.md</code>).
          </Text>
        ) : null}

        {published ? (
          <div className="maker-publish__live" role="status">
            <Text size="sm">
              Live at{" "}
              <a href={published.url} target="_blank" rel="noreferrer">
                {published.url}
              </a>
              , revision {published.revision}.
            </Text>
            {behind ? <Text size="sm">There are changes since: revision {project!.revision} is not published yet.</Text> : null}
          </div>
        ) : (
          <Text size="sm" tone="secondary">
            Not published.
          </Text>
        )}

        <FormField label="Site name" hint={status?.domain ? `https://${name || "…"}.${status.domain}/` : undefined} error={name && problem ? problem : undefined}>
          <Input value={name} onChange={(event) => setName(event.currentTarget.value.toLowerCase())} spellCheck={false} />
        </FormField>

        <Inline gap="sm">
          <Button
            variant="solid"
            tone="accent"
            size="sm"
            pre={<Icon name="upload" />}
            disabled={!status?.configured || Boolean(problem) || busy || unsavedHere}
            onClick={() => void publish()}
          >
            {busy ? "Publishing…" : published ? "Publish changes" : "Publish"}
          </Button>
          {published ? (
            confirming ? (
              <Button variant="solid" tone="danger" size="sm" disabled={busy} onClick={() => void unpublish()}>
                Take {published.siteName} down
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirming(true)}>
                Unpublish
              </Button>
            )
          ) : null}
        </Inline>
        {unsavedHere ? <Text size="sm" tone="tertiary">Saving your last change first…</Text> : null}

        {error ? (
          <Text size="sm" role="alert">
            {error}
          </Text>
        ) : null}

        {outcome && outcome.pending.length > 0 ? (
          <div className="maker-publish__pending">
            <Text size="sm">Published, with {outcome.pending.length} thing(s) still pending:</Text>
            <ul>
              {outcome.pending.slice(0, 8).map((item, index) => (
                <li key={index}>
                  <Text size="sm">
                    {item.page}: {item.message}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Stack>
    </div>
  );
}
