import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  captureFixture,
  classificationFixture,
} from "@skryensya/reference-model/testing";
import {
  ingestSchema,
  type ReferencePublisher,
} from "@skryensya/reference-model";
import { createReferenceApi } from "./api.js";
import { ReferenceService } from "./service.js";
import { memoryAssets } from "./assets.js";
import { memoryStore } from "./store.js";
const unavailable: ReferencePublisher = {
  async preview() {
    throw new Error("Not configured");
  },
  async validate() {
    throw new Error("Not configured");
  },
  async publish() {
    throw new Error("Not configured");
  },
  async merged() {
    return false;
  },
  async reconcile() {
    return undefined;
  },
};
const service = new ReferenceService(
  memoryStore(),
  memoryAssets(),
  {
    async classify() {
      return classificationFixture();
    },
  },
  unavailable,
);
const server = createServer(
  createReferenceApi(service, {
    token: "test-token",
    origins: ["chrome-extension://test"],
  }),
);
let base: string;
beforeAll(async () => {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});
const request = (path: string, method = "GET", body?: unknown) =>
  fetch(base + "/api/" + path, {
    method,
    headers: {
      authorization: "Bearer test-token",
      "content-type": "application/json",
      origin: "chrome-extension://test",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
it("validates input, authenticates every route and serves capture assets", async () => {
  expect((await fetch(base + "/api/ingests")).status).toBe(401);
  expect((await request("ingests", "POST", { unknown: true })).status).toBe(
    400,
  );
  expect(
    (
      await fetch(base + "/api/ingests", {
        headers: { origin: "https://evil.example" },
      })
    ).status,
  ).toBe(403);
  const response = await request("ingests", "POST", captureFixture());
  expect(response.status).toBe(201);
  const i = ingestSchema.parse(await response.json());
  expect(
    (await request(`ingests/${i.id}/screenshot`)).headers.get("content-type"),
  ).toBe("image/png");
  expect((await request(`ingests/${i.id}/raw`)).status).toBe(200);
  expect(
    (await request(`ingests/${i.id}/thumbnail`)).headers.get("content-type"),
  ).toBe("image/png");
  expect(
    (
      await request("ingests", "POST", {
        ...captureFixture(),
        screenshot: "data:image/png;base64,iVBORw0KGgo=",
      })
    ).status,
  ).toBe(400);
  expect((await request("ingests?host=example.com")).status).toBe(200);
  expect((await request("ingests?status=invented")).status).toBe(400);
});
it("rejects stale writes and deletes; accept/reject are explicit routes", async () => {
  const i = ingestSchema.parse(
    await (await request("ingests", "POST", captureFixture())).json(),
  );
  const classified = ingestSchema.parse(
    await (
      await request(`ingests/${i.id}/classify`, "POST", {
        baseRevision: i.revision,
      })
    ).json(),
  );
  expect(
    (
      await request(`ingests/${i.id}/classification`, "PATCH", {
        baseRevision: 1,
        fields: { subject: { value: "hero", source: "human" } },
      })
    ).status,
  ).toBe(409);
  const accepted = ingestSchema.parse(
    await (
      await request(`ingests/${i.id}/accept`, "POST", {
        baseRevision: classified.revision,
      })
    ).json(),
  );
  expect(accepted.status).toBe("accepted");
  expect(
    (await request(`ingests/${i.id}`, "DELETE", { baseRevision: 1 })).status,
  ).toBe(409);
  const rejected = ingestSchema.parse(
    await (
      await request(`ingests/${i.id}/reject`, "POST", {
        baseRevision: accepted.revision,
      })
    ).json(),
  );
  expect(rejected.status).toBe("rejected");
  expect(
    (
      await request(`ingests/${i.id}`, "DELETE", {
        baseRevision: rejected.revision,
      })
    ).status,
  ).toBe(204);
});
