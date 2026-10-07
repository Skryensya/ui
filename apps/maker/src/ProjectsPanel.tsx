import { useEffect, useState } from "react";
import { NativeSelect } from "@skryensya/react/select-native";
import { listTemplates, templateSite, type TemplateEntry, type TemplateLocale } from "./templates";
import { Button } from "@skryensya/react/button";
import { TileButton, TileContent } from "@skryensya/react/tile";
import { Icon } from "@skryensya/react/icon";
import { Input, Textarea } from "@skryensya/react/input";
import { FormField } from "@skryensya/react/form-field";
import { Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import { IconButton } from "./IconButton";
import { CommitField } from "./Inspector";
import type { Workspace } from "./workspace";

/*
 * EVERY PROJECT THE SERVER HOLDS: open one in a tab, rename it, delete it, or start a new one.
 * Deleting asks twice, in place, because it is the one thing here undo cannot bring back.
 */

const when = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function ProjectsPanel({ workspace, onClose }: { workspace: Workspace; onClose?: () => void }) {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState<string>();
  const [renaming, setRenaming] = useState<string>();

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!(await workspace.create(trimmed))) return;
    setName("");
    onClose?.();
  };

  return (
    <div className="maker-projects">
      <Stack gap="md">
        <Inline justify="between" align="center">
          <Heading as="h2" size="h4">
            Projects
          </Heading>
          {onClose ? <IconButton icon={{ role: "close" }} label="Close projects" onClick={onClose} /> : null}
        </Inline>
        {workspace.mode.kind === "server" ? (
          <Text size="sm" tone="tertiary">
            Kept in {workspace.mode.store === "postgres" ? "PostgreSQL" : "this server's memory (lost when it stops)"}.
          </Text>
        ) : null}

        <form
          className="maker-projects__new"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <FormField label="New project">
            <Input value={name} placeholder="Landing page" onChange={(event) => setName(event.currentTarget.value)} />
          </FormField>
          <Button type="submit" variant="solid" size="lg" pre={<Icon name="add" />} disabled={!name.trim()}>
            Create
          </Button>
        </form>

        <TemplateGallery workspace={workspace} onCreated={onClose} />

        {workspace.error ? (
          <Text size="sm" role="alert">
            {workspace.error}
          </Text>
        ) : null}

        {workspace.projects.length === 0 ? (
          <Text tone="secondary">No projects yet. Name one above to start.</Text>
        ) : (
          <ul className="maker-projects__list" aria-label="All projects">
            {workspace.projects.map((project) => {
              const isOpen = workspace.open.includes(project.id);
              return (
                <li key={project.id} className="maker-projects__item">
                  {renaming === project.id ? (
                    <CommitField
                      label="Project name"
                      value={project.name}
                      onCommit={(next) => {
                        setRenaming(undefined);
                        if (next.trim()) void workspace.rename(project.id, next.trim());
                      }}
                    />
                  ) : (
                    <TileButton
                      padding="sm"
                      className="maker-projects__open"
                      onClick={() => {
                        void workspace.openProject(project.id);
                        onClose?.();
                      }}
                    >
                      <TileContent title={project.name} description={`${isOpen ? "Open · " : ""}${when.format(new Date(project.updatedAt))}`} />
                    </TileButton>
                  )}
                  <Inline gap="xs">
                    <IconButton icon={{ role: "edit" }} label={`Rename ${project.name}`} onClick={() => setRenaming(project.id)} />
                    {confirming === project.id ? (
                      <Button
                        variant="solid"
                        tone="danger"
                        size="sm"
                        onClick={() => {
                          setConfirming(undefined);
                          void workspace.remove(project.id);
                        }}
                      >
                        Delete {project.name}
                      </Button>
                    ) : (
                      <IconButton icon={{ role: "delete" }} label={`Delete ${project.name}`} tone="danger" onClick={() => setConfirming(project.id)} />
                    )}
                  </Inline>
                </li>
              );
            })}
          </ul>
        )}
      </Stack>
    </div>
  );
}

/** The docs gallery's templates: a new project starts as one of them. */
function TemplateGallery({ workspace, onCreated }: { workspace: Workspace; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<TemplateLocale>("es");
  const [templates, setTemplates] = useState<TemplateEntry[]>([]);
  const [busy, setBusy] = useState<string>();
  /* A template is chosen first and made second: in between, its prompt for Maker AI can be read and made this project's own. */
  const [chosen, setChosen] = useState<TemplateEntry>();
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (open) void listTemplates(locale).then(setTemplates);
  }, [open, locale]);
  useEffect(() => { setChosen(undefined); }, [locale]);

  const choose = (template: TemplateEntry) => { setChosen(template); setPrompt(template.prompt ?? ""); };
  const start = async (id: string) => {
    setBusy(id);
    try {
      const opened = await templateSite(id, locale, prompt);
      /* Kept open on a failure, with what was typed: the error says why above, and Create can be pressed again. */
      if (!opened || !(await workspace.create(opened.title, opened.site))) return;
      setChosen(undefined);
      onCreated?.();
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <section className="maker-templates" aria-labelledby="maker-templates-title">
      <Stack gap="sm">
        <Inline justify="between" align="center" gap="sm">
          <span>
            <Heading as="h3" size="h6" id="maker-templates-title">
              Templates
            </Heading>
            <Text size="sm" tone="tertiary">
              Start faster with a ready-made site.
            </Text>
          </span>
          <Button
            variant="ghost"
            size="sm"
            pressed={open}
            aria-expanded={open}
            aria-controls="maker-templates-list"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Hide" : "Browse"}
          </Button>
        </Inline>
        {open ? (
          <Stack gap="sm" id="maker-templates-list">
            <FormField label="Language">
              <NativeSelect
                value={locale}
                onChange={(event) => setLocale(event.currentTarget.value as TemplateLocale)}
                options={[
                  { value: "es", label: "Español" },
                  { value: "en", label: "English" },
                ]}
              />
            </FormField>
            {chosen ? (
              <section className="maker-templates__chosen" aria-label={`New project from ${chosen.title}`}>
                <Stack gap="sm">
                  <Text weight="emphasis">{chosen.title}</Text>
                  <FormField label="Prompt for Maker AI" hint="Maker AI reads this with every request in this project: what the product is, who uses it, the tone. Edit it to describe yours; you can change it later from Maker AI.">
                    <Textarea rows={7} value={prompt} maxLength={4000} onChange={(event) => setPrompt(event.currentTarget.value)} />
                  </FormField>
                  <Inline gap="sm">
                    <Button size="sm" tone="accent" disabled={busy !== undefined} onClick={() => void start(chosen.id)}>{busy === chosen.id ? "Creating…" : "Create project"}</Button>
                    <Button size="sm" variant="ghost" disabled={busy !== undefined} onClick={() => setChosen(undefined)}>Back to templates</Button>
                  </Inline>
                </Stack>
              </section>
            ) : templates.length === 0 ? (
              <Text size="sm" tone="secondary">
                Loading templates…
              </Text>
            ) : (
              <ul className="maker-templates__list" aria-label="Templates">
                {templates.map((template) => (
                  <li key={template.id}>
                    <Button className="maker-templates__card" variant="ghost" size="sm" disabled={busy !== undefined} onClick={() => choose(template)}>
                      <span className="maker-templates__thumb" aria-hidden="true">
                        {(["light", "dark"] as const).map((scheme) => (
                          <img key={scheme} className={`maker-templates__thumb-image maker-templates__thumb-image--${scheme}`} src={`/template-thumbnails/${template.id}.${locale}.${scheme}.png`} alt="" loading="lazy" draggable={false} onError={(event) => (event.currentTarget.hidden = true)} />
                        ))}
                      </span>
                      <span className="maker-projects__name">{template.title}</span>
                      <span className="maker-projects__meta">{template.description}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Stack>
        ) : null}
      </Stack>
    </section>
  );
}
