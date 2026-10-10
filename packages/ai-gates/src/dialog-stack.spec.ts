import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

for (const binding of ["react", "vanilla"] as const) {
  test(`DialogStack ${binding}: navigation, inert steps, Tab wrap and Escape`, async ({ page }) => {
    await waitForStage(page);
    // The canonical stage includes other open overlays; this interaction owns the top layer now.
    await page.evaluate(() => {
      document.querySelectorAll("dialog[open]").forEach(dialog => (dialog as HTMLDialogElement).close());
    });
    const root = page.locator(`[data-case="dialog-stack/default"] [data-binding="${binding}"] .sk-dialog-stack`);
    const trigger = root.locator(".sk-dialog-stack__trigger");
    await trigger.click();
    const dialog = root.locator("dialog");
    await expect(dialog).toHaveAttribute("open", "");
    const panels = root.locator(".sk-dialog-stack__content");
    await expect(panels.nth(0)).toBeFocused();
    await panels.nth(0).locator(".sk-dialog-stack__next").click();
    await expect(panels.nth(1)).toBeFocused();
    await expect(panels.nth(0)).toHaveAttribute("inert", "");
    await expect(dialog).toHaveAccessibleName("Invite your team");
    await panels.nth(1).locator(".sk-dialog-stack__next").click();
    const last = panels.nth(2);
    await last.locator(".sk-dialog-stack__close").focus();
    await page.keyboard.press("Tab");
    await expect(last.locator(".sk-dialog-stack__previous")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toHaveAccessibleName("Name your workspace");
    // Releasing a selection/drag on the backdrop must not abandon the task.
    const bounds = (await panels.nth(0).locator(".sk-dialog-stack__title").boundingBox())!;
    await page.mouse.move(bounds.x + 5, bounds.y + 5);
    await page.mouse.down();
    await page.mouse.move(5, 5);
    await page.mouse.up();
    await expect(dialog).toHaveAttribute("open", "");
    // A new press that actually starts on the backdrop dismisses it.
    await page.mouse.click(5, 5);
    await expect(dialog).not.toHaveAttribute("open", "");
  });

  test(`DialogStack ${binding}: opaque cards recede and retarget without a centring jump`, async ({ page }) => {
    await waitForStage(page);
    await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => (dialog as HTMLDialogElement).close()));
    const root = page.locator(`[data-case="dialog-stack/default"] [data-binding="${binding}"] .sk-dialog-stack`);
    await root.locator(".sk-dialog-stack__trigger").click();
    const motion = await root.evaluate(element => {
      const dialog = element.querySelector("dialog")!;
      const panels = Array.from(dialog.querySelectorAll<HTMLElement>(".sk-dialog-stack__content"));
      panels[0].querySelector("p")!.textContent = "A detailed description of this step. ".repeat(25);
      dialog.getAnimations({ subtree: true }).forEach(animation => animation.finish());
      const before = dialog.getBoundingClientRect().top;
      // Keep both style snapshots in one browser task, rather than racing a 120ms transition.
      getComputedStyle(panels[1]).opacity;
      panels[0].querySelector(".sk-dialog-stack__next")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
      const after = dialog.getBoundingClientRect().top;
      const animations = dialog.getAnimations({ subtree: true });
      animations.forEach(animation => {
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      });
      const incoming = getComputedStyle(panels[1]);
      const outgoingText = getComputedStyle(panels[0].querySelector("header")!);
      const result = {
        jump: Math.abs(after - before),
        incomingOpacity: Number(incoming.opacity),
        previousOpacity: Number(getComputedStyle(panels[0]).opacity),
        dialogOpacity: Number(getComputedStyle(dialog).opacity),
        incomingY: new DOMMatrixReadOnly(incoming.transform).m42,
        outgoingTextVisibility: outgoingText.visibility,
        outgoingTextOpacity: Number(outgoingText.opacity),
        duration: Number(animations[0].effect!.getTiming().duration),
        inert: panels[0].hasAttribute("inert"),
        recentering: animations.some(animation => (animation.effect as KeyframeEffect).getKeyframes().some(frame => "translate" in frame)),
      };
      // Reverse before settling. The next animation must start at the painted position.
      const beforeReverse = dialog.getBoundingClientRect().top;
      panels[1].querySelector(".sk-dialog-stack__previous")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
      const reverseJump = Math.abs(dialog.getBoundingClientRect().top - beforeReverse);
      dialog.getAnimations({ subtree: true }).forEach(animation => animation.finish());
      return { ...result, reverseJump, index: (element as HTMLElement).dataset.activeIndex };
    });
    expect(motion.jump).toBeLessThan(1);
    expect(motion.reverseJump).toBeLessThan(1);
    expect(motion.incomingOpacity).toBe(1);
    expect(motion.previousOpacity).toBe(1);
    expect(motion.dialogOpacity).toBe(1);
    expect(motion.outgoingTextOpacity).toBe(1);
    expect(motion.incomingY).toBeGreaterThan(0);
    expect(motion.outgoingTextVisibility).toBe("hidden");
    expect(motion.duration).toBeLessThanOrEqual(120);
    expect(motion.duration).toBe(120);
    expect(motion.inert).toBe(true);
    expect(motion.recentering).toBe(true);
    expect(motion.index).toBe("0");
    await root.locator(".sk-dialog-stack__next").first().focus();
    await page.keyboard.press("Enter");
    await expect(root).toHaveAttribute("data-motion", "instant");
    expect(await root.locator("dialog").evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test(`DialogStack ${binding}: compact viewport, long content and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 480 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForStage(page);
    await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => (dialog as HTMLDialogElement).close()));
    const root = page.locator(`[data-case="dialog-stack/default"] [data-binding="${binding}"] .sk-dialog-stack`);
    await root.locator(".sk-dialog-stack__trigger").click();
    const panel = root.locator('.sk-dialog-stack__content[data-state="active"]');
    await panel.locator(".sk-dialog-stack__description").evaluate(element => { element.textContent = "A long description of this task. ".repeat(80); });
    const bounds = (await panel.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(480);
    expect(await panel.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await root.locator("dialog").evaluate(element => getComputedStyle(element).transform)).toBe("none");
    await panel.locator(".sk-dialog-stack__next").click();
    await expect(root.locator("dialog")).toHaveAccessibleName("Invite your team");
    expect(await root.locator('[data-state="active"]').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBe(0);
    expect(await root.locator("dialog").evaluate(element => element.getAnimations().some(animation => (animation.effect as KeyframeEffect).getKeyframes().some(frame => "translate" in frame)))).toBe(false);
    await page.keyboard.press("Escape");
    await expect(root.locator(".sk-dialog-stack__trigger")).toBeFocused();
  });
}
