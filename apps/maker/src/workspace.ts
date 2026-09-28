import { useCallback, useEffect, useState } from "react";
import type { MakerSite } from "@skryensya/maker-model";
import {
  available,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  renameProject,
  type ProjectSummary,
} from "./projects";
import { forgetProject, LOCAL_PROJECT, seedProject } from "./state";
import { closed, opened } from "./sync";

/*
 * THE WORKSPACE: which projects exist, which are open as tabs, and which one shows. Open tabs and
 * the showing one are remembered in this browser (and the showing one in the address, so a link
 * opens it). Without a projects server there is one project, the browser-only one, and nothing to
 * list.
 */

export type WorkspaceMode = { kind: "connecting" } | { kind: "server"; store: string } | { kind: "local"; reason: string };

const OPEN_KEY = "skryensya-maker:open";
const ACTIVE_KEY = "skryensya-maker:active";

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Not remembered; nothing else depends on it. */
  }
}

function showInAddress(id: string | undefined): void {
  const url = new URL(window.location.href);
  if (id && id !== LOCAL_PROJECT) url.searchParams.set("project", id);
  else url.searchParams.delete("project");
  window.history.replaceState(null, "", url);
}

export function useWorkspace() {
  const [mode, setMode] = useState<WorkspaceMode>({ kind: "connecting" });
  const [projects, setProjects] = useState<readonly ProjectSummary[]>([]);
  const [open, setOpen] = useState<readonly string[]>([]);
  const [active, setActive] = useState<string | undefined>();
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  /** Fetch a project, give it its state and a tab, and show it. */
  const openProject = useCallback(async (id: string) => {
    try {
      const project = await getProject(id);
      opened(project);
      seedProject(id, project.site);
      setOpen((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
      setActive(id);
      setError(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  const create = useCallback(
    async (name: string, site?: MakerSite) => {
      const project = await createProject(name, site);
      await refresh();
      await openProject(project.id);
    },
    [refresh, openProject],
  );

  const close = useCallback((id: string) => {
    forgetProject(id);
    closed(id);
    setOpen((tabs) => {
      const next = tabs.filter((tab) => tab !== id);
      setActive((current) => (current === id ? next[Math.max(0, tabs.indexOf(id) - 1)] : current));
      return next;
    });
  }, []);

  const rename = useCallback(
    async (id: string, name: string) => {
      await renameProject(id, name);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteProject(id);
      close(id);
      await refresh();
    },
    [close, refresh],
  );

  /* Start: find out whether there is a server, then reopen what was open. */
  useEffect(() => {
    /* Read before anything is awaited: once the workspace is up it writes the address itself. */
    const fromAddress = new URLSearchParams(window.location.search).get("project");
    void (async () => {
      const server = await available();
      if (!server.ok) {
        seedProject(LOCAL_PROJECT);
        setMode({ kind: "local", reason: server.reason });
        setOpen([LOCAL_PROJECT]);
        setActive(LOCAL_PROJECT);
        return;
      }
      const list = await listProjects().catch(() => [] as ProjectSummary[]);
      setProjects(list);
      const exists = new Set(list.map((project) => project.id));
      const tabs = read<string[]>(OPEN_KEY, []).filter((id) => exists.has(id));
      if (fromAddress && exists.has(fromAddress) && !tabs.includes(fromAddress)) tabs.push(fromAddress);
      for (const id of tabs) await openProject(id);
      const wanted = fromAddress && exists.has(fromAddress) ? fromAddress : read<string | null>(ACTIVE_KEY, null);
      setActive(wanted && tabs.includes(wanted) ? wanted : tabs.at(-1));
      /* Last: from here on the workspace remembers itself, so it must already be what it restored. */
      setMode({ kind: "server", store: server.store });
    })();
  }, [openProject]);

  useEffect(() => {
    if (mode.kind !== "server") return;
    write(OPEN_KEY, open);
    write(ACTIVE_KEY, active ?? null);
    showInAddress(active);
  }, [mode.kind, open, active]);

  const nameOf = (id: string) => (id === LOCAL_PROJECT ? "This browser" : (projects.find((project) => project.id === id)?.name ?? "…"));

  return { mode, projects, open, active, error, nameOf, setActive, openProject, create, close, rename, remove, refresh };
}

export type Workspace = ReturnType<typeof useWorkspace>;
