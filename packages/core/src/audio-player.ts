import type { ComponentContract, ContractTemplate, OptionsOf } from "./contract.js";
import {
  VIDEO_PLAYER_SKIP,
  VIDEO_PLAYER_SPEEDS,
  videoKeyAction,
  type VideoKeyAction,
  type VideoKeyTarget,
} from "./video-player.js";

/*
 * AUDIO PLAYER, a skin and a keyboard over a real `<audio>`.
 *
 * THE VIDEO PLAYER'S SIBLING, NOT ITS MODE. The element keeps its job (playback, `currentTime`, `buffered`, `volume`,
 * `playbackRate` are the platform's), the chrome is a view of what it reports, and the keys run only while focus is inside.
 * What is shared is shared as code: the clock, the seek arithmetic, the speed list and the keymap come from
 * `video-player.ts`, so the two cannot disagree about what `j` or `0` means. What is not shared is the shape. A picture
 * needs a stage, a poster, fullscreen and a bar that hides over it; a sound needs a strip that is always there, a title,
 * and somewhere to go next. One contract holding both would carry options that are nonsense for each.
 *
 * THREE THINGS A VIDEO DOES NOT HAVE.
 *   - A TRACK: a title, an artist and a cover. They are options for one sound and fields of an entry for a list; the
 *     controller keeps the visible ones in step with whichever track is loaded.
 *   - A PLAYLIST: the `tracks` collection. The controller owns which one is current, loads it into the one `<audio>`
 *     (`src` is the element's, so a track change is a real source change and not a second element), moves on when one
 *     ends, and offers previous/next only when there is somewhere to go. Pressing previous after a few seconds goes to the
 *     start of this track first, as every player does.
 *   - A WAVEFORM: the seek bar drawn as peaks. The author brings the peaks (numbers 0 to 1, computed when the file was
 *     made); the player does not decode audio in the browser to find them, which would cost a full download and a decoder
 *     to draw a picture. Without peaks the bar is the plain track the video player has.
 *
 * TWO SIGNATURES, ONE CONTROLLER. `AudioPlayer` is the full strip or card; `AudioPlayerMinimal` is the least a sound needs: play,
 * a seek bar and the time, on one row, with at most a name for what is playing, and no cover, list, volume or speed. It exists because a short clip or a voice
 * note should not carry a transport it will never use, and because "hide the rest with CSS" would still ship every control to
 * the accessibility tree and the page. The controller finds its parts by class and skips the ones that are absent, so the
 * same code runs both.
 *
 * NOT HERE, ON PURPOSE: skip-ahead and skip-back buttons (the keys `j` and `l` do that, and a transport that grows a button for
 * every gesture stops reading as one), shuffle and repeat (a playlist's policy is the app's), a queue you can reorder, lyrics, and
 * decoding the file to draw the wave. Each is an app decision a shell should not make for every consumer.
 */

export const audioPlayerParts = {
  root: "sk-audio-player",
  /** The `<audio>` the `src` convenience renders, or the author's own. It has no controls of its own: the chrome is the controls. */
  media: "sk-audio-player__media",
  cover: "sk-audio-player__cover",
  /** The title and the artist, stacked. */
  meta: "sk-audio-player__meta",
  title: "sk-audio-player__title",
  artist: "sk-audio-player__artist",
  /** The row of controls and the seek bar. */
  controls: "sk-audio-player__controls",
  /** The seek bar: a `slider` with a played fill, a buffered fill, optionally a waveform, a thumb and a time under the pointer. */
  seek: "sk-audio-player__seek",
  track: "sk-audio-player__track",
  buffered: "sk-audio-player__buffered",
  played: "sk-audio-player__played",
  /** The peaks, drawn by the controller from the track's `peaks`. Decorative; the slider says the time. */
  wave: "sk-audio-player__wave",
  waveBars: "sk-audio-player__wave-bars",
  /** The same bars again, clipped to what is played. */
  waveFill: "sk-audio-player__wave-fill",
  thumb: "sk-audio-player__thumb",
  tip: "sk-audio-player__tip",
  bar: "sk-audio-player__bar",
  /** Every button. Which one is `data-audio-action`. */
  control: "sk-audio-player__control",
  volume: "sk-audio-player__volume",
  volumeSlider: "sk-audio-player__volume-slider",
  volumeFill: "sk-audio-player__volume-fill",
  time: "sk-audio-player__time",
  current: "sk-audio-player__current",
  duration: "sk-audio-player__duration",
  spacer: "sk-audio-player__spacer",
  speed: "sk-audio-player__speed",
  /** The playlist: List's rows, so square-cornered and divided like every other list in the system. */
  list: "sk-audio-player__list",
  item: "sk-audio-player__item",
  /** The button that loads a track. It is the whole row. */
  itemButton: "sk-audio-player__item-button",
  /** The track's number, drawn by the sheet. Decorative. */
  itemLeading: "sk-audio-player__item-leading",
  /** The title and the artist, stacked. */
  itemText: "sk-audio-player__item-text",
  itemTitle: "sk-audio-player__item-title",
  itemArtist: "sk-audio-player__item-artist",
  itemDuration: "sk-audio-player__item-duration",
} as const;

export type AudioPlayerPart = keyof typeof audioPlayerParts;

export const audioPlayerAttrs = {
  /** The Vanilla enhancer's attachment point. */
  root: "data-sk-audio-player",
  /** Which action a control performs. */
  action: "data-audio-action",
  /** Configuration read by the controller off the root. */
  skip: "data-skip",
  speeds: "data-speeds",
  timeLabel: "data-time-label",
  autoAdvance: "data-auto-advance",
  peaks: "data-peaks",
  /** The words a control takes in its other states; the first state's word is its `aria-label`. */
  labelPause: "data-label-pause",
  labelReplay: "data-label-replay",
  labelUnmute: "data-label-unmute",
  /** What a track (a list entry) carries. */
  trackSrc: "data-src",
  trackCover: "data-cover",
  trackDuration: "data-duration",
  trackPeaks: "data-peaks",
  /** Written by the controller on the root. */
  started: "data-started",
  playing: "data-playing",
  ended: "data-ended",
  waiting: "data-waiting",
  muted: "data-muted",
  scrubbing: "data-scrubbing",
  /** The current track has peaks, so the waveform replaces the plain track. */
  wave: "data-wave",
  /**
   * On media the contract renders: it starts at `preload="none"` and the controller upgrades it to `metadata` the first time the
   * player is near the viewport. Media the author wrote has no such mark and keeps its own preload.
   */
  deferLoad: "data-defer-load",
  /** There is a track before / after the current one. */
  hasPrevious: "data-has-previous",
  hasNext: "data-has-next",
  /** Written on the list entry that is loaded. */
  current: "data-current",
} as const;

export const audioPlayerActions = ["play", "mute", "speed", "previous", "next"] as const;
export type AudioPlayerAction = (typeof audioPlayerActions)[number];

/* ---------------------------------------------------------------------------------------------- *
 * Numbers that are ours (no primary source gives them)
 * ---------------------------------------------------------------------------------------------- */

/** Seconds into a track after which "previous" restarts it instead of leaving it (the convention every player follows). */
export const AUDIO_PLAYER_RESTART_AFTER = 3;
/** How many bars the waveform is drawn with, however many peaks the author gave: a bar a few pixels wide reads as a wave, 1,000 of them as a smear. */
export const AUDIO_PLAYER_WAVE_BARS = 64;
/** Peaks beyond this are ignored: an author's mistake (a whole decoded buffer pasted in), not a longer wave. */
export const AUDIO_PLAYER_MAX_PEAKS = 4096;

/* ---------------------------------------------------------------------------------------------- *
 * Pure helpers
 * ---------------------------------------------------------------------------------------------- */

/**
 * Reads the peaks an author wrote ("0.2 0.8, 0.5"): numbers from 0 to 1, in order. A value outside the range is held
 * inside it; anything that is not a number is dropped, so one stray token does not blank the wave.
 */
export function parseAudioPeaks(value: string | null | undefined): number[] {
  const peaks: number[] = [];
  for (const token of (value ?? "").split(/[\s,;]+/)) {
    if (token === "") continue;
    const peak = Number(token);
    if (!Number.isFinite(peak)) continue;
    peaks.push(Math.min(Math.max(peak, 0), 1));
    if (peaks.length >= AUDIO_PLAYER_MAX_PEAKS) break;
  }
  return peaks;
}

/**
 * The peaks as exactly `count` bars. More peaks than bars: each bar is the loudest of its share, so a spike is never
 * averaged away. Fewer: each peak is repeated across the bars it covers, so a short wave still fills the bar.
 */
export function resampleAudioPeaks(peaks: readonly number[], count: number = AUDIO_PLAYER_WAVE_BARS): number[] {
  if (peaks.length === 0 || count <= 0) return [];
  const bars: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const from = Math.floor((i * peaks.length) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * peaks.length) / count));
    let loudest = 0;
    for (let j = from; j < to && j < peaks.length; j += 1) loudest = Math.max(loudest, peaks[j]!);
    bars.push(loudest);
  }
  return bars;
}

/** What "previous" does: restart this track once it is a few seconds in, or when there is no track before it; otherwise leave it. */
export function audioPreviousAction(
  time: number,
  index: number,
): { readonly kind: "restart" } | { readonly kind: "go"; readonly index: number } {
  if (time > AUDIO_PLAYER_RESTART_AFTER || index <= 0) return { kind: "restart" };
  return { kind: "go", index: index - 1 };
}

/** The track after `index`, or null at the end: the end of a list is the end of the music, not a loop (looping is the app's call). */
export function audioNextIndex(index: number, count: number): number | null {
  return index + 1 < count ? index + 1 : null;
}

/* ---------------------------------------------------------------------------------------------- *
 * The keyboard
 * ---------------------------------------------------------------------------------------------- */

export type AudioKeyAction =
  | Exclude<VideoKeyAction, { readonly kind: "fullscreen" | "captions" | "frame" }>
  | { readonly kind: "previous" }
  | { readonly kind: "next" };

const NONE: AudioKeyAction = { kind: "none" };

/**
 * What a key means to the audio player: the video player's keymap without the keys that need a picture (`f`, `c`, `,` and
 * `.` by frame), plus Shift+P and Shift+N for the track before and after (YouTube's playlist keys). A modified key is
 * the browser's.
 */
export function audioKeyAction(input: {
  readonly key: string;
  readonly target: VideoKeyTarget;
  readonly paused: boolean;
  readonly skip?: number;
  readonly shift?: boolean;
  readonly modified?: boolean;
  readonly rtl?: boolean;
}): AudioKeyAction {
  if (input.modified) return NONE;
  if (input.shift && input.key === "P") return { kind: "previous" };
  if (input.shift && input.key === "N") return { kind: "next" };
  const action = videoKeyAction({ ...input, skip: input.skip ?? VIDEO_PLAYER_SKIP });
  return action.kind === "fullscreen" || action.kind === "captions" || action.kind === "frame" ? NONE : action;
}

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

const face = (icon: string, name: string): ContractTemplate => ({
  element: "span",
  attrs: { "data-face": name, "data-sk-icon": icon, "data-sk-icon-size": "md" },
});

const iconButton = (
  action: AudioPlayerAction,
  options: string[],
  faces: ContractTemplate[],
  extra: { keys?: string; hidden?: boolean; size?: string; variant?: string } = {},
): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive", "sk-icon-toggle"],
  options,
  attrs: {
    type: "button",
    [audioPlayerAttrs.action]: action,
    "data-icon-only": "",
    "data-variant": extra.variant ?? "ghost",
    "data-size": extra.size ?? "sm",
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

/** The seek bar: a plain track, with the waveform and the thumb. The same markup in both signatures. */
const seekBar = (options: string[], wave: boolean): ContractTemplate =>
  slider("seek", options, [
    {
      element: "div",
      part: "track",
      children: [
        { element: "div", part: "buffered" },
        { element: "div", part: "played" },
      ],
    },
    ...(wave
      ? [
          {
            element: "div",
            part: "wave",
            attrs: { "aria-hidden": "true" },
            /* `peaks` is not claimed here: it lands on the root, where the controller reads it. */
            whenGiven: ["peaks", "tracks"],
            children: [
              { element: "div", part: "waveBars" },
              { element: "div", part: "waveFill" },
            ],
          } satisfies ContractTemplate,
        ]
      : []),
    { element: "div", part: "thumb" },
    { element: "span", part: "tip", attrs: { "aria-hidden": "true" } },
  ]);

const playButton = (extra: { size?: string; variant?: string } = {}): ContractTemplate =>
  iconButton("play", ["playLabel", "pauseLabel", "replayLabel"], [face("play", "play"), face("pause", "pause"), face("replay", "replay")], {
    keys: "k",
    ...extra,
  });

const clock: ContractTemplate = {
  element: "span",
  part: "time",
  attrs: { "aria-hidden": "true" },
  children: [
    { element: "span", part: "current" },
    { element: "span", part: "duration" },
  ],
};

/** The words every signature shares. */
const sharedOptions = [
  "src",
  "label",
  "playLabel",
  "pauseLabel",
  "replayLabel",
  "seekLabel",
  "timeLabel",
] as const;

/**
 * The options as plain data, apart from the contract that uses them, so a binding that only needs a default (React reads
 * `label`, `skip`, the words) imports THIS and the bundler can drop the contract's whole template, which is the heavy part.
 */
export const audioPlayerOptions = {
  /** The sound: an audio file you host or link. The convenience source; a list of tracks or your own `<audio>` is the other way in. */
  src: { type: "string", attr: "src" },
  /** The track's name. Shown above the controls. With a list, each track brings its own. */
  title: { type: "string" },
  /** Who made it. */
  artist: { type: "string" },
  /** The cover image. Decorative: the title beside it is the name. */
  cover: { type: "string", attr: "src" },
  /** The waveform: numbers from 0 to 1, space or comma separated, computed when the file was made. Absent, the seek bar is a plain track. */
  peaks: { type: "string", attr: audioPlayerAttrs.peaks },
  /** `bar` is one strip; `card` stacks the cover, the words and the controls. */
  variant: { type: "enum", values: ["bar", "card"], default: "bar", attr: "data-variant" },
  /** The player's accessible name: the region a reader lands in. Name it after what it plays. */
  label: { type: "string", default: "Audio player", attr: "aria-label" },
  playLabel: { type: "string", default: "Play", attr: "aria-label" },
  pauseLabel: { type: "string", default: "Pause", attr: audioPlayerAttrs.labelPause },
  replayLabel: { type: "string", default: "Replay", attr: audioPlayerAttrs.labelReplay },
  muteLabel: { type: "string", default: "Mute", attr: "aria-label" },
  unmuteLabel: { type: "string", default: "Unmute", attr: audioPlayerAttrs.labelUnmute },
  seekLabel: { type: "string", default: "Seek", attr: "aria-label" },
  volumeLabel: { type: "string", default: "Volume", attr: "aria-label" },
  speedLabel: { type: "string", default: "Playback speed", attr: "aria-label" },
  previousLabel: { type: "string", default: "Previous track", attr: "aria-label" },
  nextLabel: { type: "string", default: "Next track", attr: "aria-label" },
  /** Names the playlist. */
  tracksLabel: { type: "string", default: "Tracks", attr: "aria-label" },
  /** What the seek bar says in words. `{current}` and `{duration}` are filled in. */
  timeLabel: {
    type: "string",
    default: "{current} of {duration}",
    attr: audioPlayerAttrs.timeLabel,
    machineInput: true,
  },
  /** When a track ends, the next one starts. Off: it stops and waits. */
  autoAdvance: {
    type: "boolean",
    default: true,
    attr: audioPlayerAttrs.autoAdvance,
    falseValue: "false",
    machineInput: true,
  },
  /** Seconds a `j` or `l` moves. */
  skip: {
    type: "number",
    default: VIDEO_PLAYER_SKIP,
    min: 1,
    max: 120,
    attr: audioPlayerAttrs.skip,
    machineInput: true,
  },
  /** The rates the speed button steps through, space separated. */
  speeds: {
    type: "string",
    default: /* @__PURE__ */ VIDEO_PLAYER_SPEEDS.join(" "),
    attr: audioPlayerAttrs.speeds,
    machineInput: true,
  },
} as const;

/** Marked pure so a bundle that never reads the contract (the controller, a binding's defaults) does not carry it. */
export const audioPlayerContract = /*#__PURE__*/ (() => ({
  id: "audio-player",
  category: "content",
  css: "@skryensya/core/components/audio-player.css",
  parts: audioPlayerParts,
  hooks: [
    "--sk-audio-player-bg",
    "--sk-audio-player-bar-gap",
    "--sk-audio-player-bar-width",
    "--sk-audio-player-buffered-color",
    "--sk-audio-player-cover-size",
    "--sk-audio-player-fg",
    "--sk-audio-player-item-accent",
    "--sk-audio-player-padding",
    "--sk-audio-player-played-color",
    "--sk-audio-player-radius",
    "--sk-audio-player-thumb-size",
    "--sk-audio-player-track-color",
    "--sk-audio-player-track-size",
    "--sk-audio-player-volume-pad",
    "--sk-audio-player-volume-width",
    "--sk-audio-player-wave-height",
  ],
  systemOwned: [
    "buffered",
    "played",
    "wave",
    "waveBars",
    "waveFill",
    "thumb",
    "tip",
    "volumeFill",
    "current",
    "duration",
    "speed",
    "itemButton",
    "itemLeading",
    "itemText",
    "itemTitle",
    "itemArtist",
    "itemDuration",
  ],
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],

  options: audioPlayerOptions,

  signatures: {
    AudioPlayer: {
      intent: ["audio-player", "play-audio", "music-player", "podcast-player", "playlist", "play-a-sound"],
      host: { element: "div" },
      mount: audioPlayerAttrs.root,
      options: [
        ...sharedOptions,
        "title",
        "artist",
        "cover",
        "peaks",
        "variant",
        "muteLabel",
        "unmuteLabel",
        "volumeLabel",
        "speedLabel",
        "previousLabel",
        "nextLabel",
        "tracksLabel",
        "autoAdvance",
        "skip",
        "speeds",
      ],
      forward: ["id", "aria-*"],
      exactlyOneOf: [["src", "tracks", "children"]],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "list", sheets: ["@skryensya/core/components/list.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        /** Authored media: an `<audio>` with several sources. The controller turns its native controls off. */
        children: { accepts: "node" },
        /** A playlist. The first entry is loaded; the player offers previous and next, and moves on when one ends. */
        tracks: {
          accepts: "items",
          item: {
            options: {
              /** The audio file of this track. */
              src: { type: "string", attr: audioPlayerAttrs.trackSrc },
              /** The cover image of this track. */
              cover: { type: "string", attr: audioPlayerAttrs.trackCover },
              /** Seconds, when known before the file loads, so the list can show it. */
              duration: { type: "number", min: 0, attr: audioPlayerAttrs.trackDuration },
              /** This track's waveform. */
              peaks: { type: "string", attr: audioPlayerAttrs.trackPeaks },
            },
            slots: {
              title: { accepts: "text", required: true },
              artist: { accepts: "text" },
            },
            requires: ["src"],
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        /* Focusable by script and by a press, never by Tab: the keys need somewhere to land after a click on the cover. */
        attrs: { role: "group", tabindex: "-1" },
        children: [
          {
            element: "audio",
            part: "media",
            options: ["src"],
            attrs: { preload: "none", [audioPlayerAttrs.deferLoad]: "" },
            whenGiven: ["src", "tracks"],
          },
          { slot: "children" },
          {
            element: "img",
            part: "cover",
            options: ["cover"],
            attrs: { alt: "", "aria-hidden": "true" },
            whenGiven: ["cover", "tracks"],
          },
          {
            element: "div",
            part: "meta",
            whenGiven: ["title", "artist", "tracks"],
            children: [
              { element: "span", part: "title", textFromOption: "title", whenGiven: ["title", "tracks"] },
              { element: "span", part: "artist", textFromOption: "artist", whenGiven: ["artist", "tracks"] },
            ],
          },
          {
            element: "div",
            part: "controls",
            children: [
              seekBar(["seekLabel", "timeLabel"], true),
              {
                element: "div",
                part: "bar",
                children: [
                  iconButton("previous", ["previousLabel"], [face("track-previous", "previous")], { hidden: true, keys: "Shift+P", size: "md" }),
                  playButton({ size: "md", variant: "solid" }),
                  iconButton("next", ["nextLabel"], [face("track-next", "next")], { hidden: true, keys: "Shift+N", size: "md" }),
                  clock,
                  { element: "span", part: "spacer", attrs: { "aria-hidden": "true" } },
                  {
                    element: "button",
                    part: "control",
                    also: ["sk-button", "sk-interactive"],
                    options: ["speedLabel"],
                    attrs: {
                      type: "button",
                      [audioPlayerAttrs.action]: "speed",
                      "data-variant": "ghost",
                      "data-size": "sm",
                      "aria-keyshortcuts": "Shift+, Shift+.",
                    },
                    children: [{ element: "span", part: "speed" }],
                  },
                  {
                    element: "div",
                    part: "volume",
                    children: [
                      iconButton("mute", ["muteLabel", "unmuteLabel"], [face("volume", "volume"), face("volume-muted", "muted")], { keys: "m" }),
                      slider("volumeSlider", ["volumeLabel"], [{ element: "div", part: "volumeFill" }]),
                    ],
                  },
                ],
              },
            ],
          },
          {
            /* List's rows: the same anatomy (a button that is the whole row, a leading mark, the words, a trailing value) and its square corners and dividers. */
            element: "ol",
            part: "list",
            also: ["sk-list"],
            options: ["tracksLabel"],
            attrs: { role: "list" },
            whenGiven: "tracks",
            children: [
              {
                element: "li",
                part: "item",
                also: ["sk-list__item"],
                repeat: "tracks",
                children: [
                  {
                    element: "button",
                    part: "itemButton",
                    also: ["sk-list__action", "sk-interactive"],
                    attrs: { type: "button" },
                    itemOptions: ["src", "cover", "duration", "peaks"],
                    children: [
                      { element: "span", part: "itemLeading", also: ["sk-list__leading"], attrs: { "aria-hidden": "true" } },
                      {
                        element: "span",
                        part: "itemText",
                        also: ["sk-list__content"],
                        children: [
                          { element: "span", part: "itemTitle", also: ["sk-list__title"], itemSlot: "title" },
                          { element: "span", part: "itemArtist", also: ["sk-list__description"], whenItemSlotGiven: "artist", itemSlot: "artist" },
                        ],
                      },
                      { element: "span", part: "itemDuration", also: ["sk-list__trailing"], attrs: { "aria-hidden": "true" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/audio-player", name: "AudioPlayer" },
    },

    AudioPlayerMinimal: {
      intent: ["simple-audio", "minimal-audio-player", "voice-note", "audio-clip", "inline-audio"],
      host: { element: "div" },
      mount: audioPlayerAttrs.root,
      options: [...sharedOptions, "title", "skip"],
      forward: ["id", "aria-*"],
      exactlyOneOf: [["src", "children"]],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        /** Authored media: an `<audio>` with several sources. The controller turns its native controls off. */
        children: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "group", tabindex: "-1", "data-variant": "minimal" },
        children: [
          { element: "audio", part: "media", options: ["src"], attrs: { preload: "none", [audioPlayerAttrs.deferLoad]: "" }, whenGiven: "src" },
          { slot: "children" },
          playButton({ variant: "solid" }),
          /* What is playing, so the row says it before anything is pressed. Optional: without it the row is play, bar and time. */
          { element: "span", part: "title", textFromOption: "title", whenGiven: "title" },
          seekBar(["seekLabel", "timeLabel"], false),
          clock,
        ],
      },
      react: { from: "@skryensya/react/audio-player", name: "AudioPlayerMinimal" },
    },
  },
}) as const satisfies ComponentContract)();

/** Derived, never restated. */
export type AudioPlayerOptions = OptionsOf<typeof audioPlayerContract>;
