import type { ComponentContract, ContractTemplate, OptionsOf } from "./contract.js";

/*
 * VIDEO PLAYER, a skin and a keyboard over a real `<video>`.
 *
 * THE ELEMENT KEEPS ITS JOB. Playback, `currentTime`, `buffered`, `volume`, `muted`, `playbackRate`, text tracks and the
 * fullscreen request are the platform's, and nothing here reimplements them: the controller (`video-player-controller.ts`)
 * reads the element and calls it, and the chrome is a view of what it says. That is why the media is a slot the author
 * fills (`<video src poster><track></video>`) and not an option: the sources, the poster and the tracks are the
 * author's, and the contract has no way to be wrong about a codec.
 *
 * THE CHROME IS THE SYSTEM'S. Every control is an icon-only `sk-button` (ghost, sm) drawing a stable icon role, the wait
 * is a Loader, and the two sliders are the bar CompareSlider and Resizable already share (`splitter.ts`: the same keys,
 * the same pointer arithmetic), so a player does not introduce a seventh way to drag a thumb. Slider (zag) was weighed
 * and rejected: it has one fill, and a seek bar needs two (what is played, what is buffered) on one track.
 *
 * ONE KEYBOARD, SCOPED. The shortcuts are YouTube's where YouTube's page documents them (k, j/l, m, f, c, 0-9, < >, , .)
 * and run only while focus is inside the player, never on the document: a player that took `k` or Space from the whole
 * page would fight everything around it. A key that belongs to the focused control (Space on a button, arrows on a
 * slider) is left to that control.
 *
 * CONTROLS HIDE THEMSELVES, by our own rule, because no primary source gives one (the W3C player page is silent): never
 * while paused or ended, never while focus is on a control, and they return on any pointer move, touch or key.
 *
 * NAMES THAT CHANGE ARE THE CONTROLLER'S. A play button is "Play", then "Pause", then "Replay"; the markup carries the
 * three words and the controller picks the one that is true. A state is never announced with `aria-pressed` on a button
 * that changes its own name: that says it twice.
 *
 * CAPTIONS ARE DRAWN HERE. The browser paints a cue at the bottom edge of the video, which is exactly where the bar is, and
 * gives the author no say over its look. So every caption track is put in `hidden` mode (its cues still load and fire) and
 * the controller writes the active cue's words into a part of our own, which sits above the bar while it shows and drops
 * to the edge when the bar leaves.
 *
 * NOT HERE, ON PURPOSE: a settings menu (speed is a button that steps through the rates; Menu is a zag machine with a
 * portal and does not belong baked into a shell), a tooltip per control (every control has an accessible name and
 * `aria-keyshortcuts`), double-tap-to-seek zones and a thumbnail preview on the seek bar (both need a media-specific
 * asset or a measured gesture that this contract does not own yet).
 */

export const videoPlayerParts = {
  root: "sk-video-player",
  /** Holds the media. A press on it plays and pauses. */
  stage: "sk-video-player__stage",
  /** The `<video>` the `src` convenience renders. Authored media is the other way in and carries no class. */
  media: "sk-video-player__media",
  /** The centred play button shown before the first play and when the media has ended. */
  big: "sk-video-player__big",
  /** The caption text, drawn by the player above the bar instead of by the browser at the bottom edge. `aria-hidden`. */
  captions: "sk-video-player__captions",
  /** The buffering indicator. A decorative Loader; the stage's `data-waiting` is the state. */
  loader: "sk-video-player__loader",
  /** The bar along the bottom: seek bar above, buttons below. Fades out with the idle controls. */
  controls: "sk-video-player__controls",
  /** The seek bar: a `slider` with a played fill, a buffered fill, a thumb and a time under the pointer. */
  seek: "sk-video-player__seek",
  track: "sk-video-player__track",
  buffered: "sk-video-player__buffered",
  played: "sk-video-player__played",
  thumb: "sk-video-player__thumb",
  /** The time under the pointer while hovering or dragging the seek bar. Visual only, `aria-hidden`. */
  tip: "sk-video-player__tip",
  /** The row of buttons under the seek bar. */
  bar: "sk-video-player__bar",
  /** Every icon-only button. Which one is `data-video-action`. */
  control: "sk-video-player__control",
  /** The mute button and its volume slider, which opens beside it. */
  volume: "sk-video-player__volume",
  volumeSlider: "sk-video-player__volume-slider",
  volumeFill: "sk-video-player__volume-fill",
  /** "1:05 / 3:00", a button: a press swaps the elapsed time for what remains. The seek bar says the time in words. */
  time: "sk-video-player__time",
  current: "sk-video-player__current",
  duration: "sk-video-player__duration",
  /** Pushes the buttons that follow to the end of the bar. */
  spacer: "sk-video-player__spacer",
  /** The speed button's text, "1×". */
  speed: "sk-video-player__speed",
} as const;

export type VideoPlayerPart = keyof typeof videoPlayerParts;
export type VideoPlayerPartClass = (typeof videoPlayerParts)[VideoPlayerPart];

export const videoPlayerAttrs = {
  /** The Vanilla enhancer's attachment point. */
  root: "data-sk-video-player",
  /** Which action a control performs. */
  action: "data-video-action",
  /** Configuration read by the controller off the root. */
  autoHide: "data-auto-hide",
  skip: "data-skip",
  speeds: "data-speeds",
  timeLabel: "data-time-label",
  /** The words a control takes in its other states; the first state's word is its `aria-label`. */
  labelPause: "data-label-pause",
  labelReplay: "data-label-replay",
  labelUnmute: "data-label-unmute",
  labelExitFullscreen: "data-label-exit-fullscreen",
  labelElapsed: "data-label-elapsed",
  /** Written by the controller on the root. */
  started: "data-started",
  playing: "data-playing",
  ended: "data-ended",
  waiting: "data-waiting",
  muted: "data-muted",
  fullscreen: "data-fullscreen",
  /** The clock shows what remains instead of what has played. */
  remaining: "data-remaining",
  /**
   * On media the contract renders: it starts at `preload="none"` and the controller upgrades it to `metadata` the first time the
   * player is near the viewport. Media the author wrote has no such mark and keeps its own preload.
   */
  deferLoad: "data-defer-load",
  /** The controls are hidden because nothing has asked for them in a while. */
  idle: "data-idle",
  scrubbing: "data-scrubbing",
} as const;

export const videoPlayerActions = [
  "play",
  "mute",
  "speed",
  "captions",
  "fullscreen",
  "time",
] as const;
export type VideoPlayerAction = (typeof videoPlayerActions)[number];

/* ---------------------------------------------------------------------------------------------- *
 * Numbers that are ours (no primary source gives them)
 * ---------------------------------------------------------------------------------------------- */

/** How long nothing may ask for the controls before they leave, while playing. */
export const VIDEO_PLAYER_IDLE_MS = 3000;
/** Seconds moved by j / l and the skip buttons when the root does not say otherwise. */
export const VIDEO_PLAYER_SKIP = 10;
/** Seconds moved by an arrow key on the player (YouTube's page: 5). */
export const VIDEO_PLAYER_ARROW_SKIP = 5;
/** Volume moved by an arrow key, in percent (YouTube's page: 5). */
export const VIDEO_PLAYER_VOLUME_STEP = 5;
/** The rates the speed button steps through. */
export const VIDEO_PLAYER_SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
/** One frame at 30 fps: what a frame step moves by until the real rate is measured. The element exposes no frame rate. */
export const VIDEO_PLAYER_FRAME_SECONDS = 1 / 30;

/* ---------------------------------------------------------------------------------------------- *
 * Pure helpers (both bindings share them through the controller)
 * ---------------------------------------------------------------------------------------------- */

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** What remains, drawn with a minus: `-1:05`. Zero at the end, and zero while the length is unknown. */
export function formatVideoRemaining(time: number, duration: number): string {
  const left = Math.max(videoFiniteTime(duration) - videoFiniteTime(time), 0);
  return `-${formatVideoTime(left)}`;
}

/** Fills `{current}` and `{duration}` in the seek bar's words. */
export function formatVideoTimeLabel(template: string, current: string, duration: string): string {
  return template.replaceAll("{current}", current).replaceAll("{duration}", duration);
}

/**
 * The words of one caption cue, with WebVTT's inline markup (`<b>`, `<i>`, `<c.name>`, `<00:01.000>` timestamps and the
 * like) taken out and its entities read. The player draws captions as text, so a tag left in would show as a tag.
 */
export function videoCueText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** A time the element reports, made safe: `NaN` (no metadata yet) and `Infinity` (a live stream) are not times. */
export function videoFiniteTime(seconds: number): number {
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}

/** `1:05`, or `1:02:03` past an hour. The visual clock; the words are `videoTimeText`. */
export function formatVideoTime(seconds: number): string {
  const total = Math.floor(videoFiniteTime(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

/**
 * The time in words, for `aria-valuetext`: "1 minute 5 seconds". A bare number of seconds read aloud is useless, and the
 * unit names come from `Intl`, so they follow the page's language without a dictionary here.
 */
export function videoTimeText(seconds: number, locale?: string): string {
  const total = Math.floor(videoFiniteTime(seconds));
  const parts: Array<[number, "hour" | "minute" | "second"]> = [
    [Math.floor(total / 3600), "hour"],
    [Math.floor((total % 3600) / 60), "minute"],
    [total % 60, "second"],
  ];
  const format = (value: number, unit: "hour" | "minute" | "second") => {
    try {
      return new Intl.NumberFormat(locale || undefined, { style: "unit", unit, unitDisplay: "long" }).format(value);
    } catch {
      /* A page whose `lang` is not a valid tag still gets its time, in the runtime's own language. */
      return new Intl.NumberFormat(undefined, { style: "unit", unit, unitDisplay: "long" }).format(value);
    }
  };
  /* Zero units are left out, except a whole time of zero, which is "0 seconds" and not nothing. */
  return parts
    .filter(([value, unit]) => value > 0 || (total === 0 && unit === "second"))
    .map(([value, unit]) => format(value, unit))
    .join(" ");
}

/** How much of the media a time is, 0 to 1. A media with no duration yet is at the start. */
export function videoFraction(time: number, duration: number): number {
  const total = videoFiniteTime(duration);
  return total > 0 ? clamp(videoFiniteTime(time) / total, 0, 1) : 0;
}

/**
 * Where the buffered data ends, from the time the reader is at: the end of the range that holds `time`, and `time`
 * itself when none does. Ranges are `[start, end]` pairs in seconds, read off `video.buffered` by the controller.
 */
export function videoBufferedEnd(ranges: ReadonlyArray<readonly [number, number]>, time: number): number {
  for (const [start, end] of ranges) {
    if (time >= start && time <= end) return end;
  }
  return time;
}

/**
 * The pointer as a time: its distance from the bar's start edge as a share of the bar. In a right-to-left page the start
 * edge is the right one, so the distance is measured from there.
 */
export function videoTimeFromPointer(params: {
  readonly pointer: number;
  readonly start: number;
  readonly end: number;
  readonly duration: number;
  readonly rtl?: boolean;
}): number {
  const { pointer, start, end, duration, rtl } = params;
  const extent = end - start;
  if (!(extent > 0)) return 0;
  const travelled = rtl ? end - pointer : pointer - start;
  return clamp(travelled / extent, 0, 1) * videoFiniteTime(duration);
}

/** The pointer along a volume slider, 0 to 1, by the same arithmetic. */
export function videoFractionFromPointer(params: { pointer: number; start: number; end: number; rtl?: boolean }): number {
  return videoTimeFromPointer({ ...params, duration: 1 });
}

/**
 * One frame's length, MEASURED: the middle of the gaps between the media times of frames the browser actually presented
 * (`requestVideoFrameCallback`). A median, not a mean, because a dropped or repeated frame doubles one gap and would drag a
 * mean off a rate it never had. Too few samples, or none that make sense, fall back to 30 fps.
 */
export function videoFrameSeconds(gaps: readonly number[]): number {
  const usable = gaps.filter((gap) => Number.isFinite(gap) && gap >= 1 / 240 && gap <= 1 / 10).sort((a, b) => a - b);
  if (usable.length < 5) return VIDEO_PLAYER_FRAME_SECONDS;
  return usable[Math.floor(usable.length / 2)]!;
}

/** A time moved by `delta` seconds and held inside the media. `+Infinity` and `-Infinity` saturate against the ends. */
export function videoSeekBy(time: number, delta: number, duration: number): number {
  return clamp(videoFiniteTime(time) + delta, 0, videoFiniteTime(duration));
}

/** A volume (0 to 1) moved by `delta` percent and held inside the range. */
export function videoVolumeBy(volume: number, deltaPercent: number): number {
  return Math.round(clamp(volume * 100 + deltaPercent, 0, 100)) / 100;
}

/** Parses the speeds an author wrote on the root ("0.5 1 1.5 2"). Anything unusable falls back to the defaults. */
export function parseVideoSpeeds(value: string | null | undefined): number[] {
  const parsed = (value ?? "")
    .split(/[\s,]+/)
    .map(Number)
    .filter((rate) => Number.isFinite(rate) && rate > 0 && rate <= 16);
  const unique = [...new Set(parsed)].sort((a, b) => a - b);
  return unique.length > 0 ? unique : [...VIDEO_PLAYER_SPEEDS];
}

/**
 * The next rate when stepping through `speeds`. From a rate not in the list, the nearest one in the direction asked.
 * `wrap` is the speed BUTTON (the last goes back to the first); `<` and `>` do not wrap.
 */
export function videoNextSpeed(speeds: readonly number[], current: number, direction: 1 | -1, wrap: boolean): number {
  const above = speeds.filter((rate) => rate > current);
  const below = speeds.filter((rate) => rate < current);
  if (direction === 1) return above[0] ?? (wrap ? speeds[0]! : current);
  return below[below.length - 1] ?? (wrap ? speeds[speeds.length - 1]! : current);
}

/** `1×`, `1.25×`, `0.5×`. */
export function formatVideoSpeed(rate: number): string {
  return `${Number(rate.toFixed(2))}×`;
}

/**
 * Whether the controls should be on screen. Ours, not YouTube's: they stay while the media is not playing, while the
 * reader's focus is on one of them, while the pointer is over them, and while the seek bar is being dragged.
 */
export function videoControlsHidden(state: {
  readonly autoHide: boolean;
  readonly playing: boolean;
  readonly focusWithin: boolean;
  readonly pointerOver: boolean;
  readonly scrubbing: boolean;
  readonly idleFor: number;
  readonly idleAfter?: number;
}): boolean {
  if (!state.autoHide || !state.playing || state.focusWithin || state.pointerOver || state.scrubbing) return false;
  return state.idleFor >= (state.idleAfter ?? VIDEO_PLAYER_IDLE_MS);
}

/* ---------------------------------------------------------------------------------------------- *
 * The keyboard
 * ---------------------------------------------------------------------------------------------- */

/** Where a key landed, because the same key means different things on a slider, on a button and on the stage. */
export type VideoKeyTarget = "seek" | "volume" | "button" | "stage";

export type VideoKeyAction =
  | { readonly kind: "none" }
  | { readonly kind: "toggle" }
  | { readonly kind: "seek-by"; readonly seconds: number }
  | { readonly kind: "seek-to"; readonly fraction: number }
  | { readonly kind: "seek-end" }
  | { readonly kind: "volume-by"; readonly percent: number }
  | { readonly kind: "volume-to"; readonly fraction: number }
  | { readonly kind: "mute" }
  | { readonly kind: "fullscreen" }
  | { readonly kind: "captions" }
  | { readonly kind: "speed"; readonly direction: 1 | -1 }
  | { readonly kind: "frame"; readonly direction: 1 | -1 };

const NONE: VideoKeyAction = { kind: "none" };

/**
 * What a key means to the player. Pure: the controller turns the verdict into calls on the element.
 *
 * Space and Enter on a button are the button's (a second handler would toggle twice); arrows on a slider are the slider's
 * own value (the seek bar moves time, the volume bar moves volume). Everywhere else the arrows are the player's, as
 * YouTube's page documents. Any modifier but Shift hands the key back to the browser (Ctrl+F, Cmd+K are not ours).
 */
export function videoKeyAction(input: {
  readonly key: string;
  readonly target: VideoKeyTarget;
  /** Kept for callers that still pass it; no key depends on it any more. */
  readonly paused?: boolean;
  readonly skip?: number;
  readonly shift?: boolean;
  readonly modified?: boolean;
  readonly rtl?: boolean;
}): VideoKeyAction {
  const { key, target, shift, modified, rtl } = input;
  const skip = input.skip ?? VIDEO_PLAYER_SKIP;
  if (modified) return NONE;
  const sign = rtl ? -1 : 1;

  if (target === "volume") {
    /* The slider's own value: left/right follow the page's direction, up/down never flip. */
    if (key === "ArrowLeft") return { kind: "volume-by", percent: -VIDEO_PLAYER_VOLUME_STEP * sign };
    if (key === "ArrowRight") return { kind: "volume-by", percent: VIDEO_PLAYER_VOLUME_STEP * sign };
    if (key === "Home") return { kind: "volume-to", fraction: 0 };
    if (key === "End") return { kind: "volume-to", fraction: 1 };
  }

  switch (key) {
    case " ":
      return target === "button" ? NONE : { kind: "toggle" };
    case "k":
    case "K":
      return { kind: "toggle" };
    case "j":
    case "J":
      return { kind: "seek-by", seconds: -skip };
    case "l":
    case "L":
      return { kind: "seek-by", seconds: skip };
    case "ArrowLeft":
      return { kind: "seek-by", seconds: -VIDEO_PLAYER_ARROW_SKIP * sign };
    case "ArrowRight":
      return { kind: "seek-by", seconds: VIDEO_PLAYER_ARROW_SKIP * sign };
    case "ArrowUp":
      return { kind: "volume-by", percent: VIDEO_PLAYER_VOLUME_STEP };
    case "ArrowDown":
      return { kind: "volume-by", percent: -VIDEO_PLAYER_VOLUME_STEP };
    case "Home":
      return target === "stage" || target === "seek" ? { kind: "seek-to", fraction: 0 } : NONE;
    case "End":
      return target === "stage" || target === "seek" ? { kind: "seek-end" } : NONE;
    case "m":
    case "M":
      return { kind: "mute" };
    case "f":
    case "F":
      return { kind: "fullscreen" };
    case "c":
    case "C":
      return { kind: "captions" };
    case ">":
      return { kind: "speed", direction: 1 };
    case "<":
      return { kind: "speed", direction: -1 };
    /* A step while playing pauses first (the controller does), so the keys are never dead: nobody means to step a running video. */
    case ".":
      return { kind: "frame", direction: 1 };
    case ",":
      return { kind: "frame", direction: -1 };
    default:
      if (!shift && key.length === 1 && key >= "0" && key <= "9") return { kind: "seek-to", fraction: Number(key) / 10 };
      return NONE;
  }
}

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

/** One icon, a stable role. The faces of a toggle are stacked in one button and the sheet lights the true one. */
const face = (icon: string, name: string): ContractTemplate => ({
  element: "span",
  attrs: { "data-face": name, "data-sk-icon": icon, "data-sk-icon-size": "md" },
});

const button = (
  action: VideoPlayerAction,
  options: string[],
  faces: ContractTemplate[],
  extra: { hidden?: boolean; keys?: string } = {},
): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive", "sk-icon-toggle"],
  options,
  attrs: {
    type: "button",
    [videoPlayerAttrs.action]: action,
    "data-icon-only": "",
    "data-variant": "ghost",
    "data-size": "sm",
    ...(extra.keys ? { "aria-keyshortcuts": extra.keys } : {}),
    ...(extra.hidden ? { hidden: "" } : {}),
  },
  children: faces,
});

const slider = (part: "seek" | "volumeSlider", options: string[], children: ContractTemplate[]): ContractTemplate => ({
  element: "div",
  part,
  options,
  attrs: {
    role: "slider",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": "0",
    /* The volume is a popup of a vertical slider; the seek bar is the default, horizontal one. */
    ...(part === "volumeSlider" ? { "aria-orientation": "vertical" } : {}),
  },
  children,
});

/**
 * The options as plain data, apart from the contract that uses them, so a binding that only needs a default (React reads
 * `label`, `skip`, the words) imports THIS and the bundler can drop the contract's whole template, which is the heavy part.
 */
export const videoPlayerOptions = {
  /** The convenience source: renders the `<video>`. Authored children (several sources, many tracks) are the other way in. */
  src: { type: "string", attr: "src" },
  /** The picture shown before the first play. */
  poster: { type: "string", attr: "poster" },
  /** One caption track (WebVTT), for the common case. A second language is authored markup. */
  captionsSrc: { type: "string", attr: "src" },
  /** The track's language, a BCP 47 tag (`en`, `es`). Also how the captions button picks which track to show. */
  captionsLang: { type: "string", attr: "srclang" },
  /** The track's name in the browser's own track list. */
  captionsTitle: { type: "string", attr: "label" },
  /** The player's accessible name: the region a reader lands in. Name it after the video. */
  label: { type: "string", default: "Video player", attr: "aria-label" },
  playLabel: { type: "string", default: "Play", attr: "aria-label" },
  pauseLabel: { type: "string", default: "Pause", attr: videoPlayerAttrs.labelPause },
  replayLabel: { type: "string", default: "Replay", attr: videoPlayerAttrs.labelReplay },
  muteLabel: { type: "string", default: "Mute", attr: "aria-label" },
  unmuteLabel: { type: "string", default: "Unmute", attr: videoPlayerAttrs.labelUnmute },
  seekLabel: { type: "string", default: "Seek", attr: "aria-label" },
  volumeLabel: { type: "string", default: "Volume", attr: "aria-label" },
  speedLabel: { type: "string", default: "Playback speed", attr: "aria-label" },
  captionsLabel: { type: "string", default: "Captions", attr: "aria-label" },
  fullscreenLabel: { type: "string", default: "Full screen", attr: "aria-label" },
  /** The clock's name while it shows the elapsed time: what a press will do. */
  remainingLabel: { type: "string", default: "Show remaining time", attr: "aria-label" },
  /** The clock's name while it shows what remains. */
  elapsedLabel: { type: "string", default: "Show elapsed time", attr: videoPlayerAttrs.labelElapsed },
  exitFullscreenLabel: { type: "string", default: "Exit full screen", attr: videoPlayerAttrs.labelExitFullscreen },
  /** What the seek bar says in words. `{current}` and `{duration}` are filled in: "1 minute 5 seconds of 3 minutes". */
  timeLabel: {
    type: "string",
    default: "{current} of {duration}",
    attr: videoPlayerAttrs.timeLabel,
    machineInput: true,
  },
  /** Controls leave after a few idle seconds of playback. Off: they stay. They never leave while paused. */
  autoHide: {
    type: "boolean",
    default: true,
    attr: videoPlayerAttrs.autoHide,
    falseValue: "false",
    machineInput: true,
  },
  /** Seconds a `j` or `l` moves. */
  skip: {
    type: "number",
    default: VIDEO_PLAYER_SKIP,
    min: 1,
    max: 120,
    attr: videoPlayerAttrs.skip,
    machineInput: true,
  },
  /** The rates the speed button steps through, space separated. */
  speeds: {
    type: "string",
    default: /* @__PURE__ */ VIDEO_PLAYER_SPEEDS.join(" "),
    attr: videoPlayerAttrs.speeds,
    machineInput: true,
  },
} as const;

/** Marked pure so a bundle that never reads the contract (the controller, a binding's defaults) does not carry it. */
export const videoPlayerContract = /*#__PURE__*/ (() => ({
  id: "video-player",
  category: "content",
  css: "@skryensya/core/components/video-player.css",
  parts: videoPlayerParts,
  /* The state the sheet draws from lives on the root, written by the controller; React renders none of it. */
  hooks: [
    "--sk-video-player-aspect",
    "--sk-video-player-bg",
    "--sk-video-player-buffered-color",
    "--sk-video-player-captions-bg",
    "--sk-video-player-captions-offset",
    "--sk-video-player-captions-underline-offset",
    "--sk-video-player-captions-underline-size",
    "--sk-video-player-captions-underline-thickness",
    "--sk-video-player-fade-duration",
    "--sk-video-player-fg",
    "--sk-video-player-gutter",
    "--sk-video-player-played-color",
    "--sk-video-player-radius",
    "--sk-video-player-scrim",
    "--sk-video-player-thumb-size",
    "--sk-video-player-track-color",
    "--sk-video-player-track-size",
    "--sk-video-player-volume-pad",
    "--sk-video-player-volume-width",
  ],
  systemOwned: ["media", "track", "volumeSlider", "spacer", "loader", "captions", "buffered", "played", "thumb", "tip", "volumeFill", "current", "duration", "speed"],
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],

  options: videoPlayerOptions,

  signatures: {
    VideoPlayer: {
      intent: ["video-player", "play-a-video", "media-player", "custom-video-controls", "embed-video"],
      host: { element: "div" },
      mount: videoPlayerAttrs.root,
      options: [
        "src",
        "poster",
        "captionsSrc",
        "captionsLang",
        "captionsTitle",
        "label",
        "playLabel",
        "pauseLabel",
        "replayLabel",
        "muteLabel",
        "unmuteLabel",
        "seekLabel",
        "volumeLabel",
        "speedLabel",
        "captionsLabel",
        "fullscreenLabel",
        "exitFullscreenLabel",
        "remainingLabel",
        "elapsedLabel",
        "timeLabel",
        "autoHide",
        "skip",
        "speeds",
      ],
      forward: ["id", "aria-*"],
      exactlyOneOf: [["src", "children"]],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "loader", sheets: ["@skryensya/core/components/loader.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        /** Authored media: a `<video>` with several sources or tracks. The controller turns its native controls off. */
        children: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        /* Focusable by script and by a press, never by Tab: the keys need somewhere to land after a click on the picture. */
        attrs: { role: "group", tabindex: "-1" },
        children: [
          {
            element: "div",
            part: "stage",
            children: [
              {
                element: "video",
                part: "media",
                options: ["src", "poster"],
                attrs: { preload: "none", [videoPlayerAttrs.deferLoad]: "", playsinline: "" },
                whenGiven: "src",
                children: [
                  {
                    element: "track",
                    options: ["captionsSrc", "captionsLang", "captionsTitle"],
                    attrs: { kind: "captions" },
                    whenGiven: "captionsSrc",
                  },
                ],
              },
              { slot: "children" },
            ],
          },
          { element: "div", part: "captions", attrs: { "aria-hidden": "true" } },
          {
            element: "span",
            part: "loader",
            also: ["sk-loader"],
            attrs: { "aria-hidden": "true", "data-size": "lg" },
          },
          {
            element: "button",
            part: "big",
            also: ["sk-button", "sk-interactive", "sk-icon-toggle"],
            options: ["playLabel", "replayLabel"],
            attrs: {
              type: "button",
              [videoPlayerAttrs.action]: "play",
              "data-icon-only": "",
              "data-variant": "solid",
              "data-size": "lg",
            },
            children: [face("play", "play"), face("replay", "replay")],
          },
          {
            element: "div",
            part: "controls",
            children: [
              slider("seek", ["seekLabel", "timeLabel"], [
                {
                  element: "div",
                  part: "track",
                  children: [
                    { element: "div", part: "buffered" },
                    { element: "div", part: "played" },
                  ],
                },
                { element: "div", part: "thumb" },
                { element: "span", part: "tip", attrs: { "aria-hidden": "true" } },
              ]),
              {
                element: "div",
                part: "bar",
                children: [
                  button("play", ["playLabel", "pauseLabel", "replayLabel"], [face("play", "play"), face("pause", "pause"), face("replay", "replay")], {
                    keys: "k",
                  }),
                  {
                    element: "div",
                    part: "volume",
                    children: [
                      button("mute", ["muteLabel", "unmuteLabel"], [face("volume", "volume"), face("volume-muted", "muted")], { keys: "m" }),
                      slider("volumeSlider", ["volumeLabel"], [{ element: "div", part: "volumeFill" }]),
                    ],
                  },
                  {
                    element: "button",
                    part: "time",
                    also: ["sk-button", "sk-interactive"],
                    options: ["remainingLabel", "elapsedLabel"],
                    attrs: { type: "button", [videoPlayerAttrs.action]: "time", "data-variant": "ghost", "data-size": "sm" },
                    children: [
                      { element: "span", part: "current" },
                      { element: "span", part: "duration" },
                    ],
                  },
                  { element: "span", part: "spacer", attrs: { "aria-hidden": "true" } },
                  {
                    element: "button",
                    part: "control",
                    also: ["sk-button", "sk-interactive"],
                    options: ["speedLabel"],
                    attrs: {
                      type: "button",
                      [videoPlayerAttrs.action]: "speed",
                      "data-variant": "ghost",
                      "data-size": "sm",
                      "aria-keyshortcuts": "Shift+, Shift+.",
                    },
                    children: [{ element: "span", part: "speed" }],
                  },
                  button("captions", ["captionsLabel"], [face("captions", "captions")], { hidden: true, keys: "c" }),
                  button("fullscreen", ["fullscreenLabel", "exitFullscreenLabel"], [face("fullscreen", "enter"), face("fullscreen-exit", "exit")], {
                    keys: "f",
                  }),
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/video-player", name: "VideoPlayer" },
    },
  },
}) as const satisfies ComponentContract)();

/** Derived, never restated. */
export type VideoPlayerOptions = OptionsOf<typeof videoPlayerContract>;
