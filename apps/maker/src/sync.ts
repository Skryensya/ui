import { useEffect, useRef, useState } from "react";
import { parseSite, randomId, serializeSite, type MakerSite } from "@skryensya/maker-model";
import { getProject, projectEvents, saveProject, type Project } from "./projects";
import { CATALOGUE_HASH, type Maker } from "./state";

/*
 * AN OPEN PROJECT, KEPT IN STEP WITH ITS ROW (see `server/api.ts`). What the person does is saved;
 * what someone else saves (an agent through the MCP, the same project open in another window)
 * arrives here and is taken in as one undoable step. Each side saves only on top of the revision it
 * last saw, so neither overwrites the other: a refused save means the project moved, and the Maker
 * takes that version, with the person's own one step back in undo.
 *
 * Writes are serial: one save at a time, each on top of the revision the previous returned, and a
 * change made while one is in flight is saved right after it. An event that arrives during a save
 * is looked at once the save is done, because until then it cannot be told apart from that save's
 * own echo, and taking the echo would put an older site over a newer one.
 */

export type SyncState = "syncing" | "saved" | "offline";

/* Per project, outside any component, so a tab that is not showing keeps what it knew. */
const known = new Map<string, number>();
const saved = new Map<string, MakerSite>();

/** Server revision evidence; local edit generations are separately guarded by state.ts. */
export const knownRevision = (id: string): number => known.get(id) ?? 0;

/** Record what a project was when it was opened: the revision and the site the server holds. */
export function opened(project: Project): void {
  known.set(project.id, project.revision);
  saved.set(project.id, project.site);
}

export function closed(id: string): void {
  known.delete(id);
  saved.delete(id);
}

const same = (a: MakerSite | undefined, b: MakerSite) => a !== undefined && serializeSite(a, CATALOGUE_HASH) === serializeSite(b, CATALOGUE_HASH);

export function useProjectSync(maker: Maker, enabled: boolean): SyncState {
  const id = maker.projectId;
  const [state, setState] = useState<SyncState>("saved");
  const live = useRef(maker);
  live.current = maker;
  const writing = useRef(false);
  const again = useRef(false);
  const missed = useRef(false);

  const take = (project: Project, notice?: string) => {
    const checked = parseSite(JSON.stringify(project.site), CATALOGUE_HASH, randomId);
    if (!checked.ok) return;
    known.set(id, project.revision);
    saved.set(id, checked.site);
    if (!same(checked.site, live.current.site)) live.current.receive(checked.site, notice);
  };

  /*
   * A change heard from outside is taken only when nothing made here is still unsaved. Otherwise the
   * unsaved change is saved first: if the project really moved, that save is refused and the refusal
   * brings the other version in (with this one a step back in undo); if it was only an echo of an
   * earlier save of ours, nothing was lost to a race.
   */
  const pull = async (notice?: string) => {
    try {
      if (!same(saved.get(id), live.current.site)) {
        void flush();
        return;
      }
      const project = await getProject(id);
      if (project.revision > (known.get(id) ?? 0) && same(saved.get(id), live.current.site)) take(project, notice);
    } catch {
      setState("offline");
    }
  };

  const flush = async () => {
    if (writing.current) {
      again.current = true;
      return;
    }
    writing.current = true;
    try {
      do {
        again.current = false;
        const site = live.current.site;
        if (same(saved.get(id), site)) break;
        setState("syncing");
        const result = await saveProject(id, known.get(id) ?? 0, JSON.parse(serializeSite(site, CATALOGUE_HASH)) as MakerSite);
        if (result.ok) {
          known.set(id, result.revision);
          saved.set(id, site);
        } else {
          take(result.current, "This project changed elsewhere before your change was saved; it now shows that version (undo brings yours back).");
          break;
        }
      } while (again.current);
      setState("saved");
    } catch {
      setState("offline");
    } finally {
      writing.current = false;
    }
    if (missed.current) {
      missed.current = false;
      await pull("Someone else changed this project. Undo to take it back.");
    }
  };

  /* Becoming the tab that shows: catch up with anything saved while it was not. */
  useEffect(() => {
    if (enabled) void pull("This project changed while it was in the background.");
  }, [enabled, id]);

  /* Every change made here is saved, shortly after it settles. */
  useEffect(() => {
    if (!enabled || same(saved.get(id), maker.site)) return;
    const timer = window.setTimeout(() => void flush(), 150);
    return () => window.clearTimeout(timer);
  }, [enabled, id, maker.site]);

  /* What changes the project from outside arrives as an event and is read. */
  useEffect(() => {
    if (!enabled) return;
    const events = projectEvents(id);
    events.onmessage = (event) => {
      const { revision, op } = JSON.parse(event.data as string) as { revision: number | null; op: string };
      if (op === "delete") {
        live.current.say("This project was deleted elsewhere. Export it to keep a copy.");
        return;
      }
      if (revision === null || revision <= (known.get(id) ?? 0)) return;
      if (writing.current) {
        missed.current = true;
        return;
      }
      void pull("Someone else changed this project. Undo to take it back.");
    };
    events.onerror = () => setState("offline");
    events.onopen = () => setState((current) => (current === "offline" ? "saved" : current));
    return () => events.close();
  }, [enabled, id]);

  return state;
}
