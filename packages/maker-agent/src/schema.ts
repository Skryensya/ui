import { z } from "zod";

const place = z.object({ parent: z.string(), slot: z.string(), index: z.number().int().min(0) }).strict();
const signature = z.object({ contract: z.string(), signature: z.string() }).strict();
const option = z.union([z.string(), z.number(), z.boolean()]);
const pageOperation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("insert"), at: place, tree: z.record(z.string(), z.unknown()).optional(), signature: signature.optional() }).strict(),
  z.object({ type: z.literal("move"), child: z.string(), to: place }).strict(),
  z.object({ type: z.literal("remove"), child: z.string() }).strict(),
  z.object({ type: z.literal("wrap"), children: z.array(z.string()).min(1).max(100), with: signature.extend({ options: z.record(z.string(), option).optional() }).strict() }).strict(),
  z.object({ type: z.literal("unwrap"), node: z.string() }).strict(),
  z.object({ type: z.literal("setOption"), node: z.string(), name: z.string(), value: option.optional() }).strict(),
  z.object({ type: z.literal("setAttr"), node: z.string(), name: z.string(), value: z.string().optional() }).strict(),
  z.object({ type: z.literal("setText"), node: z.string(), slot: z.string().optional(), text: z.string().max(16000) }).strict(),
]);

/** Shared by embedded AI and MCP. No coordinates, code, styles or arbitrary patch operation. */
export const siteOperation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page"), page: z.string(), operations: z.array(pageOperation).min(1).max(100) }).strict(),
  z.object({ type: z.literal("addPage"), name: z.string(), path: z.string(), index: z.number().int().min(0).optional() }).strict(),
  z.object({ type: z.literal("removePage"), page: z.string() }).strict(),
  z.object({ type: z.literal("renamePage"), page: z.string(), name: z.string() }).strict(),
  z.object({ type: z.literal("setPagePath"), page: z.string(), path: z.string() }).strict(),
  z.object({ type: z.literal("movePage"), page: z.string(), index: z.number().int().min(0) }).strict(),
]);
export const proposalInput = z.object({ operations: z.array(siteOperation).min(1).max(100) }).strict();
