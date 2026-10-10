import { formatVideoTime, videoFraction } from "./video-player.js";

/*
 * THE PROGRESS VIEW SHARED BY THE AUDIO AND THE VIDEO PLAYER: how a seek bar, its fills, its thumb, its waveform and the clock
 * are drawn while the media plays, doing the least the browser can be asked to do.
 *
 * WHY IT EXISTS. Measured on a playing player (Chromium, 6 s): the old painter cost ~300 ms of style recalculation per second
 * (three recalcs and a layout every frame), against ~2 ms when idle. The JavaScript was never the cost; what it WROTE was:
 *
 *   - the clock's `textContent`, every frame, even when the text had not changed. Setting `textContent` replaces the text node,
 *     which invalidates style and layout whether or not the characters differ. By itself this was ~85% of the cost.
 *   - two custom properties on the ROOT, every frame. A custom property is inherited, so changing one on the root invalidates
 *     every descendant (about 180 nodes) and the fills' `inline-size: calc(var() * 100%)` forced a layout each time.
 *   - `aria-valuenow` and `aria-valuetext`, up to 60 times a second: cheap for the CPU, noisy for assistive technology.
 *
 * WHAT IT DOES INSTEAD. Every write goes straight to the one element it affects, as an inline style that invalidates that
 * element alone and, for `scale` and `translate`, needs no layout; and it writes only when the value the reader can SEE has
 * changed: the clock and the aria values once per displayed second, a fill once per pixel of the bar. A 20-second clip on a
 * 600px bar moves the fill about 30 times a second instead of 60, and a one-hour episode a few times a minute.
 */

export type ProgressParts = {
  readonly seek: HTMLElement | null;
  readonly played: HTMLElement | null;
  readonly buffered: HTMLElement | null;
  readonly thumb: HTMLElement | null;
  /** The played half of the waveform, clipped; absent without peaks. */
  readonly waveFill: HTMLElement | null;
  readonly tip: HTMLElement | null;
  readonly current: HTMLElement | null;
  readonly duration: HTMLElement | null;
};

export type ProgressEnv = {
  readonly win: (Window & typeof globalThis) | null;
  /** Whether the page reads right to left. Cached by the caller: asking the browser costs a style recalculation. */
  readonly rtl: () => boolean;
  /** The thumb's vertical offset, when its box is anchored from the bottom edge rather than centred on the track (`-50%` is the default). */
  readonly thumbY?: string;
  /** What the clock says for a time, when it is not simply the elapsed time (the video can show what remains). */
  readonly currentText?: (now: number, total: number) => string;
  /** The seek bar's sentence for a time ("1 minute 5 seconds of 3 minutes"). Only called when the displayed second changes. */
  readonly describe: (now: number, total: number) => string;
};

export type ProgressView = {
  /** Draw the bar for `now` of `total` seconds with data buffered up to `bufferedEnd`. Cheap when nothing visible moved. */
  update(now: number, total: number, bufferedEnd: number): void;
  /** Show the time under the pointer at a fraction of the bar (0 to 1); `null` hides it. Coalesced to one write per frame. */
  hover(fraction: number | null, seconds?: number): void;
  /** Forget what was drawn, so the next `update` writes everything (after a label change or when the player comes back into view). */
  invalidate(): void;
  /** Remove every inline style and stop watching. */
  destroy(): void;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export function createProgressView(parts: ProgressParts, env: ProgressEnv): ProgressView {
  const { seek, played, buffered, thumb, waveFill, tip, current, duration } = parts;
  const win = env.win;

  /* The bar's width in pixels, so a fill is written once per pixel it actually moves. Observed, never measured in a frame. */
  let steps = 1000;
  let lastPlayed = -1;
  let lastBuffered = -1;
  let lastSecond = -1;
  let lastTotal = -1;
  const observer =
    seek && win && typeof win.ResizeObserver === "function"
      ? new win.ResizeObserver((entries) => {
          const width = entries[entries.length - 1]?.contentRect.width ?? 0;
          const next = width > 0 ? Math.round(width) : 1000;
          if (next === steps) return;
          steps = next;
          lastPlayed = lastBuffered = -1;
        })
      : null;
  if (seek) observer?.observe(seek);

  const thumbY = env.thumbY ?? "-50%";
  const thumbOffset = (value: number) =>
    env.rtl() ? `calc(${value} * -100cqw + 50%) ${thumbY}` : `calc(${value} * 100cqw - 50%) ${thumbY}`;
  const waveClip = (value: number) => {
    const rest = Number(((1 - value) * 100).toFixed(2));
    return env.rtl() ? `inset(0 0 0 ${rest}%)` : `inset(0 ${rest}% 0 0)`;
  };

  const update = (now: number, total: number, bufferedEnd: number) => {
    const playedStep = Math.round(videoFraction(now, total) * steps);
    if (playedStep !== lastPlayed) {
      lastPlayed = playedStep;
      const value = playedStep / steps;
      if (played) played.style.scale = `${value} 1`;
      if (thumb) thumb.style.translate = thumbOffset(value);
      if (waveFill) waveFill.style.clipPath = waveClip(value);
    }

    const bufferedStep = Math.round(videoFraction(bufferedEnd, total) * steps);
    if (bufferedStep !== lastBuffered) {
      lastBuffered = bufferedStep;
      if (buffered) buffered.style.scale = `${bufferedStep / steps} 1`;
    }

    /* Text and aria change once per displayed second, not once per frame. */
    const second = Math.floor(now);
    const wholeTotal = Math.floor(total);
    if (second === lastSecond && wholeTotal === lastTotal) return;
    if (current && second !== lastSecond) current.textContent = env.currentText ? env.currentText(now, total) : formatVideoTime(now);
    if (duration && wholeTotal !== lastTotal) duration.textContent = formatVideoTime(total);
    lastSecond = second;
    lastTotal = wholeTotal;
    if (seek) {
      seek.setAttribute("aria-valuemax", String(Math.round(total)));
      seek.setAttribute("aria-valuenow", String(Math.round(now)));
      seek.setAttribute("aria-valuetext", env.describe(now, total));
    }
  };

  /* The pointer moves far faster than a frame; only the last position of a frame is drawn. */
  let pending: { fraction: number | null; seconds?: number } | null = null;
  let hoverFrame = 0;
  const flushHover = () => {
    hoverFrame = 0;
    if (!pending || !tip) return;
    const { fraction, seconds } = pending;
    pending = null;
    if (fraction === null) return;
    tip.style.insetInlineStart = `clamp(1.5rem, ${Number((clamp01(fraction) * 100).toFixed(2))}%, calc(100% - 1.5rem))`;
    const text = formatVideoTime(seconds ?? 0);
    if (tip.textContent !== text) tip.textContent = text;
  };

  return {
    update,
    hover(fraction, seconds) {
      pending = { fraction, seconds };
      if (hoverFrame || !win) {
        if (!win) flushHover();
        return;
      }
      hoverFrame = win.requestAnimationFrame(flushHover);
    },
    invalidate() {
      lastPlayed = lastBuffered = lastSecond = lastTotal = -1;
    },
    destroy() {
      observer?.disconnect();
      if (hoverFrame && win) win.cancelAnimationFrame(hoverFrame);
      for (const el of [played, buffered]) el?.style.removeProperty("scale");
      thumb?.style.removeProperty("translate");
      waveFill?.style.removeProperty("clip-path");
      tip?.style.removeProperty("inset-inline-start");
    },
  };
}
