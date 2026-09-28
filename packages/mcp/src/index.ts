#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { fileURLToPath } from "node:url";
import { createServerWith } from "./create-server.js";
import { provenance } from "./manifest.js";
import { stalenessCheck } from "./staleness.js";

/*
 * The stdio entry point: what `.mcp.json` starts (`node dist/index.js`). `serveStdio` owns the
 * connection: the opening exchange picks the protocol era (2026-07-28, or the 2025 `initialize`
 * handshake an older client sends), and ONE instance from the shared factory serves the connection.
 *
 * Nothing here may write to stdout: stdout IS the protocol. Diagnostics go to stderr.
 */
/*
 * Started from a checkout, the compiled index sits three levels up from `dist/index.js`. When it is
 * there, every answer is checked against it; when it is not (an installed copy), nothing is.
 */
const staleness = stalenessCheck(fileURLToPath(new URL("../../../artifacts/ai-index.json", import.meta.url)), provenance.sourceHash);

/* The local Maker, whose projects the maker_* tools read and change: MAKER_URL, or the dev server. */
const makerUrl = process.env.MAKER_URL ?? "http://localhost:4200";

serveStdio(() => createServerWith({ staleness, makerUrl }), {
  onerror: (error) => console.error("skryensya-ui MCP (stdio):", error.message),
});
