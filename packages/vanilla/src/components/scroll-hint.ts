import { scrollHintAttrs } from "@skryensya/core/scroll-hint";
import { watchScrollHint } from "@skryensya/core/scroll-hint-dom";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export const mountScrollHint = createConnectMount({
  key: "scroll-hint",
  rootSelector: `[${scrollHintAttrs.root}]`,
  connect: watchScrollHint,
});
