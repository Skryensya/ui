import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * VIDEO PLAYER DEMOS. One film for every example: the trailer of Sintel, by the Blender Foundation under Creative Commons
 * Attribution 3.0, hosted under `public/video/` so the demos and the gates work offline. The captions are NOT the film's
 * dialogue (no official file exists for the trailer, and a transcript written from memory would be an invention): they are
 * demo notes that say what captions are and which keys the player answers to, and the page says so.
 */

const k = (name: string) => `demo.videoPlayer.${name}` as UIKey;

const FILM = "/video/sintel-trailer-480p.mp4";
const POSTER = "/video/sintel-poster.jpg";

const player = (t: Translate, options: Record<string, string | number | boolean> = {}, rootStyle?: string): UsageTree => ({
  contract: "video-player",
  signature: "VideoPlayer",
  options: {
    label: t(k("label")),
    src: FILM,
    poster: POSTER,
    captionsSrc: t(k("captions.src")),
    captionsLang: t(k("captions.lang")),
    captionsTitle: t(k("captions.title")),
    playLabel: t(k("playLabel")),
    pauseLabel: t(k("pauseLabel")),
    replayLabel: t(k("replayLabel")),
    muteLabel: t(k("muteLabel")),
    unmuteLabel: t(k("unmuteLabel")),
    seekLabel: t(k("seekLabel")),
    volumeLabel: t(k("volumeLabel")),
    speedLabel: t(k("speedLabel")),
    captionsLabel: t(k("captionsLabel")),
    fullscreenLabel: t(k("fullscreenLabel")),
    exitFullscreenLabel: t(k("exitFullscreenLabel")),
    remainingLabel: t(k("remainingLabel")),
    elapsedLabel: t(k("elapsedLabel")),
    timeLabel: t(k("timeLabel")),
    ...options,
  },
  ...(rootStyle ? { attrs: { style: rootStyle } } : {}),
});

/** 1. The player as it is: a poster, a bar, one caption track. */
export const videoPlayerTree = (t: Translate): UsageTree => player(t, {}, "max-inline-size: 44rem;");

/** 2. Controls that stay, and a longer skip: for a video that is studied more than watched. */
export const videoPlayerStudyTree = (t: Translate): UsageTree =>
  player(t, { autoHide: false, skip: 30, speeds: "0.5 0.75 1 1.25 1.5 2" }, "max-inline-size: 44rem;");

/* The anatomy's specimen: the player before the first play, so the big button is on the picture. */
export const videoPlayerAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-video-player {
  inline-size: min(100%, 32rem);
}
`;

export const videoPlayerAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("videoPlayerPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: player(t),
    items: [
      namePart(".sk-video-player", "block-start", { mark: "bracket" }),
      namePart(".sk-video-player__big", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-video-player__controls", "inline-start", { mark: "bracket" }),
      namePart(".sk-video-player__seek", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-video-player__bar", "block-end", { mark: "bracket" }),
      namePart(".sk-video-player__volume", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-video-player__time", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * DO / DON'T, two pairs, one lesson each. A half is emitted as static markup and never hydrated, so nothing plays: what
 * shows is the player at rest, which is exactly what a reader meets before pressing anything.
 */

/** 1. The picture before the first play. With a poster the player says what it is; without one it is a black box. */
export const videoPlayerDoPosterTree = (t: Translate): UsageTree => player(t, {}, "max-inline-size: 30rem;");

export const videoPlayerDontPosterTree = (t: Translate): UsageTree => {
  const tree = player(t, {}, "max-inline-size: 30rem;");
  const { poster: _poster, ...options } = tree.options!;
  return { ...tree, options };
};

/** 2. Room. The bar is a row of buttons and a clock; in a box too narrow for them it eats the picture. */
export const videoPlayerDoRoomTree = (t: Translate): UsageTree => player(t, {}, "max-inline-size: 30rem;");

export const videoPlayerDontRoomTree = (t: Translate): UsageTree => player(t, {}, "max-inline-size: 13rem;");
