import type { APIRoute, GetStaticPaths } from "astro";
import { blockFragment, canvasBlocks } from "../../../lib/canvas-fragment";
import { componentsCanvas } from "../../../lib/components-canvas";

const blocks = () => canvasBlocks(componentsCanvas());

export const getStaticPaths = (() => blocks().map((b) => ({ params: { id: b.id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(blockFragment(blocks().find((b) => b.id === params.id)!), { headers: { "content-type": "text/html; charset=utf-8" } });
