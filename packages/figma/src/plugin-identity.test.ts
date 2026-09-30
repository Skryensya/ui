import { describe, expect, it } from "vitest";
import { adoptAcrossNewAxes, Identities, NS, pickLayer } from "../plugin/src/identity.js";

/* A node as far as identity cares: a name, and its shared plugin data. */
const node = (tags: Record<string, string>, name = "") => ({
  name,
  getSharedPluginData: (namespace: string, key: string) => (namespace === NS ? (tags[key] ?? "") : ""),
});

describe("plugin identity", () => {
  it("finds a variant by its id, even after its name changed", () => {
    const soft = node({ id: "button/action/tone=danger,variant=soft", cell: "variant=soft, tone=danger" });
    const ids = new Identities([soft]);
    expect(ids.take("button/action/tone=danger,variant=soft", "tone=danger, variant=soft")).toBe(soft);
    expect(ids.rest()).toEqual([]);
  });

  it("adopts a variant synced before ids by its old key, once", () => {
    const legacy = node({ cell: "variant=soft, tone=danger" });
    const ids = new Identities([legacy]);
    expect(ids.take("button/action/tone=danger,variant=soft", "variant=soft, tone=danger")).toBe(legacy);
    expect(ids.take("button/action/other", "variant=soft, tone=danger")).toBeUndefined();
  });

  it("never lets a name claim a node whose id says it is another cell", () => {
    const other = node({ id: "button/action/tone=accent,variant=soft", cell: "variant=soft, tone=danger" });
    const ids = new Identities([other]);
    expect(ids.take("button/action/tone=danger,variant=soft", "variant=soft, tone=danger")).toBeUndefined();
    expect(ids.rest()).toEqual([other]);
  });

  it("keeps a variant through a new axis, as that axis's default", () => {
    const before = node({ id: "button/action/tone=danger,variant=soft", props: JSON.stringify({ variant: "soft", tone: "danger" }) });
    const ids = new Identities([before]);
    const defaults = { variant: "solid", tone: "neutral", size: "md" };
    const atDefault = { props: { variant: "soft", tone: "danger", size: "md" } };
    const atOther = { props: { variant: "soft", tone: "danger", size: "lg" } };
    expect(ids.take("x/lg", "size=lg", adoptAcrossNewAxes(atOther, defaults))).toBeUndefined();
    expect(ids.take("x/md", "size=md", adoptAcrossNewAxes(atDefault, defaults))).toBe(before);
  });

  it("leaves over what nobody took, as the orphans", () => {
    const kept = node({ id: "a" });
    const gone = node({ id: "b" });
    const ids = new Identities([kept, gone]);
    ids.take("a", "");
    expect(ids.rest()).toEqual([gone]);
  });

  it("finds a layer by id, then by its slot under an older id, then by name", () => {
    const cell = { id: "button/action/size=md,tone=danger,variant=soft" };
    const byId = node({ id: `${cell.id}/label` }, "renamed by a designer");
    expect(pickLayer([byId], cell, "label")).toBe(byId);

    const olderId = node({ id: "button/action/tone=danger,variant=soft/label" }, "label");
    expect(pickLayer([olderId], cell, "label")).toBe(olderId);

    const untagged = node({}, "label");
    expect(pickLayer([untagged], cell, "label")).toBe(untagged);

    const someoneElse = node({ id: `${cell.id}/icon` }, "label");
    expect(pickLayer([someoneElse], cell, "label")).toBeNull();
  });
});
