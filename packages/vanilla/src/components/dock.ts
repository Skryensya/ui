import { animate, motionValue } from "motion";
import { connectDock, dockSpringOptions } from "@skryensya/core/dock-controller";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export const mountDock = createConnectMount({
  key: "dock",
  rootSelector: "[data-sk-dock]",
  connect: root => connectDock(root, (initial, update) => {
    const value = motionValue(initial);
    const unsubscribe = value.on("change", update);
    let playback: ReturnType<typeof animate> | undefined;
    let destination = initial;
    return {
      set(target) {
        if (target === destination) return;
        destination = target;
        playback?.stop();
        playback = animate(value, target, dockSpringOptions);
      },
      destroy() { playback?.stop(); unsubscribe(); value.destroy(); },
    };
  }),
});
