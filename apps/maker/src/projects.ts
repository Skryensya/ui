import type { MakerSite } from "@skryensya/maker-model";

/*
 * The projects API as the Maker calls it (see `server/api.ts`). Every call either answers or
 * throws; `available` tells the workspace whether there is a server at all, so a static build or a
 * stopped database leaves the Maker working in the browser alone instead of failing.
 */

export type ProjectSummary = { id: string; name: string; revision: number; updatedAt: string };
export type Project = ProjectSummary & { site: MakerSite };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);
  if (!response.ok) throw Object.assign(new Error(((await response.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${response.status}`), { status: response.status });
  return (response.status === 204 ? undefined : await response.json()) as T;
}

const body = (method: string, value: unknown): RequestInit => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(value) });

/** "server" when projects can be listed, with where they live; otherwise why not. */
export async function available(): Promise<{ ok: true; store: string } | { ok: false; reason: string }> {
  try {
    const response = await fetch("/api/health");
    if (!response.ok || !(response.headers.get("content-type") ?? "").includes("json")) {
      const reason = ((await response.json().catch(() => ({}))) as { error?: string }).error;
      return { ok: false, reason: reason ?? "No projects server: the Maker keeps this site in the browser." };
    }
    return { ok: true, store: ((await response.json()) as { store: string }).store };
  } catch {
    return { ok: false, reason: "No projects server: the Maker keeps this site in the browser." };
  }
}

export const listProjects = () => call<ProjectSummary[]>("/projects");
export const getProject = (id: string) => call<Project>(`/projects/${id}`);
export const createProject = (name: string, site?: MakerSite) => call<Project>("/projects", body("POST", { name, site }));
export const renameProject = (id: string, name: string) => call<ProjectSummary>(`/projects/${id}`, body("PATCH", { name }));
export const deleteProject = (id: string) => call<void>(`/projects/${id}`, { method: "DELETE" });

/** Save on top of `baseRevision`: the new revision, or the current project when someone wrote first. */
export async function saveProject(id: string, baseRevision: number, site: MakerSite): Promise<{ ok: true; revision: number } | { ok: false; current: Project }> {
  const response = await fetch(`/api/projects/${id}`, body("PUT", { baseRevision, site }));
  if (response.ok) return { ok: true, revision: ((await response.json()) as { revision: number }).revision };
  if (response.status === 409) return { ok: false, current: (await response.json()) as Project };
  throw new Error(((await response.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${response.status}`);
}

export const projectEvents = (id: string) => new EventSource(`/api/projects/${id}/events`);
