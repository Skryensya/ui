import { describe, expect, it } from "vitest";
import {
  VIDEO_PLAYER_IDLE_MS,
  VIDEO_PLAYER_SPEEDS,
  formatVideoRemaining,
  formatVideoSpeed,
  formatVideoTime,
  formatVideoTimeLabel,
  parseVideoSpeeds,
  videoBufferedEnd,
  videoCueText,
  videoControlsHidden,
  videoFiniteTime,
  videoFrameSeconds,
  videoFraction,
  videoKeyAction,
  videoNextSpeed,
  videoSeekBy,
  videoTimeFromPointer,
  videoTimeText,
  videoVolumeBy,
} from "./video-player.js";

/* The arithmetic, with no DOM: what a key means, where the pointer is in time, when the bar leaves. The controller that calls these is proved in both bindings' suites. */

describe("time", () => {
  it("reads a time the element cannot give yet as the start", () => {
    expect(videoFiniteTime(Number.NaN)).toBe(0);
    expect(videoFiniteTime(Number.POSITIVE_INFINITY)).toBe(0);
    expect(videoFiniteTime(-4)).toBe(0);
  });

  it("draws minutes and seconds, and hours only once there are some", () => {
    expect(formatVideoTime(0)).toBe("0:00");
    expect(formatVideoTime(65.9)).toBe("1:05");
    expect(formatVideoTime(3723)).toBe("1:02:03");
  });

  it("draws what remains with a minus, and never less than nothing", () => {
    expect(formatVideoRemaining(26, 52)).toBe("-0:26");
    expect(formatVideoRemaining(0, 3723)).toBe("-1:02:03");
    expect(formatVideoRemaining(60, 52)).toBe("-0:00");
    expect(formatVideoRemaining(5, Number.NaN)).toBe("-0:00");
  });

  it("says the time in words a screen reader can use", () => {
    expect(videoTimeText(65, "en")).toBe("1 minute 5 seconds");
    expect(videoTimeText(3600, "en")).toBe("1 hour");
    expect(videoTimeText(0, "en")).toBe("0 seconds");
  });

  it("fills the seek bar's sentence", () => {
    expect(formatVideoTimeLabel("{current} of {duration}", "5 seconds", "1 minute")).toBe("5 seconds of 1 minute");
  });

  it("measures how much of the media a time is, and holds it inside", () => {
    expect(videoFraction(30, 120)).toBe(0.25);
    expect(videoFraction(500, 120)).toBe(1);
    expect(videoFraction(10, Number.NaN)).toBe(0);
  });
});

describe("videoCueText", () => {
  it("takes WebVTT's inline markup out of a cue, so a tag is never drawn as text", () => {
    expect(videoCueText("<b>Hello</b> <i>there</i>")).toBe("Hello there");
    expect(videoCueText("<c.yellow>Look</c> <00:01.000>out")).toBe("Look out");
  });
  it("reads the entities a cue may carry", () => {
    expect(videoCueText("Tom &amp; Jerry &lt;3")).toBe("Tom & Jerry <3");
  });
  it("keeps line breaks, which the plate draws as lines", () => {
    expect(videoCueText("one\ntwo")).toBe("one\ntwo");
  });
});

describe("videoFrameSeconds", () => {
  it("takes the middle gap between presented frames, so it reads the rate the video really has", () => {
    expect(videoFrameSeconds(Array(10).fill(1 / 24))).toBeCloseTo(1 / 24, 6);
  });
  it("is not dragged off by a dropped frame, which doubles one gap", () => {
    const gaps = [...Array(9).fill(1 / 24), 2 / 24];
    expect(videoFrameSeconds(gaps)).toBeCloseTo(1 / 24, 6);
  });
  it("falls back to 30 fps with too few frames, or none that make sense", () => {
    expect(videoFrameSeconds([1 / 24, 1 / 24])).toBeCloseTo(1 / 30, 6);
    expect(videoFrameSeconds([0, Number.NaN, 5, -1, 0, 0])).toBeCloseTo(1 / 30, 6);
  });
});

describe("videoBufferedEnd", () => {
  const ranges = [[0, 10], [20, 35]] as const;
  it("is the end of the range the reader is in", () => {
    expect(videoBufferedEnd(ranges, 5)).toBe(10);
    expect(videoBufferedEnd(ranges, 25)).toBe(35);
  });
  it("is the time itself in a gap, so a seek past the buffer shows no buffered fill ahead of the thumb", () => {
    expect(videoBufferedEnd(ranges, 15)).toBe(15);
    expect(videoBufferedEnd([], 3)).toBe(3);
  });
});

describe("videoTimeFromPointer", () => {
  const box = { start: 100, end: 300, duration: 200 };
  it("maps the pointer along the bar to a time", () => {
    expect(videoTimeFromPointer({ ...box, pointer: 200 })).toBe(100);
    expect(videoTimeFromPointer({ ...box, pointer: 100 })).toBe(0);
  });
  it("holds a pointer outside the bar at its ends", () => {
    expect(videoTimeFromPointer({ ...box, pointer: 50 })).toBe(0);
    expect(videoTimeFromPointer({ ...box, pointer: 900 })).toBe(200);
  });
  it("measures from the right edge in a right-to-left page", () => {
    expect(videoTimeFromPointer({ ...box, pointer: 250, rtl: true })).toBe(50);
  });
  it("is the start for a bar with no width", () => {
    expect(videoTimeFromPointer({ pointer: 5, start: 10, end: 10, duration: 30 })).toBe(0);
  });
});

describe("moving", () => {
  it("seeks by a delta and saturates at both ends", () => {
    expect(videoSeekBy(50, 10, 100)).toBe(60);
    expect(videoSeekBy(5, -10, 100)).toBe(0);
    expect(videoSeekBy(95, Number.POSITIVE_INFINITY, 100)).toBe(100);
  });
  it("moves the volume in percent and stays between silence and full", () => {
    expect(videoVolumeBy(0.5, 5)).toBe(0.55);
    expect(videoVolumeBy(0.02, -5)).toBe(0);
    expect(videoVolumeBy(0.98, 5)).toBe(1);
  });
});

describe("speeds", () => {
  it("parses what an author wrote, sorted and de-duplicated", () => {
    expect(parseVideoSpeeds("2 1 1 0.5")).toEqual([0.5, 1, 2]);
    expect(parseVideoSpeeds("1.25, 1.5")).toEqual([1.25, 1.5]);
  });
  it("falls back to the defaults for nothing usable", () => {
    expect(parseVideoSpeeds("fast slow")).toEqual([...VIDEO_PLAYER_SPEEDS]);
    expect(parseVideoSpeeds(undefined)).toEqual([...VIDEO_PLAYER_SPEEDS]);
  });
  const speeds = [0.5, 1, 1.5, 2];
  it("the button wraps from the last rate to the first", () => {
    expect(videoNextSpeed(speeds, 2, 1, true)).toBe(0.5);
    expect(videoNextSpeed(speeds, 1, 1, true)).toBe(1.5);
  });
  it("the keys stop at the ends instead of wrapping", () => {
    expect(videoNextSpeed(speeds, 2, 1, false)).toBe(2);
    expect(videoNextSpeed(speeds, 0.5, -1, false)).toBe(0.5);
  });
  it("steps to the nearest rate from one that is not in the list", () => {
    expect(videoNextSpeed(speeds, 1.2, 1, false)).toBe(1.5);
    expect(videoNextSpeed(speeds, 1.2, -1, false)).toBe(1);
  });
  it("names a rate with its multiplication sign", () => {
    expect(formatVideoSpeed(1)).toBe("1×");
    expect(formatVideoSpeed(1.25)).toBe("1.25×");
  });
});

describe("videoControlsHidden", () => {
  const base = { autoHide: true, playing: true, focusWithin: false, pointerOver: false, scrubbing: false, idleFor: VIDEO_PLAYER_IDLE_MS };
  it("hides after the idle delay while playing", () => {
    expect(videoControlsHidden(base)).toBe(true);
    expect(videoControlsHidden({ ...base, idleFor: VIDEO_PLAYER_IDLE_MS - 1 })).toBe(false);
  });
  it.each([
    ["paused", { playing: false }],
    ["auto-hide off", { autoHide: false }],
    ["focus on a control", { focusWithin: true }],
    ["the pointer over the bar", { pointerOver: true }],
    ["a drag in progress", { scrubbing: true }],
  ])("never hides while %s", (_, patch) => {
    expect(videoControlsHidden({ ...base, ...patch })).toBe(false);
  });
});

describe("videoKeyAction", () => {
  const key = (k: string, extra: Partial<Parameters<typeof videoKeyAction>[0]> = {}) =>
    videoKeyAction({ key: k, target: "stage", paused: false, ...extra });

  it("plays and pauses with k, and with Space unless a button owns it", () => {
    expect(key("k")).toEqual({ kind: "toggle" });
    expect(key(" ")).toEqual({ kind: "toggle" });
    expect(key(" ", { target: "button" })).toEqual({ kind: "none" });
    expect(key("k", { target: "button" })).toEqual({ kind: "toggle" });
  });

  it("seeks ten seconds with j and l, or what the root says", () => {
    expect(key("j")).toEqual({ kind: "seek-by", seconds: -10 });
    expect(key("l", { skip: 30 })).toEqual({ kind: "seek-by", seconds: 30 });
  });

  it("seeks five seconds with the arrows, flipped in a right-to-left page", () => {
    expect(key("ArrowRight")).toEqual({ kind: "seek-by", seconds: 5 });
    expect(key("ArrowRight", { rtl: true })).toEqual({ kind: "seek-by", seconds: -5 });
  });

  it("moves the volume with up and down, and with all four arrows on the volume slider", () => {
    expect(key("ArrowUp")).toEqual({ kind: "volume-by", percent: 5 });
    expect(key("ArrowLeft", { target: "volume" })).toEqual({ kind: "volume-by", percent: -5 });
    expect(key("ArrowRight", { target: "volume", rtl: true })).toEqual({ kind: "volume-by", percent: -5 });
    expect(key("End", { target: "volume" })).toEqual({ kind: "volume-to", fraction: 1 });
  });

  it("jumps to a tenth with the digits", () => {
    expect(key("0")).toEqual({ kind: "seek-to", fraction: 0 });
    expect(key("7")).toEqual({ kind: "seek-to", fraction: 0.7 });
  });

  it("goes to the start and the end on the stage and the seek bar, and leaves Home and End to buttons", () => {
    expect(key("Home", { target: "seek" })).toEqual({ kind: "seek-to", fraction: 0 });
    expect(key("End")).toEqual({ kind: "seek-end" });
    expect(key("End", { target: "button" })).toEqual({ kind: "none" });
  });

  it("maps the single-letter shortcuts", () => {
    expect(key("m")).toEqual({ kind: "mute" });
    expect(key("F")).toEqual({ kind: "fullscreen" });
    expect(key("c")).toEqual({ kind: "captions" });
    expect(key(">")).toEqual({ kind: "speed", direction: 1 });
    expect(key("<")).toEqual({ kind: "speed", direction: -1 });
  });

  it("steps a frame with the period and the comma, paused or playing (the controller pauses a running video first)", () => {
    expect(key(".")).toEqual({ kind: "frame", direction: 1 });
    expect(key(",")).toEqual({ kind: "frame", direction: -1 });
    expect(key(".", { paused: true })).toEqual({ kind: "frame", direction: 1 });
  });

  it("hands every chord back to the browser", () => {
    expect(key("f", { modified: true })).toEqual({ kind: "none" });
    expect(key("k", { modified: true })).toEqual({ kind: "none" });
  });

  it("ignores keys it does not know", () => {
    expect(key("q")).toEqual({ kind: "none" });
    expect(key("Tab")).toEqual({ kind: "none" });
  });
});
