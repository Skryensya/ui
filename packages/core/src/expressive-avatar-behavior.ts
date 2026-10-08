/*
 * THE BEHAVIOUR OF AN EXPRESSIVE AVATAR: where it looks, when it blinks, how it speaks.
 *
 * Ported as it was in allison.sh's own avatar (`avatar-client.ts`, `speech-bubble.ts`), without the
 * page it lived in: no `querySelector`, no `localStorage`, no analytics. What it takes is a rectangle
 * and some pointer coordinates; what it gives back is WHICH LOOK the face is in, by name, and a
 * binding shows the image that has that name. That split is what lets one behaviour drive a React tree today and authored HTML
 * later, the same way `paginationRange` or a Zag machine does for the families that have one.
 *
 * Timers are the browser's own (`window.setTimeout`): the controller is made and used inside an effect,
 * never during render, so nothing here runs on a server.
 */
import {
  type ExpressiveAvatarDirection,
  type ExpressiveAvatarLook,
  type ExpressiveAvatarMouth,
} from "./expressive-avatar.js";

/** The speech mouth shapes a phrase can ask for (`default` is the resting mouth, `smile` is the celebration). */
export const expressiveAvatarSpeechMouths = ["neutral", "closed", "a", "e", "i", "o", "u"] as const;
export type ExpressiveAvatarSpeechMouth = (typeof expressiveAvatarSpeechMouths)[number];

/**
 * What a binding shows: ONE look, by name. The controller keeps the moving parts apart (a gaze, a blink,
 * a mouth), but a face with an image per state is in one at a time: it looks straight ahead while it
 * speaks or smiles, and it blinks or winks in place of its gaze. So the look is the mouth when it is not
 * at rest (a vowel, a closed lip, the smile), else the wink or the blink, else the gaze. A blink in the
 * middle of a word is skipped: the mouth is what is read then.
 */
export type ExpressiveAvatarFace = {
  look: ExpressiveAvatarLook;
  /** The expression that was asked for by name and is on now, or null when the face is running on its own. */
  expression: string | null;
};

export const expressiveAvatarDirections: readonly ExpressiveAvatarDirection[] = [
  "base",
  "top-left",
  "top",
  "top-right",
  "left",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

export const isExpressiveAvatarDirection = (value: string | undefined): value is ExpressiveAvatarDirection =>
  Boolean(value && (expressiveAvatarDirections as readonly string[]).includes(value));

export const isExpressiveAvatarSpeechMouth = (value: string | undefined): value is ExpressiveAvatarSpeechMouth =>
  Boolean(value && (expressiveAvatarSpeechMouths as readonly string[]).includes(value));

type Rect = { left: number; top: number; width: number; height: number; right: number; bottom: number };

/**
 * Which of the nine looks answers a pointer at (x, y). A dead zone around the centre looks straight
 * ahead; past it the dominant axis decides, and only a clearly diagonal pointer gets a diagonal look.
 * Beyond 300px from the face it stops following at all, unless it was told to (`forceTrack`: a press).
 */
export function expressiveAvatarDirectionFor(rect: Rect, x: number, y: number, forceTrack = false): ExpressiveAvatarDirection {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const deadZoneX = rect.width * 0.14;
  const deadZoneY = rect.height * 0.14;
  const maxTrackingDistance = 300;

  const nearestX = Math.max(rect.left, Math.min(x, rect.right));
  const nearestY = Math.max(rect.top, Math.min(y, rect.bottom));
  const distanceFromFace = Math.hypot(x - nearestX, y - nearestY);

  if (!forceTrack && distanceFromFace > maxTrackingDistance) return "base";

  const horizontal = Math.abs(dx) <= deadZoneX ? "center" : dx < 0 ? "left" : "right";
  const vertical = Math.abs(dy) <= deadZoneY ? "center" : dy < 0 ? "top" : "bottom";

  if (horizontal === "center" && vertical === "center") return "base";
  if (horizontal === "center") return vertical as ExpressiveAvatarDirection;
  if (vertical === "center") return horizontal as ExpressiveAvatarDirection;

  const normalizedX = Math.abs(dx) / Math.max(deadZoneX, 1);
  const normalizedY = Math.abs(dy) / Math.max(deadZoneY, 1);
  const dominantAxisRatio = Math.min(normalizedX, normalizedY) / Math.max(normalizedX, normalizedY);

  if (dominantAxisRatio < 0.72) {
    return normalizedX > normalizedY ? (horizontal as ExpressiveAvatarDirection) : (vertical as ExpressiveAvatarDirection);
  }

  return `${vertical}-${horizontal}` as ExpressiveAvatarDirection;
}

/* ── Speech: from text to mouth shapes ─────────────────────────────────────────────────────────── */

function mouthForChar(ch: string): ExpressiveAvatarSpeechMouth {
  const c = ch.toLowerCase();
  if ("aá".includes(c)) return "a";
  if ("eé".includes(c)) return "e";
  if ("ií".includes(c)) return "i";
  if ("oó".includes(c)) return "o";
  if ("uúü".includes(c)) return "u";
  if ("mbpfv".includes(c)) return "closed";
  if ("szctdnlr".includes(c)) return "i";
  return "neutral";
}

const VOWEL = /[aeiouáéíóúü]/i;
const LABIAL = /[mbpfv]/i;

/* A word is a lip closure if it opens on a labial, then its first vowel, then its last. */
function shapesForWord(word: string): ExpressiveAvatarSpeechMouth[] {
  const out: ExpressiveAvatarSpeechMouth[] = [];
  if (LABIAL.test(word[0]!)) out.push("closed");
  let first: ExpressiveAvatarSpeechMouth | null = null;
  let last: ExpressiveAvatarSpeechMouth | null = null;
  for (const ch of word) {
    if (VOWEL.test(ch)) {
      const shape = mouthForChar(ch);
      first ??= shape;
      last = shape;
    }
  }
  if (first) {
    out.push(first);
    if (last && last !== first) out.push(last);
  } else {
    out.push("i");
  }
  return out;
}

export type ExpressiveAvatarMouthKeyframe = { shape: ExpressiveAvatarSpeechMouth; ms: number };

/**
 * The mouth over time for a phrase: a few shapes per word, a neutral beat between words, repeats
 * collapsed, and never changing faster than every 110ms (too many shapes are sampled down), spread
 * evenly across `totalDuration`.
 */
export function expressiveAvatarMouthTimeline(phrase: string, totalDuration: number): ExpressiveAvatarMouthKeyframe[] {
  const words = phrase.split(/\s+/).filter(Boolean);
  const shapes: ExpressiveAvatarSpeechMouth[] = [];

  words.forEach((word, index) => {
    shapes.push(...shapesForWord(word));
    if (index < words.length - 1) shapes.push("neutral");
  });
  if (shapes.length === 0) return [];

  const deduped = [shapes[0]!];
  for (let i = 1; i < shapes.length; i++) if (shapes[i] !== deduped[deduped.length - 1]) deduped.push(shapes[i]!);

  const minIntervalMs = 110;
  const maxShapes = Math.max(1, Math.floor(totalDuration / minIntervalMs));

  let final = deduped;
  if (deduped.length > maxShapes) {
    const sampled: ExpressiveAvatarSpeechMouth[] = [];
    for (let i = 0; i < maxShapes; i++) {
      const index = Math.round((i / Math.max(maxShapes - 1, 1)) * (deduped.length - 1));
      const shape = deduped[index]!;
      if (sampled.length === 0 || sampled[sampled.length - 1] !== shape) sampled.push(shape);
    }
    final = sampled;
  }

  const interval = totalDuration / final.length;
  return final.map((shape, i) => ({ shape, ms: Math.round(i * interval) }));
}

/* ── Phrases: what it says, in what order ──────────────────────────────────────────────────────── */

export type ExpressiveAvatarPhraseCategory = "short" | "mid" | "long";
export type ExpressiveAvatarPhrase = {
  text: string;
  category?: ExpressiveAvatarPhraseCategory;
  /** A look to hold while it is said and for as long as it is up: a name, built-in or one of your own. */
  expression?: string;
};

/** The three bags a visit draws from. `greetings` come first, in order; `general` is shuffled, then repeats. */
export type ExpressiveAvatarPhraseSet = {
  greetings?: readonly ExpressiveAvatarPhrase[];
  /** Phrases for the day (a birthday, a holiday): said right after the greetings. */
  special?: readonly ExpressiveAvatarPhrase[];
  general?: readonly ExpressiveAvatarPhrase[];
};

/** How long a phrase stays up after it is typed, by length. */
export const expressiveAvatarDisplayDuration = (phrase: ExpressiveAvatarPhrase): number =>
  phrase.category === "long" ? 4200 : phrase.category === "mid" ? 3200 : 2400;

const shuffle = <T,>(items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
};

/**
 * The queue behind "click to hear the next thing": greetings and the day's specials once, then the
 * general bag in a shuffled loop. `peek` says what comes next and whether it closes a lap of the loop
 * (which is when the avatar celebrates); `advance` commits to it.
 */
export function createExpressiveAvatarPhraseQueue(set: ExpressiveAvatarPhraseSet) {
  const intro = (): ExpressiveAvatarPhrase[] => [...(set.greetings ?? []), ...(set.special ?? [])];
  const loop = (): ExpressiveAvatarPhrase[] => {
    const specialTexts = new Set((set.special ?? []).map((phrase) => phrase.text));
    return shuffle((set.general ?? []).filter((phrase) => !specialTexts.has(phrase.text)));
  };

  let introQueue = intro();
  let introIndex = 0;
  let loopQueue = loop();
  let loopIndex = 0;
  let lastFromLoop = false;

  const ensureLoop = () => {
    if (loopQueue.length === 0) {
      loopQueue = loop();
      loopIndex = 0;
    }
  };

  return {
    peek(): { phrase: ExpressiveAvatarPhrase; source: "intro" | "loop"; completesLoop: boolean } | null {
      if (introIndex < introQueue.length) {
        lastFromLoop = false;
        return { phrase: introQueue[introIndex]!, source: "intro", completesLoop: false };
      }
      ensureLoop();
      if (loopQueue.length === 0) return null;
      lastFromLoop = true;
      return { phrase: loopQueue[loopIndex]!, source: "loop", completesLoop: loopIndex === loopQueue.length - 1 };
    },
    advance() {
      if (!lastFromLoop) {
        introIndex += 1;
        return;
      }
      ensureLoop();
      if (loopQueue.length === 0) return;
      loopIndex += 1;
      if (loopIndex >= loopQueue.length) {
        loopQueue = loop();
        loopIndex = 0;
      }
    },
    reset() {
      introQueue = intro();
      introIndex = 0;
      loopQueue = loop();
      loopIndex = 0;
      lastFromLoop = false;
    },
  };
}

/* ── The speaker: one phrase, typed out, spoken by the mouth, then put away ─────────────────────── */

export type ExpressiveAvatarSpeechPhase = "typing" | "visible" | "hiding" | "hidden";

export type ExpressiveAvatarSpeakerOptions = {
  /** The text typed so far and the phase it is in, on every change. */
  onFrame: (frame: { text: string; phase: ExpressiveAvatarSpeechPhase }) => void;
  /** A mouth shape from the phrase's timeline, and `default` when the speech ends. */
  onMouth?: (shape: ExpressiveAvatarMouth) => void;
  onTypingStart?: () => void;
  /** Typing is done; the text stays up for its reading time. */
  onTypingEnd?: () => void;
  /** The bubble is gone: after its reading time, or at once when `skipReadingPause` cut it short. Not called after `destroy`. */
  onAfterHide?: () => void;
  /** Reveal all at once instead of typing (the reader asked for less motion). */
  reducedMotion?: () => boolean;
};

/** How long the bubble takes to leave once its time is up. */
const HIDE_TRANSITION_MS = 300;

/**
 * Says one phrase at a time. The text appears a character at a time (`charSpeed`), the mouth takes the
 * shapes of the phrase's timeline across that same time, then the text rests for `displayDuration`
 * and goes. A press during the rest cuts it short; a press during the typing is ignored.
 */
export function createExpressiveAvatarSpeaker(options: ExpressiveAvatarSpeakerOptions) {
  let phase: ExpressiveAvatarSpeechPhase = "hidden";
  let timers: number[] = [];
  let destroyed = false;
  let currentText = "";

  const clear = () => {
    for (const timer of timers) window.clearTimeout(timer);
    timers = [];
  };
  const later = (ms: number, run: () => void) => {
    timers.push(window.setTimeout(run, ms));
  };
  const frame = (text: string, next: ExpressiveAvatarSpeechPhase) => {
    phase = next;
    if (!destroyed) options.onFrame({ text, phase: next });
  };

  const finishHide = () => {
    clear();
    frame("", "hidden");
    if (!destroyed) options.onAfterHide?.();
  };

  const rest = (displayDuration: number) => {
    frame(currentText, "visible");
    later(displayDuration, () => {
      frame(currentText, "hiding");
      later(HIDE_TRANSITION_MS, finishHide);
    });
  };

  return {
    say(text: string, { charSpeed = 35, displayDuration = 3200 }: { charSpeed?: number; displayDuration?: number } = {}) {
      clear();
      currentText = text;
      options.onTypingStart?.();

      const reduced = options.reducedMotion?.() ?? false;
      const typingMs = reduced ? 0 : text.length * charSpeed;

      if (reduced) {
        options.onTypingEnd?.();
        rest(displayDuration);
        return;
      }

      frame("", "typing");
      for (let count = 1; count <= text.length; count++) later(count * charSpeed, () => frame(text.slice(0, count), "typing"));

      for (const { shape, ms } of expressiveAvatarMouthTimeline(text, typingMs)) later(ms, () => options.onMouth?.(shape));
      later(typingMs, () => {
        options.onMouth?.("default");
        options.onTypingEnd?.();
        rest(displayDuration);
      });
    },

    isActive: () => phase !== "hidden",

    /** Cuts the reading pause short. False while it is still typing (nothing happens), true once it is gone. */
    skipReadingPause(): boolean {
      if (phase === "hidden") return true;
      if (phase === "typing") return false;
      finishHide();
      return true;
    },

    destroy() {
      destroyed = true;
      clear();
      phase = "hidden";
    },
  };
}

export type ExpressiveAvatarSpeaker = ReturnType<typeof createExpressiveAvatarSpeaker>;

/* ── The controller ────────────────────────────────────────────────────────────────────────────── */

export type ExpressiveAvatarControllerOptions = {
  /** Called with the tiles to show whenever they change. */
  onChange: (face: ExpressiveAvatarFace) => void;
  /** The face's box, read when the pointer moves. */
  getRect: () => Rect;
  /** Touch and pen never make the face look at them: it follows a mouse. Default `true`. */
  supportsFinePointer?: boolean;
};

type Pointer = { x: number; y: number; pointerType?: string };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const exponential = (mean: number) => -Math.log(1 - Math.random()) * mean;

/** After a click: a smile, then a wink this much later. */
const SMILE_TO_WINK_MS = 300;
const SMILE_DURATION_MS = 2000;

/**
 * The face as a small machine. A binding feeds it the pointer and the speech and draws what it reports.
 *
 *  - It LOOKS at the pointer while the pointer is on it (or just pressed somewhere, for a moment), and
 *    looks straight ahead otherwise, always, while it speaks or smiles.
 *  - It BLINKS on its own, rarely and unevenly (a human cadence, not a metronome), sometimes twice.
 *  - It WINKS and SMILES when asked (`celebrate`), and takes the mouth shapes of a speech as they come.
 */
export function createExpressiveAvatarController({ onChange, getRect, supportsFinePointer = true }: ExpressiveAvatarControllerOptions) {
  let direction: ExpressiveAvatarDirection = "base";
  let speakingDirection: ExpressiveAvatarDirection = "base";
  let mouthState: ExpressiveAvatarMouth = "default";
  let started = false;
  let isBlinking = false;
  let isWinking = false;
  let isSmiling = false;
  let isSpeaking = false;
  let isHovered = false;
  let hasPointer = false;
  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;
  let isPointerDown = false;
  let forceTrackUntil = 0;
  let clickLookHoldUntil = 0;
  let clickLookThrottleUntil = 0;
  let lastDirectionChangeAt = 0;
  let destroyed = false;
  let pinned: string | null = null;
  let pinnedTimer = 0;

  let startTimer = 0;
  let blinkTimer = 0;
  let blinkFollowupTimer = 0;
  let winkTimer = 0;
  let smileTimer = 0;
  let smileThenWinkTimer = 0;
  let nextBlinkTimer = 0;
  let pointerIdleTimer = 0;
  let clickLookHoldTimer = 0;
  let retryTimer = 0;

  let last = "";
  const emit = () => {
    if (destroyed) return;
    /* While it speaks the mouth follows the phonemes; the smile is only the celebration. */
    const mouth: ExpressiveAvatarMouth = isSpeaking ? mouthState : isSmiling ? "smile" : mouthState;
    const interactive = !isSpeaking && !isSmiling && hasPointer && (isHovered || performance.now() < forceTrackUntil);
    const gaze = interactive ? direction : speakingDirection;

    const look: ExpressiveAvatarLook =
      mouth !== "default" ? mouth : isBlinking ? "blink" : isWinking ? "wink" : started ? gaze : "base";
    const face: ExpressiveAvatarFace = { look, expression: pinned };

    const key = `${face.look}|${face.expression ?? ""}`;
    if (key === last) return;
    last = key;
    onChange(face);
  };

  const blinkDuration = () => {
    /* 90–150ms, and now and then a slightly longer one. */
    const base = 90 + Math.round(Math.random() * 60);
    const extra = Math.random() < 0.05 ? 60 + Math.round(Math.random() * 80) : 0;
    return base + extra;
  };

  const nextBlinkDelay = (initial = false) => {
    if (initial) return clamp(550 + exponential(750), 550, 2400);
    if (isSpeaking) return clamp(2600 + exponential(2400), 2600, 9000);
    /* Engaged people blink less. */
    if (isHovered || hasPointer) return clamp(5000 + exponential(3600), 5000, 16000);
    return clamp(3200 + exponential(3000), 3200, 14000);
  };

  const isClickLookThrottled = () => performance.now() < clickLookThrottleUntil;
  const isClickLookActive = () => performance.now() < clickLookHoldUntil;

  const settleEyes = () => {
    let changed = false;
    if (direction !== "base") {
      direction = "base";
      changed = true;
    }
    if (speakingDirection !== "base") {
      speakingDirection = "base";
      changed = true;
    }
    if (changed) emit();
  };

  const updateDirection = () => {
    rafId = 0;
    if (!started || isSpeaking || isSmiling || !hasPointer || (!isHovered && performance.now() >= forceTrackUntil) || isBlinking || isWinking) return;

    const now = performance.now();
    if (now - lastDirectionChangeAt < 90) {
      /* Too soon after the last change: try again when it is not. (The original dropped the update, so a
         pointer that stopped inside that window left the eyes on a stale look until it moved again.) */
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(scheduleDirectionUpdate, 90 - (now - lastDirectionChangeAt));
      return;
    }

    const next = expressiveAvatarDirectionFor(getRect(), pointerX, pointerY, performance.now() < forceTrackUntil);
    if (next === direction) return;

    direction = next;
    lastDirectionChangeAt = now;
    emit();
  };

  const scheduleDirectionUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(updateDirection);
  };

  const blinkOnce = (after?: () => void) => {
    if (!started || isBlinking || isWinking) return;
    isBlinking = true;
    emit();
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      isBlinking = false;
      emit();
      after?.();
    }, blinkDuration());
  };

  const blinkSequence = () => {
    blinkOnce(() => {
      const doubleBlink = !isWinking && (isSpeaking ? Math.random() < 0.06 : Math.random() < 0.025);
      if (!doubleBlink) return;
      window.clearTimeout(blinkFollowupTimer);
      blinkFollowupTimer = window.setTimeout(() => blinkOnce(), 90 + Math.round(Math.random() * 120));
    });
  };

  const scheduleNextBlink = (initial = false) => {
    window.clearTimeout(nextBlinkTimer);
    nextBlinkTimer = window.setTimeout(() => {
      blinkSequence();
      scheduleNextBlink();
    }, nextBlinkDelay(initial));
  };

  const winkOnce = () => {
    window.clearTimeout(blinkTimer);
    window.clearTimeout(blinkFollowupTimer);
    window.clearTimeout(winkTimer);
    isBlinking = false;
    isWinking = true;
    emit();
    winkTimer = window.setTimeout(() => {
      isWinking = false;
      emit();
    }, 280);
  };

  const smileOnce = () => {
    window.clearTimeout(smileTimer);
    direction = "base";
    speakingDirection = "base";
    isSmiling = true;
    emit();
    smileTimer = window.setTimeout(() => {
      isSmiling = false;
      emit();
    }, SMILE_DURATION_MS);
  };

  const reset = () => {
    hasPointer = false;
    forceTrackUntil = 0;
    clickLookHoldUntil = 0;
    clickLookThrottleUntil = 0;
    isHovered = false;
    isPointerDown = false;
    window.clearTimeout(pointerIdleTimer);
    window.clearTimeout(clickLookHoldTimer);
    settleEyes();
    emit();
  };

  const start = () => {
    if (started || destroyed) return;
    started = true;
    emit();
    startTimer = window.setTimeout(() => scheduleNextBlink(true), 450);
  };

  const fine = (pointer: Pointer) => supportsFinePointer && pointer.pointerType !== "touch";

  const activateClickLook = (x: number, y: number) => {
    const now = performance.now();
    if (isClickLookThrottled()) return;

    clickLookHoldUntil = now + 2000;
    clickLookThrottleUntil = now + 2400;
    pointerX = x;
    pointerY = y;
    hasPointer = true;
    forceTrackUntil = Math.max(forceTrackUntil, clickLookHoldUntil);
    scheduleDirectionUpdate();

    window.clearTimeout(clickLookHoldTimer);
    clickLookHoldTimer = window.setTimeout(() => {
      clickLookHoldUntil = 0;
      forceTrackUntil = 0;
      if (isHovered) scheduleDirectionUpdate();
      else {
        hasPointer = false;
        settleEyes();
      }
    }, 1000);
  };

  const idleThenSettle = () => {
    window.clearTimeout(pointerIdleTimer);
    pointerIdleTimer = window.setTimeout(() => {
      if (isPointerDown || isClickLookActive()) return;
      forceTrackUntil = 0;
      hasPointer = false;
      if (!isHovered) settleEyes();
    }, 900);
  };

  return {
    /** Wakes the face: the first blink is scheduled and the eyes start to follow. Any interaction calls it. */
    start,

    /** The pointer came onto the face. */
    pointerEnter(pointer: Pointer) {
      if (!fine(pointer)) return;
      start();
      isHovered = true;
      pointerX = pointer.x;
      pointerY = pointer.y;
      hasPointer = true;
      scheduleDirectionUpdate();
    },
    /** The pointer moved over the face. */
    pointerMove(pointer: Pointer) {
      if (!fine(pointer)) return;
      start();
      isHovered = true;
      pointerX = pointer.x;
      pointerY = pointer.y;
      hasPointer = true;
      scheduleDirectionUpdate();
    },
    pointerLeave() {
      isHovered = false;
      if (isClickLookActive()) return;
      if (performance.now() >= forceTrackUntil) {
        hasPointer = false;
        settleEyes();
      }
    },

    /** The pointer moved ANYWHERE: only matters while pressed, or just after a press (the click-look). */
    windowPointerMove(pointer: Pointer) {
      if (!fine(pointer)) return;
      if (!isPointerDown && !isClickLookActive()) return;
      pointerX = pointer.x;
      pointerY = pointer.y;
      hasPointer = true;
      if (isPointerDown) forceTrackUntil = performance.now() + 120;
      scheduleDirectionUpdate();
    },
    /** A press ANYWHERE on the page: the face glances at it for a moment, even from far away. */
    windowPointerDown(pointer: Pointer) {
      if (!fine(pointer)) return;
      isPointerDown = true;
      pointerX = pointer.x;
      pointerY = pointer.y;
      hasPointer = true;
      forceTrackUntil = performance.now() + 900;
      activateClickLook(pointer.x, pointer.y);
      scheduleDirectionUpdate();
      idleThenSettle();
    },
    windowPointerUp() {
      isPointerDown = false;
      idleThenSettle();
    },

    /** Focus, blur and a hidden tab: look straight ahead again. */
    reset,
    focus() {
      start();
      reset();
    },

    /** The mouth, from a speech. `default` ends it. */
    setMouth(state: ExpressiveAvatarMouth) {
      const nextSpeaking = state !== "default";
      if (nextSpeaking !== isSpeaking) {
        isSpeaking = nextSpeaking;
        /* While it speaks, a forward gaze. */
        speakingDirection = "base";
        scheduleNextBlink();
      }
      mouthState = state;
      emit();
    },
    /** A look chosen by something other than the pointer (a speech glancing away). */
    setGaze(next: ExpressiveAvatarDirection) {
      speakingDirection = isExpressiveAvatarDirection(next) ? next : "base";
      emit();
    },

    /** A smile, and a wink a moment later: what a finished lap of phrases does. */
    celebrate() {
      direction = "base";
      speakingDirection = "base";
      smileOnce();
      window.clearTimeout(smileThenWinkTimer);
      smileThenWinkTimer = window.setTimeout(() => {
        smileThenWinkTimer = 0;
        winkOnce();
      }, SMILE_TO_WINK_MS);
    },

    /**
     * Asks for an expression by name (a built-in or one you registered) and holds it until `duration` ms pass
     * or it is asked for again. `null` lets the face go back to what it was doing. The face keeps looking,
     * blinking and speaking in the parts the expression does not name.
     */
    express(name: string | null, duration?: number) {
      window.clearTimeout(pinnedTimer);
      pinned = name;
      emit();
      if (name && duration && duration > 0) {
        pinnedTimer = window.setTimeout(() => {
          pinned = null;
          emit();
        }, duration);
      }
    },

    destroy() {
      destroyed = true;
      window.clearTimeout(pinnedTimer);
      for (const timer of [startTimer, blinkTimer, blinkFollowupTimer, winkTimer, smileTimer, smileThenWinkTimer, nextBlinkTimer, pointerIdleTimer, clickLookHoldTimer, retryTimer]) {
        window.clearTimeout(timer);
      }
      if (rafId) window.cancelAnimationFrame(rafId);
    },
  };
}

export type ExpressiveAvatarController = ReturnType<typeof createExpressiveAvatarController>;
