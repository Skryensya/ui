import type { APIRoute, GetStaticPaths } from "astro";
import { agentDocFor, agentDocIds } from "../../lib/agent-docs";

/* One family's Markdown at /components/<contract>.md: the file @skryensya/core ships, for an agent or a person to paste into one. */
export const getStaticPaths: GetStaticPaths = () => agentDocIds().map((id) => ({ params: { id } }));

export const GET: APIRoute = ({ params }) =>
  new Response(agentDocFor(String(params.id)) ?? "", {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
