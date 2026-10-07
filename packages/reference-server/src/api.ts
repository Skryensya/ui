import type { IncomingMessage, ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  revisionSchema,
  publicationRequestSchema,
  filterSchema,
} from "@skryensya/reference-model";
import { StoreError } from "./store.js";
import type { ReferenceService } from "./service.js";
const base = z.object({ baseRevision: revisionSchema });
export function createReferenceApi(
  service: ReferenceService,
  config: { token: string; origins: string[] },
) {
  if (!config.token) throw new Error("Reference API requires an access token");
  const send = (res: ServerResponse, status: number, value?: unknown) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
    });
    res.end(value === undefined ? undefined : JSON.stringify(value));
  };
  async function body(req: IncomingMessage): Promise<unknown> {
    let size = 0;
    const chunks: Buffer[] = [];
    for await (const c of req as AsyncIterable<Buffer>) {
      size += c.length;
      if (size > 48 * 1024 * 1024)
        throw new StoreError(413, "Capture too large");
      chunks.push(c);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  }
  async function route(req: IncomingMessage, res: ServerResponse) {
    const origin = req.headers.origin;
    if (origin && !config.origins.includes(origin))
      return send(res, 403, { error: "Origin not allowed" });
    if (origin) {
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("vary", "Origin");
    }
    if (req.method === "OPTIONS") {
      res.setHeader(
        "access-control-allow-methods",
        "GET,POST,PATCH,DELETE,OPTIONS",
      );
      res.setHeader(
        "access-control-allow-headers",
        "authorization,content-type",
      );
      return send(res, 204);
    }
    const supplied = Buffer.from(req.headers.authorization ?? ""),
      expected = Buffer.from(`Bearer ${config.token}`);
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      return send(res, 401, { error: "Unauthorized" });
    const url = new URL(req.url ?? "/", "http://reference");
    const parts = url.pathname.split("/").filter(Boolean),
      [api, resource, providedId, sub, action] = parts;
    const id = providedId?.toLowerCase();
    if (api !== "api" || parts.length > 5) return send(res, 404);
    if (resource === "health")
      return send(res, 200, { store: service.store.kind });
    if (resource !== "ingests") return send(res, 404);
    const method = req.method;
    if (!id) {
      if (method === "POST")
        return send(res, 201, await service.create(await body(req)));
      if (method === "GET")
        return send(
          res,
          200,
          await service.store.list(
            filterSchema.parse(Object.fromEntries(url.searchParams)),
          ),
        );
      return send(res, 405);
    }
    z.uuid().parse(id);
    if (method === "GET" && !sub) return send(res, 200, await service.get(id));
    if (method === "GET" && sub === "events") {
      await service.get(id);
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      res.write(": connected\n\n");
      const unsubscribe = service.store.subscribe((event) => {
        if (event.id === id) res.write(`data: ${JSON.stringify(event)}\n\n`);
      });
      const timer = setInterval(() => res.write(": ping\n\n"), 25000);
      res.on("close", () => {
        unsubscribe();
        clearInterval(timer);
      });
      return;
    }
    if (method === "GET" && ["screenshot", "thumbnail", "raw"].includes(sub)) {
      const i = await service.get(id),
        asset = await service.assets.get(
          sub === "raw"
            ? i.capture.rawCaptureAssetId
            : sub === "thumbnail"
              ? (i.capture.thumbnailAssetId ?? i.capture.screenshotAssetId)
              : i.capture.screenshotAssetId,
        );
      if (!asset) return send(res, 404);
      res.writeHead(200, {
        "content-type": asset.contentType,
        "x-content-type-options": "nosniff",
        "cache-control": "private, max-age=3600",
      });
      return res.end(asset.bytes);
    }
    const value = await body(req);
    const { baseRevision } = base.parse(value);
    if (method === "DELETE" && !sub) {
      const i = await service.get(id);
      if (["publishing", "published"].includes(i.status))
        throw new StoreError(
          409,
          "Published and publishing evidence must remain inspectable",
        );
      await service.store.remove(id, baseRevision);
      return send(res, 204);
    }
    if (method === "PATCH" && sub === "classification") {
      const b = base.extend({ fields: z.unknown() }).strict().parse(value);
      return send(
        res,
        200,
        await service.classification(id, baseRevision, b.fields),
      );
    }
    if (method === "PATCH" && !sub)
      return send(res, 200, await service.patch(id, value));
    if (method === "POST" && sub === "classify") {
      base.strict().parse(value);
      return send(res, 200, await service.classify(id, baseRevision));
    }
    if (method === "POST" && ["accept", "reject", "review"].includes(sub)) {
      base.strict().parse(value);
      return send(
        res,
        200,
        await service.decide(
          id,
          baseRevision,
          sub === "accept"
            ? "accepted"
            : sub === "reject"
              ? "rejected"
              : "review",
        ),
      );
    }
    if (method === "POST" && sub === "publication") {
      if (action === "preview") {
        const b = base
          .extend({ request: publicationRequestSchema })
          .strict()
          .parse(value);
        return send(
          res,
          200,
          await service.preview(id, baseRevision, b.request),
        );
      }
      if (action === "publish") {
        const b = base.extend({ digest: z.string() }).strict().parse(value);
        return send(
          res,
          200,
          await service.publish(id, baseRevision, b.digest),
        );
      }
      if (action === "reconcile") {
        const b = base
          .extend({ publicationId: z.uuid() })
          .strict()
          .parse(value);
        return send(
          res,
          200,
          await service.reconcile(id, baseRevision, b.publicationId),
        );
      }
      if (action === "merged") {
        const b = base
          .extend({ publicationId: z.uuid() })
          .strict()
          .parse(value);
        return send(
          res,
          200,
          await service.markMerged(id, baseRevision, b.publicationId),
        );
      }
    }
    return send(res, 404);
  }
  return (req: IncomingMessage, res: ServerResponse) => {
    void route(req, res).catch((e: unknown) => {
      if (res.headersSent) {
        res.end();
        return;
      }
      const status =
        e instanceof StoreError
          ? e.status
          : e instanceof z.ZodError || e instanceof SyntaxError
            ? 400
            : 422;
      send(res, status, { error: e instanceof Error ? e.message : String(e) });
    });
  };
}
