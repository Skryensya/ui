import { connectDialogStack } from "@skryensya/core/dialog-stack-controller";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export const DIALOG_STACK_OPEN_EVENT = "sk:dialogstackopenchange";
export const DIALOG_STACK_STEP_EVENT = "sk:dialogstackstepchange";

export function connectDialogStackRoot(root: HTMLElement): () => void {
  const controller = connectDialogStack(root, {
    onOpenRequest(open) {
      controller.setOpen(open);
      root.dispatchEvent(new CustomEvent(DIALOG_STACK_OPEN_EVENT, { detail: { open } }));
    },
    onStepChange(index) {
      root.dispatchEvent(new CustomEvent(DIALOG_STACK_STEP_EVENT, { detail: { index } }));
    },
  });
  controller.setOpen(root.hasAttribute("data-default-open"));
  return () => controller.destroy();
}

export const mountDialogStack = createConnectMount({
  key: "dialog-stack",
  rootSelector: "[data-sk-dialog-stack]",
  connect: connectDialogStackRoot,
});
