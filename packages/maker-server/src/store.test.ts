import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSite, randomId } from "@skryensya/maker-model";
import { memoryStore, postgresStore, type ProjectEvent, type ProjectStore } from "./store.js";
import { DEFAULT_DATABASE_URL } from "./store.js";

/*
 * One suite, both stores: the in-memory one exists only so the browser checks can run without a
 * database, and it is only honest if it means exactly what Postgres means. The Postgres half runs
 * against DATABASE_URL (the docker-compose database by default) and is skipped, loudly, without one.
 */

const site = () => createSite("hash", randomId);

async function reachable(url: string): Promise<ProjectStore | undefined> {
  try {
    return await postgresStore(url);
  } catch {
    return undefined;
  }
}

const suites: [string, () => Promise<ProjectStore | undefined>][] = [
  ["memory", async () => memoryStore()],
  ["postgres", () => reachable(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL)],
];

for (const [name, open] of suites) {
  describe(`${name} store`, () => {
    let store: ProjectStore | undefined;
    const created: string[] = [];

    beforeAll(async () => {
      store = await open();
      if (!store) console.warn(`${name} store: no database reachable, skipped. Start it with docker compose -f apps/maker/docker-compose.yml up -d.`);
    });
    afterAll(async () => {
      for (const id of created) await store?.remove(id);
      await store?.close();
    });

    const make = async (title: string) => {
      const project = await store!.create(title, site());
      created.push(project.id);
      return project;
    };

    it("creates a project at revision 1 and reads it back whole", async (context) => {
      if (!store) return context.skip();
      const project = await make("Landing");
      expect(project.revision).toBe(1);
      const read = await store.get(project.id);
      expect(read?.site.pages[0]?.path).toBe("/");
      expect((await store.list()).some((entry) => entry.id === project.id)).toBe(true);
    });

    it("saves on top of the current revision only, and hands back the current project otherwise", async (context) => {
      if (!store) return context.skip();
      const project = await make("Concurrent");
      const first = await store.save(project.id, 1, { ...project.site, pages: [{ ...project.site.pages[0]!, name: "Inicio" }] });
      expect(first).toEqual({ ok: true, revision: 2 });
      const stale = await store.save(project.id, 1, project.site);
      expect(stale.ok).toBe(false);
      expect(stale.ok === false && "conflict" in stale && stale.conflict.revision).toBe(2);
      expect((await store.get(project.id))?.site.pages[0]?.name).toBe("Inicio");
    });

    it("renames, removes, and says so when a project is gone", async (context) => {
      if (!store) return context.skip();
      const project = await make("Old name");
      expect((await store.rename(project.id, "New name"))?.name).toBe("New name");
      expect(await store.remove(project.id)).toBe(true);
      expect(await store.get(project.id)).toBeUndefined();
      expect(await store.save(project.id, 1, project.site)).toEqual({ ok: false, missing: true });
    });

    it("announces every change to subscribers", async (context) => {
      if (!store) return context.skip();
      const events: ProjectEvent[] = [];
      const stop = store.subscribe((event) => events.push(event));
      const project = await make("Watched");
      await store.save(project.id, 1, project.site);
      await expect.poll(() => events.filter((event) => event.id === project.id).map((event) => event.revision)).toEqual([1, 2]);
      stop();
    });
  });
}
