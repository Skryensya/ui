import { useEffect, useRef, useState } from "react";
import { decodeSiteFile, parseSite, randomId, serializeSite, type MakerSite } from "@skryensya/maker-model";
import { CATALOGUE_HASH, type Maker } from "./state";

/*
 * THE OPEN SITE, KEPT IN STEP WITH ITS FILE (dev server only, see `site-sync.ts`). What the person
 * does is written to the file; what an agent writes to the file (the MCP's `maker_apply`) arrives
 * here and is taken in as one undoable step. Each side writes only on top of the revision it last
 * saw, so neither overwrites the other: a refused write means the file moved, and the Maker reads it.
 *
 * Without the dev server (a static build) there is no file, and the site lives in the browser only.
 */

export type SyncState = "connecting" | "live" | "local";

/** The site the Maker opened: `?site=<name>`, `site` by default, the file the MCP uses. */
export const siteName = new URLSearchParams(window.location.search).get("site") ?? "site";
const query = `?site=${encodeURIComponent(siteName)}`;

const same = (a: MakerSite, b: MakerSite) => serializeSite(a, CATALOGUE_HASH) === serializeSite(b, CATALOGUE_HASH);

export function useSiteSync(maker: Maker): SyncState {
  const [state, setState] = useState<SyncState>("connecting");
  const revision = useRef(0);
  /* The site as last written or received, so what came from the file is never written back. */
  const synced = useRef<MakerSite | undefined>(undefined);
  const live = useRef(maker);
  live.current = maker;

  const take = (text: string, notice?: string): boolean => {
    const file = decodeSiteFile(text);
    if (!file) return false;
    const opened = parseSite(JSON.stringify(file.site), CATALOGUE_HASH, randomId);
    if (!opened.ok) return false;
    revision.current = file.revision;
    synced.current = opened.site;
    if (!same(opened.site, live.current.site)) live.current.receive(opened.site, notice);
    return true;
  };

  /* Open: the file wins when there is one; otherwise this site becomes the file. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/__maker/site${query}`);
        if (cancelled) return;
        if (response.status === 404) {
          synced.current = undefined;
          revision.current = 0;
          setState("live");
          return;
        }
        if (!response.ok || !(response.headers.get("content-type") ?? "").includes("json")) throw new Error("no sync");
        if (!take(await response.text())) throw new Error("unreadable");
        setState("live");
      } catch {
        if (!cancelled) setState("local");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * WRITES ARE SERIAL. One PUT at a time, each on top of the revision the previous one returned;
   * a change made while one is in flight is written right after it. An event that arrives while a
   * write is in flight is looked at once the write is done: until then it cannot be told apart from
   * the echo of that very write, and taking the echo would put an older site over a newer one.
   */
  const writing = useRef(false);
  const again = useRef(false);
  const missed = useRef(false);

  const pull = async (notice?: string) => {
    const response = await fetch(`/__maker/site${query}`);
    if (!response.ok) return;
    const text = await response.text();
    const file = decodeSiteFile(text);
    if (file && file.revision > revision.current) take(text, notice);
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
        if (synced.current && same(synced.current, site)) break;
        const response = await fetch(`/__maker/site${query}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ baseRevision: revision.current, site: JSON.parse(serializeSite(site, CATALOGUE_HASH)) }),
        });
        if (response.ok) {
          revision.current = ((await response.json()) as { revision: number }).revision;
          synced.current = site;
        } else if (response.status === 409) {
          take(await response.text(), "The site changed elsewhere before this change was saved; it now shows that version (undo brings yours back).");
          break;
        } else {
          break;
        }
      } while (again.current);
    } finally {
      writing.current = false;
    }
    if (missed.current) {
      missed.current = false;
      await pull("An agent changed the site. Undo to take it back.");
    }
  };

  /* Every change made here is written, shortly after it settles. */
  useEffect(() => {
    if (state !== "live") return;
    if (synced.current && same(synced.current, maker.site)) return;
    const timer = window.setTimeout(() => void flush(), 150);
    return () => window.clearTimeout(timer);
  }, [state, maker.site]);

  /* What changes the file from outside arrives as an event and is read. */
  useEffect(() => {
    if (state !== "live") return;
    const events = new EventSource(`/__maker/events${query}`);
    events.onmessage = (event) => {
      const { revision: next } = JSON.parse(event.data as string) as { revision: number };
      if (next <= revision.current) return;
      if (writing.current) {
        missed.current = true;
        return;
      }
      void pull("An agent changed the site. Undo to take it back.");
    };
    return () => events.close();
  }, [state]);

  return state;
}
