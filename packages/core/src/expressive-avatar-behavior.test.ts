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

import { checkExpressiveAvatarImages, expressiveAvatarImages, expressiveAvatarLooks } from "./expressive-avatar.js";
import { createExpressiveAvatarController } from "./expressive-avatar-behavior.js";

describe("expressiveAvatarImages", () => {
  it("names one image per look after the look, in a folder", () => {
    const images = expressiveAvatarImages("/avatars/ada");
    expect(Object.keys(images)).toEqual([...expressiveAvatarLooks]);
    expect(images.base).toBe("/avatars/ada/base.webp");
    expect(images["top-left"]).toBe("/avatars/ada/top-left.webp");
    expect(images.smile).toBe("/avatars/ada/smile.webp");
  });

  it("takes the extension, ignores a trailing slash, and lists only the looks you drew", () => {
    expect(expressiveAvatarImages("/ada/", { extension: ".png", looks: ["base", "astonished"] })).toEqual({
      base: "/ada/base.png",
      astonished: "/ada/astonished.png",
    });
  });

  it("has nineteen looks, each once, and `base` among them", () => {
    expect(expressiveAvatarLooks).toHaveLength(19);
    expect(new Set(expressiveAvatarLooks).size).toBe(19);
    expect(expressiveAvatarLooks).toContain("base");
  });
});

describe("checkExpressiveAvatarImages", () => {
  const size = { width: 250, height: 250 };

  it("accepts a full set of one square size", () => {
    const report = checkExpressiveAvatarImages(Object.fromEntries(expressiveAvatarLooks.map((look) => [look, size])));
    expect(report).toMatchObject({ ok: true, hasBase: true, missing: [], custom: [], notSquare: [], sizes: ["250×250"] });
  });

  it("is happy with `base` alone, and says what will fall back to it", () => {
    const report = checkExpressiveAvatarImages({ base: size });
    expect(report.ok).toBe(true);
    expect(report.looks).toEqual(["base"]);
    expect(report.missing).toHaveLength(18);
  });

  it("needs `base`, because it is what every other look falls back to", () => {
    expect(checkExpressiveAvatarImages({ smile: size }).ok).toBe(false);
    expect(checkExpressiveAvatarImages({ smile: size }).hasBase).toBe(false);
  });

  it("names the expressions you made up, the images that are not square and mixed sizes", () => {
    const report = checkExpressiveAvatarImages({ base: size, astonished: size, wide: { width: 300, height: 200 } });
    expect(report.custom).toEqual(["astonished", "wide"]);
    expect(report.notSquare).toEqual(["wide"]);
    expect(report.sizes).toEqual(["250×250", "300×200"]);
    expect(report.ok).toBe(false);
    expect(checkExpressiveAvatarImages({ base: size, smile: { width: 320, height: 320 } }).ok).toBe(false);
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
    const faces: { look: string; expression: string | null }[] = [];
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

  it("is in ONE look at a time: the gaze at rest, the mouth when it speaks", () => {
    const { controller, faces } = make();
    controller.setMouth("a");
    expect(faces.at(-1)!.look).toBe("a");
    controller.setMouth("default");
    expect(faces.at(-1)!.look).toBe("base");
    controller.destroy();
  });

  it("shows the smile of a celebration as its look", () => {
    const { controller, faces } = make();
    controller.celebrate();
    expect(faces.at(-1)!.look).toBe("smile");
    controller.destroy();
  });
});
