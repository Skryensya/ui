import { expect, it, vi } from "vitest";
import {
  captureFixture,
  ingestFixture,
} from "@skryensya/reference-model/testing";
import { payload, submitCapture } from "./capture";
it("constructs validated evidence payloads for page, region and element without taxonomy or publication logic", () => {
  const c = captureFixture();
  for (const mode of ["page", "region", "element"] as const) {
    const p = payload({ ...c.raw, mode }, c.source, c.screenshot, "Notes");
    expect(p.raw.mode).toBe(mode);
    expect(p.notes).toBe("Notes");
    expect(p).not.toHaveProperty("classification");
    expect(p).not.toHaveProperty("publication");
  }
  expect(() =>
    payload(c.raw, { ...c.source, hostname: "other.example" }, c.screenshot),
  ).toThrow();
});
it("submits to Reference Server and opens only the returned ingest in Studio", async () => {
  const open = vi.fn(async () => {}),
    i = ingestFixture();
  const transport: typeof fetch = async (url, init) => {
    expect(String(url)).toBe("https://reference.example/api/ingests");
    expect((init?.headers as Record<string, string>).authorization).toBe(
      "Bearer secret",
    );
    expect(JSON.parse(String(init?.body)).raw.mode).toBe("region");
    return Response.json(i, { status: 201 });
  };
  await submitCapture(
    {
      server: "https://reference.example",
      studio: "https://studio.example",
      token: "secret",
    },
    captureFixture(),
    transport,
    open,
  );
  expect(open).toHaveBeenCalledWith(`https://studio.example/#/ingests/${i.id}`);
});
it("does not open Studio on server failures or invalid responses", async () => {
  const open = vi.fn(async () => {}),
    config = {
      server: "https://reference.example",
      studio: "https://studio.example",
      token: "secret",
    };
  await expect(
    submitCapture(
      config,
      captureFixture(),
      async () => new Response("No permission", { status: 403 }),
      open,
    ),
  ).rejects.toThrow("403");
  await expect(
    submitCapture(
      config,
      captureFixture(),
      async () => Response.json({ id: "invalid" }),
      open,
    ),
  ).rejects.toThrow();
  expect(open).not.toHaveBeenCalled();
});
