import { expect, test } from "@playwright/test";
import { surfaceAppearanceGate } from "./surface-appearance.js";
import { waitForStage } from "./fixtures.js";

surfaceAppearanceGate({
  name: "Input",
  markup: (id, appearance) => `<input id="${id}" class="sk-input" aria-label="Campo" data-appearance="${appearance}" style="inline-size:220px">`,
  paint: ":scope",
  offset: 3,
  blur: 10,
});

/* Every state still outranks the appearance: an invalid brutalist field keeps its danger edge. */
test("an invalid brutalist field keeps the danger edge, a disabled one drops the offset", async ({ page }) => {
  await waitForStage(page);
  const edges = await page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML =
      '<input id="i1" class="sk-input" aria-label="a" aria-invalid="true" data-appearance="brutalist">' +
      '<input id="i2" class="sk-input" aria-label="b" aria-invalid="true">' +
      '<input id="i3" class="sk-input" aria-label="c" disabled data-appearance="brutalist">';
    document.body.append(host);
    const cs = (id: string) => getComputedStyle(document.getElementById(id)!);
    return { brutalist: cs("i1").borderTopColor, plain: cs("i2").borderTopColor, disabled: cs("i3").boxShadow };
  });
  expect(edges.brutalist).toBe(edges.plain);
  expect(edges.disabled).toBe("none");
});
