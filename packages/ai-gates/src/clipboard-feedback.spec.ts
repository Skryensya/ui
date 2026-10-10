import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

for (const binding of ["react", "vanilla"]) {
  test(`Clipboard feedback is stable from its first visible frame (${binding})`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await waitForStage(page);
    await page.evaluate(() => document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(el => el.close()));
    const specimen = page.locator(`[data-case="clipboard/field"] [data-binding="${binding}"]`);
    const button = specimen.locator('.sk-copy-button');
    await button.scrollIntoViewIfNeeded();
    await button.evaluate(el => {
      el.addEventListener('pointerup', () => {
        const frames: { x: number; y: number; scale: string }[] = [];
        const feedback = el.querySelector<HTMLElement>('.sk-copy-button__feedback')!;
        const sample = () => {
          if (feedback.getAttribute('data-state') === 'open' && Number(getComputedStyle(feedback).opacity) > 0) {
            const rect = feedback.getBoundingClientRect();
            frames.push({ x: rect.x, y: rect.y, scale: getComputedStyle(el).scale });
          }
          if (frames.length < 25) requestAnimationFrame(sample);
          else el.setAttribute('data-frame-samples', JSON.stringify(frames));
        };
        requestAnimationFrame(sample);
      }, { once: true });
    });
    await button.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(specimen.locator('.sk-copy-button__feedback')).toHaveAttribute('data-state', 'open');
    await expect(button).toHaveAttribute('data-frame-samples', /./);
    const frames = JSON.parse((await button.getAttribute('data-frame-samples'))!) as {x:number;y:number;scale:string}[];
    const settled = frames.at(-1)!;
    for (const frame of frames) {
      expect(Math.abs(frame.x - settled.x), JSON.stringify(frames)).toBeLessThan(1);
      expect(Math.abs(frame.y - settled.y), JSON.stringify(frames)).toBeLessThan(1);
    }
    const bubble = await specimen.locator('.sk-copy-button__feedback').boundingBox();
    const input = await specimen.locator('input').boundingBox();
    expect(bubble).not.toBeNull();
    expect(input).not.toBeNull();
    const overlaps = bubble!.x < input!.x + input!.width && bubble!.x + bubble!.width > input!.x && bubble!.y < input!.y + input!.height && bubble!.y + bubble!.height > input!.y;
    expect(overlaps).toBe(false);
  });
}

test("copied feedback has room for its text and is not clipped by the button", async ({ page }) => {
  await waitForStage(page);
  await page.evaluate(() => {
    document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(el => el.close());
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:200px;top:160px;z-index:99999';
    host.innerHTML = `<button class="sk-copy-button sk-button sk-interactive sk-icon-toggle sk-anchor" data-icon-only data-size="sm" data-variant="soft" data-copied style="anchor-name:--copy-probe;--sk-anchored-name:--copy-probe"><span data-face="copied">✓</span><span class="sk-copy-button__feedback sk-anchored" data-sk-placement="block-start" data-state="open" style="--sk-anchored-name:--copy-probe;--sk-anchored-box-name:--copy-feedback-probe;pointer-events:auto"><span>Copiado</span><span class="sk-anchored-arrow" aria-hidden="true"></span></span></button>`;
    document.body.append(host);
  });
  const feedback = page.locator('.sk-copy-button__feedback[data-state="open"]').last();
  await page.waitForTimeout(250);
  await page.screenshot({ path: '/tmp/clipboard-feedback.png' });
  const shape = await feedback.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const text = el.querySelector('span')!.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return {width:rect.width,height:rect.height,textWidth:text.width,textHeight:text.height,painted:!!hit && el.contains(hit), css:getComputedStyle(el).cssText};
  });
  expect(shape.width).toBeGreaterThan(shape.textWidth);
  expect(shape.height).toBeGreaterThan(shape.textHeight);
  expect(shape.painted).toBe(true);
});
