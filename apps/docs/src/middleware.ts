import { defineMiddleware } from "astro:middleware";
import { paintIconPlaceholders } from "./lib/paint-icons";

/** Every page leaves with its icons already drawn; see `lib/paint-icons.ts`. */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  return new Response(paintIconPlaceholders(await response.text()), response);
});
