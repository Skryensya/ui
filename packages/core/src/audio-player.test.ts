import { describe, expect, it } from "vitest";
import {
  AUDIO_PLAYER_MAX_PEAKS,
  AUDIO_PLAYER_WAVE_BARS,
  audioKeyAction,
  audioNextIndex,
  audioPreviousAction,
  parseAudioPeaks,
  resampleAudioPeaks,
} from "./audio-player.js";

/* The arithmetic, with no DOM: what the peaks become, what previous and next do, what a key means. The controller that calls these is proved in the React suite. */

describe("parseAudioPeaks", () => {
  it("reads numbers separated by spaces, commas or semicolons", () => {
    expect(parseAudioPeaks("0.2 0.8, 0.5;1")).toEqual([0.2, 0.8, 0.5, 1]);
  });

  it("holds a value inside 0 to 1 instead of dropping it", () => {
    expect(parseAudioPeaks("-1 0.5 3")).toEqual([0, 0.5, 1]);
  });

  it("drops what is not a number, so one stray token does not blank the wave", () => {
    expect(parseAudioPeaks("0.1 loud 0.9 NaN")).toEqual([0.1, 0.9]);
  });

  it("is empty for nothing", () => {
    expect(parseAudioPeaks(undefined)).toEqual([]);
    expect(parseAudioPeaks("  ")).toEqual([]);
  });

  it("stops at a sane count: a whole decoded buffer pasted in is a mistake, not a longer wave", () => {
    expect(parseAudioPeaks(Array(AUDIO_PLAYER_MAX_PEAKS + 500).fill("0.5").join(" "))).toHaveLength(AUDIO_PLAYER_MAX_PEAKS);
  });
});

describe("resampleAudioPeaks", () => {
  it("keeps the loudest of each share, so a spike is never averaged away", () => {
    expect(resampleAudioPeaks([0.1, 0.9, 0.1, 0.1], 2)).toEqual([0.9, 0.1]);
  });

  it("repeats a short wave across the bars it covers, so it still fills the bar", () => {
    expect(resampleAudioPeaks([0.2, 0.8], 4)).toEqual([0.2, 0.2, 0.8, 0.8]);
  });

  it("draws the default number of bars", () => {
    expect(resampleAudioPeaks([0.5])).toHaveLength(AUDIO_PLAYER_WAVE_BARS);
  });

  it("draws nothing for no peaks", () => {
    expect(resampleAudioPeaks([])).toEqual([]);
  });
});

describe("previous and next", () => {
  it("restarts the track once it is a few seconds in", () => {
    expect(audioPreviousAction(8, 2)).toEqual({ kind: "restart" });
  });

  it("goes to the track before when it has only just begun", () => {
    expect(audioPreviousAction(1, 2)).toEqual({ kind: "go", index: 1 });
  });

  it("restarts the first track, because there is no track before it", () => {
    expect(audioPreviousAction(0, 0)).toEqual({ kind: "restart" });
  });

  it("finds the next track, and none past the end", () => {
    expect(audioNextIndex(0, 3)).toBe(1);
    expect(audioNextIndex(2, 3)).toBeNull();
  });
});

describe("audioKeyAction", () => {
  const press = (key: string, extra: Partial<Parameters<typeof audioKeyAction>[0]> = {}) =>
    audioKeyAction({ key, target: "stage", paused: true, ...extra });

  it("shares the video player's keys", () => {
    expect(press("k")).toEqual({ kind: "toggle" });
    expect(press("j")).toEqual({ kind: "seek-by", seconds: -10 });
    expect(press("m")).toEqual({ kind: "mute" });
    expect(press("5")).toEqual({ kind: "seek-to", fraction: 0.5 });
  });

  it("moves along the list with Shift+P and Shift+N", () => {
    expect(press("P", { shift: true })).toEqual({ kind: "previous" });
    expect(press("N", { shift: true })).toEqual({ kind: "next" });
  });

  it("has no use for the keys that need a picture", () => {
    expect(press("f")).toEqual({ kind: "none" });
    expect(press("c")).toEqual({ kind: "none" });
    expect(press(".")).toEqual({ kind: "none" });
    expect(press(",")).toEqual({ kind: "none" });
  });

  it("leaves a modified key to the browser", () => {
    expect(press("P", { shift: true, modified: true })).toEqual({ kind: "none" });
  });
});
