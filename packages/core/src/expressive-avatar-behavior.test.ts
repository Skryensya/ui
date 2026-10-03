import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createExpressiveAvatarPhraseQueue,
  createExpressiveAvatarSpeaker,
  expressiveAvatarDirectionFor,
  expressiveAvatarMouthTimeline,
  type ExpressiveAvatarSpeakerOptions,
} from "./expressive-avatar-behavior.js";

const rect = { left: 100, top: 100, width: 100, height: 100, right: 200, bottom: 200 };

describe("expressiveAvatarDirectionFor", () => {
  it("looks straight ahead inside the dead zone", () => {
    expect(expressiveAvatarDirectionFor(rect, 150, 150)).toBe("base");
    expect(expressiveAvatarDirectionFor(rect, 156, 144)).toBe("base");
  });

  it("looks along one axis when the other is centred", () => {
    expect(expressiveAvatarDirectionFor(rect, 190, 150)).toBe("right");
    expect(expressiveAvatarDirectionFor(rect, 110, 150)).toBe("left");
    expect(expressiveAvatarDirectionFor(rect, 150, 110)).toBe("top");
    expect(expressiveAvatarDirectionFor(rect, 150, 190)).toBe("bottom");
  });

  it("looks diagonally only when both axes are clearly past the dead zone", () => {
    expect(expressiveAvatarDirectionFor(rect, 190, 190)).toBe("bottom-right");
    expect(expressiveAvatarDirectionFor(rect, 110, 110)).toBe("top-left");
    /* far more horizontal than vertical: the dominant axis wins */
    expect(expressiveAvatarDirectionFor(rect, 195, 170)).toBe("right");
  });

  it("stops following beyond 300px unless forced", () => {
    expect(expressiveAvatarDirectionFor(rect, 900, 150)).toBe("base");
    expect(expressiveAvatarDirectionFor(rect, 900, 150, true)).toBe("right");
  });
});

describe("expressiveAvatarMouthTimeline", () => {
  it("is empty for empty text", () => {
    expect(expressiveAvatarMouthTimeline("   ", 1000)).toEqual([]);
  });

  it("closes the lips on a labial and opens on the vowels", () => {
    const shapes = expressiveAvatarMouthTimeline("mama", 2000).map((frame) => frame.shape);
    expect(shapes[0]).toBe("closed");
    expect(shapes).toContain("a");
  });

  it("puts a neutral beat between words and collapses repeats", () => {
    const shapes = expressiveAvatarMouthTimeline("a a", 2000).map((frame) => frame.shape);
    expect(shapes).toEqual(["a", "neutral", "a"]);
  });

  it("never changes faster than every 110ms and spans the duration", () => {
    const frames = expressiveAvatarMouthTimeline("una frase bastante larga con muchas palabras distintas para hablar", 600);
    expect(frames.length).toBeLessThanOrEqual(Math.floor(600 / 110));
    expect(frames[0]!.ms).toBe(0);
    expect(frames.at(-1)!.ms).toBeLessThan(600);
  });
});

describe("createExpressiveAvatarPhraseQueue", () => {
  const set = {
    greetings: [{ text: "hi" }, { text: "welcome" }],
    special: [{ text: "happy day" }],
    general: [{ text: "a" }, { text: "b" }, { text: "c" }],
  };

  it("says greetings, then the day's specials, then the general bag in some order", () => {
    const queue = createExpressiveAvatarPhraseQueue(set);
    const said: string[] = [];
    for (let i = 0; i < 6; i++) {
      said.push(queue.peek()!.phrase.text);
      queue.advance();
    }
    expect(said.slice(0, 3)).toEqual(["hi", "welcome", "happy day"]);
    expect(said.slice(3).sort()).toEqual(["a", "b", "c"]);
  });

  it("flags the last phrase of a lap of the loop, and starts another lap", () => {
    const queue = createExpressiveAvatarPhraseQueue({ general: [{ text: "x" }, { text: "y" }] });
    const first = queue.peek()!;
    expect(first.source).toBe("loop");
    expect(first.completesLoop).toBe(false);
    queue.advance();
    expect(queue.peek()!.completesLoop).toBe(true);
    queue.advance();
    expect(queue.peek()!.completesLoop).toBe(false);
  });

  it("has nothing to say with no phrases", () => {
    expect(createExpressiveAvatarPhraseQueue({}).peek()).toBeNull();
  });
});

describe("createExpressiveAvatarSpeaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const make = (extra: Partial<ExpressiveAvatarSpeakerOptions> = {}) => {
    const frames: { text: string; phase: string }[] = [];
    const mouths: string[] = [];
    const calls: string[] = [];
    const speaker = createExpressiveAvatarSpeaker({
      onFrame: (frame) => frames.push(frame),
      onMouth: (shape) => mouths.push(shape),
      onTypingStart: () => calls.push("start"),
      onTypingEnd: () => calls.push("end"),
      onAfterHide: () => calls.push("hidden"),
      ...extra,
    });
    return { speaker, frames, mouths, calls };
  };

  it("types the text out, rests, then goes", () => {
    const { speaker, frames, calls } = make();
    speaker.say("hola", { charSpeed: 10, displayDuration: 100 });
    expect(speaker.isActive()).toBe(true);
    vi.advanceTimersByTime(25);
    expect(frames.at(-1)).toEqual({ text: "ho", phase: "typing" });
    vi.advanceTimersByTime(20);
    expect(frames.at(-1)).toEqual({ text: "hola", phase: "visible" });
    vi.advanceTimersByTime(100);
    expect(frames.at(-1)!.phase).toBe("hiding");
    vi.advanceTimersByTime(300);
    expect(frames.at(-1)).toEqual({ text: "", phase: "hidden" });
    expect(calls).toEqual(["start", "end", "hidden"]);
    expect(speaker.isActive()).toBe(false);
  });

  it("moves the mouth while typing and rests it at the end", () => {
    const { speaker, mouths } = make();
    speaker.say("mamá", { charSpeed: 100, displayDuration: 100 });
    vi.advanceTimersByTime(1000);
    expect(mouths[0]).toBe("closed");
    expect(mouths.at(-1)).toBe("default");
  });

  it("ignores a press while typing and cuts the rest short", () => {
    const { speaker, calls } = make();
    speaker.say("hola", { charSpeed: 10, displayDuration: 5000 });
    vi.advanceTimersByTime(15);
    expect(speaker.skipReadingPause()).toBe(false);
    vi.advanceTimersByTime(40);
    expect(speaker.skipReadingPause()).toBe(true);
    expect(calls.at(-1)).toBe("hidden");
    expect(speaker.isActive()).toBe(false);
  });

  it("shows everything at once for reduced motion", () => {
    const { speaker, frames } = make({ reducedMotion: () => true });
    speaker.say("hola", { displayDuration: 100 });
    expect(frames[0]).toEqual({ text: "hola", phase: "visible" });
  });

  it("says nothing more after it is destroyed", () => {
    const { speaker, calls } = make();
    speaker.say("hola", { charSpeed: 10, displayDuration: 10 });
    speaker.destroy();
    vi.advanceTimersByTime(2000);
    expect(calls).toEqual(["start"]);
  });
});

import { checkExpressiveAvatarTileset, expressiveAvatarRequiredTiles, expressiveAvatarTilePosition } from "./expressive-avatar.js";
import { expressiveAvatarAtlasLayout } from "./expressive-avatar-atlas.js";

describe("checkExpressiveAvatarTileset", () => {
  it("accepts the bundled sheet for everything a face needs, and finds the outfits it did not draw", () => {
    const report = checkExpressiveAvatarTileset(expressiveAvatarAtlasLayout.names);
    expect(report.ok).toBe(true);
    expect(report.outfits).toEqual(["base"]);
    expect(report.hats).toEqual(["none"]);
  });

  it("names what is missing", () => {
    const ids = expressiveAvatarRequiredTiles.filter((name) => name !== "right-eye-wink" && name !== "a-wide-open-left");
    const report = checkExpressiveAvatarTileset(ids);
    expect(report.ok).toBe(false);
    expect(report.missing).toEqual(["right-eye-wink", "a-wide-open-left"].sort((a, b) => expressiveAvatarRequiredTiles.indexOf(a) - expressiveAvatarRequiredTiles.indexOf(b)));
  });
});

import { expressiveAvatarExpressionFor } from "./expressive-avatar-behavior.js";

describe("expressiveAvatarExpressionFor", () => {
  it("reads the mouth first, then the blink and the wink, then the gaze", () => {
    expect(expressiveAvatarExpressionFor({ leftEye: "base", rightEye: "base", mouth: "a", expression: null })).toBe("a");
    expect(expressiveAvatarExpressionFor({ leftEye: "blink", rightEye: "blink", mouth: "smile", expression: null })).toBe("smile");
    expect(expressiveAvatarExpressionFor({ leftEye: "base", rightEye: "wink", mouth: "default", expression: null })).toBe("wink");
    expect(expressiveAvatarExpressionFor({ leftEye: "blink", rightEye: "blink", mouth: "default", expression: null })).toBe("blink");
    expect(expressiveAvatarExpressionFor({ leftEye: "top-left", rightEye: "top-left", mouth: "default", expression: null })).toBe("top-left");
  });
});

describe("the bundled tileset", () => {
  it("has every tile a face needs, in a grid it fills", () => {
    const { names, columns, rows } = expressiveAvatarAtlasLayout;
    expect(checkExpressiveAvatarTileset(names).ok).toBe(true);
    expect(names.length).toBeLessThanOrEqual(columns * rows);
    expect(new Set(names).size).toBe(names.length);
  });

  it("finds a tile by its place in the grid", () => {
    const { names, columns } = expressiveAvatarAtlasLayout;
    expect(expressiveAvatarTilePosition({ names, columns }, names[0]!)).toEqual({ column: 0, row: 0 });
    expect(expressiveAvatarTilePosition({ names, columns }, names[columns + 2]!)).toEqual({ column: 2, row: 1 });
    expect(expressiveAvatarTilePosition({ names, columns }, "nope")).toBeNull();
  });
});

import { createExpressiveAvatarController, expressiveAvatarTilesFor } from "./expressive-avatar-behavior.js";

describe("expressions", () => {
  const rest = { leftEye: "base", rightEye: "base", mouth: "default", expression: null } as const;

  it("draws the face's own parts when nothing is asked for", () => {
    expect(expressiveAvatarTilesFor(rest)).toEqual({
      leftEye: "left-eye-base",
      rightEye: "right-eye-base",
      mouthLeft: "mouth-rest-left",
      mouthRight: "mouth-rest-right",
    });
  });

  it("lays a built-in over only the parts it names", () => {
    const tiles = expressiveAvatarTilesFor({ ...rest, expression: "smile" });
    expect(tiles.mouthLeft).toBe("smile-left");
    expect(tiles.leftEye).toBe("left-eye-base");
    expect(expressiveAvatarTilesFor({ ...rest, expression: "wink" }).rightEye).toBe("right-eye-wink");
  });

  it("lays one of your own over the face, and it wins over a built-in of the same name", () => {
    const custom = { surprised: { leftEye: "left-eye-top", rightEye: "right-eye-top", mouthLeft: "o-rounded-left", mouthRight: "o-rounded-right" }, smile: { mouthLeft: "x-left" } };
    const tiles = expressiveAvatarTilesFor({ ...rest, mouth: "a", expression: "surprised" }, custom);
    expect(tiles).toEqual({ leftEye: "left-eye-top", rightEye: "right-eye-top", mouthLeft: "o-rounded-left", mouthRight: "o-rounded-right" });
    expect(expressiveAvatarTilesFor({ ...rest, expression: "smile" }, custom).mouthLeft).toBe("x-left");
  });

  it("ignores a name nobody defined", () => {
    expect(expressiveAvatarTilesFor({ ...rest, expression: "nope" }).leftEye).toBe("left-eye-base");
  });
});

describe("the controller's express()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const make = () => {
    const faces: { expression: string | null }[] = [];
    const controller = createExpressiveAvatarController({
      onChange: (face) => faces.push(face),
      getRect: () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }),
    });
    return { controller, faces };
  };

  it("holds an expression until it is cleared", () => {
    const { controller, faces } = make();
    controller.express("surprised");
    expect(faces.at(-1)!.expression).toBe("surprised");
    controller.express(null);
    expect(faces.at(-1)!.expression).toBeNull();
    controller.destroy();
  });

  it("lets go of it after a duration", () => {
    const { controller, faces } = make();
    controller.express("smile", 500);
    vi.advanceTimersByTime(499);
    expect(faces.at(-1)!.expression).toBe("smile");
    vi.advanceTimersByTime(2);
    expect(faces.at(-1)!.expression).toBeNull();
    controller.destroy();
  });
});
