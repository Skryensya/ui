import { useState } from "react";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { Input } from "@skryensya/react/input";
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
    await workspace.create(trimmed);
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
          <Button type="submit" variant="solid" size="sm" pre={<Icon name="add" />} disabled={!name.trim()}>
            Create
          </Button>
        </form>

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
                    <button
                      type="button"
                      className="maker-projects__open"
                      onClick={() => {
                        void workspace.openProject(project.id);
                        onClose?.();
                      }}
                    >
                      <span className="maker-projects__name">{project.name}</span>
                      <span className="maker-projects__meta">
                        {isOpen ? "Open · " : ""}
                        {when.format(new Date(project.updatedAt))}
                      </span>
                    </button>
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
