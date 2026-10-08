import {
  expressiveAvatarEvents,
  expressiveAvatarParts,
  type ExpressiveAvatarAppearance,
  type ExpressiveAvatarLook,
  type ExpressiveAvatarSize,
} from "@skryensya/core/expressive-avatar";
import {
  createExpressiveAvatarController,
  createExpressiveAvatarPhraseQueue,
  createExpressiveAvatarSpeaker,
  expressiveAvatarDisplayDuration,
  type ExpressiveAvatarController,
  type ExpressiveAvatarFace,
  type ExpressiveAvatarPhrase,
  type ExpressiveAvatarPhraseCategory,
  type ExpressiveAvatarPhraseSet,
  type ExpressiveAvatarSpeaker,
  type ExpressiveAvatarSpeechPhase,
} from "@skryensya/core/expressive-avatar-behavior";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ExpressiveAvatarImageSource = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes" | "width" | "height"
>;

/** A look by name: one of the built-ins (`smile`, `top-left`, `blink`...), or any name you gave an image. */
export type ExpressiveAvatarExpression = ExpressiveAvatarLook | (string & {});

export type ExpressiveAvatarVoices = Partial<Record<ExpressiveAvatarPhraseCategory, readonly string[]>>;

/** What a page can ask an expressive avatar to do, from anywhere: a button, a timer, a form that failed. */
export type ExpressiveAvatarApi = {
  /**
   * Shows an expression by name (a built-in, or any name that has an image) until `duration` ms pass, or
   * until it is asked for again or cleared. A name with no image shows nothing new.
   */
  express: (name: string | null, options?: { duration?: number }) => void;
  /** Says something now, typed out with the mouth moving, instead of the next phrase in the queue. */
  speak: (phrase: string | ExpressiveAvatarPhrase) => void;
};

export type ExpressiveAvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Accessible identity name. */
  name: string;
  size?: ExpressiveAvatarSize;
  appearance?: ExpressiveAvatarAppearance;
  /**
   * ONE WHOLE IMAGE PER EXPRESSION, keyed by name: the built-ins (`base`, the eight gazes, `blink`, `wink`,
   * `a`, `e`, `i`, `o`, `u`, `closed`, `neutral`, `smile`) and any name of your own. `base` is the one it
   * falls back to, and the only one it needs; a look with no image shows it. `expressiveAvatarImages()`
   * (`@skryensya/core/expressive-avatar`) builds the map from a folder named after the looks.
   */
  images?: Readonly<Record<string, string | ExpressiveAvatarImageSource>>;
  /** The face as one image: the same as `images={{ base: src }}`. `images` wins on a name they share. */
  src?: string;
  /** The look to show, by name. `base`, the default, asks for nothing. */
  expression?: ExpressiveAvatarExpression;
  /**
   * Makes it alive: the eyes follow the pointer, it blinks on its own, and a click makes it speak the next
   * of its `phrases`. The root becomes a button, every image is loaded and stacked so a change of look is a
   * switch and never a load, and `expression` still pins a look over what the face is doing.
   */
  interactive?: boolean;
  /** What it says, a click at a time: greetings first, then the general bag in a shuffled loop. */
  phrases?: ExpressiveAvatarPhraseSet;
  /** Optional recordings, one played per phrase by its length (`short`, `mid`, `long`), over the typing. */
  voices?: ExpressiveAvatarVoices;
  /** Called with each phrase as it starts. */
  onSpeak?: (phrase: ExpressiveAvatarPhrase) => void;
  /** The handle for triggering expressions and speech from outside. */
  apiRef?: Ref<ExpressiveAvatarApi>;
} & Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "crossOrigin" | "decoding" | "fetchPriority" | "loading" | "referrerPolicy"
>;

/*
 * THE LIVE FACE. One controller for the eyes and mouth, one speaker for the words; this hook owns their
 * lifetime and turns what they report into state a render can read. Nothing here runs on a server: the
 * machines are made in an effect.
 */
function useExpressiveAvatarBehavior({
  enabled,
  phrases,
  voices,
  onSpeak,
  expression,
  apiRef,
}: {
  enabled: boolean;
  phrases: ExpressiveAvatarPhraseSet | undefined;
  voices: ExpressiveAvatarVoices | undefined;
  onSpeak: ((phrase: ExpressiveAvatarPhrase) => void) | undefined;
  expression: string | null;
  apiRef: Ref<ExpressiveAvatarApi> | undefined;
}) {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const controllerRef = useRef<ExpressiveAvatarController | null>(null);
  const speakerRef = useRef<ExpressiveAvatarSpeaker | null>(null);
  const speakRef = useRef<(phrase?: ExpressiveAvatarPhrase) => void>(() => {});
  const [face, setFace] = useState<ExpressiveAvatarFace | null>(null);
  const [speech, setSpeech] = useState<{ text: string; phase: ExpressiveAvatarSpeechPhase } | null>(null);

  /* The latest props, read by the machines without rebuilding them. */
  const latest = useRef({ phrases, voices, onSpeak, expression });
  latest.current = { phrases, voices, onSpeak, expression };

  useImperativeHandle(
    apiRef,
    () => ({
      express: (name, options) => controllerRef.current?.express(name, options?.duration),
      speak: (phrase) => speakRef.current(typeof phrase === "string" ? { text: phrase } : phrase),
    }),
    [],
  );

  /* The pinned look from the `expression` prop. */
  useEffect(() => {
    if (enabled) controllerRef.current?.express(expression);
  }, [enabled, expression]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;

    const controller = createExpressiveAvatarController({
      onChange: setFace,
      getRect: () => root.getBoundingClientRect(),
      supportsFinePointer: window.matchMedia("(pointer: fine)").matches,
    });
    controllerRef.current = controller;
    controller.express(latest.current.expression);

    let audio: HTMLAudioElement | null = null;
    let stopAudioTimer = 0;
    const voiceIndex: Record<string, number> = {};
    const stopVoice = () => {
      window.clearTimeout(stopAudioTimer);
      audio?.pause();
      audio = null;
    };

    let category: ExpressiveAvatarPhraseCategory = "short";
    /* What happens once the current phrase is gone: set per phrase, run by the speaker's `onAfterHide`. */
    let afterHide: () => void = () => {};
    const speaker = createExpressiveAvatarSpeaker({
      onFrame: ({ text, phase }) => setSpeech(phase === "hidden" ? null : { text, phase }),
      onMouth: (shape) => controller.setMouth(shape),
      reducedMotion: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onTypingStart: () => {
        /* Inside the click that started it, so the browser lets it play. */
        const urls = latest.current.voices?.[category];
        if (!urls?.length) return;
        const index = (voiceIndex[category] = ((voiceIndex[category] ?? -1) + 1) % urls.length);
        stopVoice();
        audio = new Audio(urls[index]);
        void audio.play().catch(() => {});
      },
      onTypingEnd: () => {
        window.clearTimeout(stopAudioTimer);
        stopAudioTimer = window.setTimeout(stopVoice, 220);
      },
      onAfterHide: () => afterHide(),
    });
    speakerRef.current = speaker;

    const queue = createExpressiveAvatarPhraseQueue(latest.current.phrases ?? {});
    /* After a phrase goes, a beat before the next one can start. */
    let nextAllowedAt = 0;

    /* Says a phrase. With none given, the next of the queue. */
    speakRef.current = (given) => {
      controller.start();
      const now = performance.now();
      if (!given && now < nextAllowedAt) return;
      if (speaker.isActive() && !speaker.skipReadingPause()) return;

      let next: { phrase: ExpressiveAvatarPhrase; celebrate: boolean } | null = null;
      if (given) next = { phrase: given, celebrate: false };
      else {
        const peeked = queue.peek();
        if (!peeked) return;
        queue.advance();
        next = { phrase: peeked.phrase, celebrate: peeked.source === "loop" && peeked.completesLoop };
      }

      const { phrase, celebrate } = next;
      category = phrase.category ?? "short";
      latest.current.onSpeak?.(phrase);

      const display = expressiveAvatarDisplayDuration(phrase);
      /* A phrase may ask for a look to hold while it is said, and for as long as it is up. */
      const held = phrase.expression ?? null;
      if (held) controller.express(held, phrase.text.length * 35 + display + 300);

      /* The beat before the next phrase, and the celebration, happen once this one is gone. */
      afterHide = () => {
        nextAllowedAt = performance.now() + 100;
        if (held) controller.express(latest.current.expression);
        if (celebrate) controller.celebrate();
      };
      speaker.say(phrase.text, { displayDuration: display });
    };

    const down = (event: PointerEvent) => controller.windowPointerDown({ x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    const move = (event: PointerEvent) => controller.windowPointerMove({ x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    const up = () => controller.windowPointerUp();
    const reset = () => controller.reset();
    const visibility = () => {
      if (document.hidden) controller.reset();
    };
    /* The same trigger as `apiRef`, for anything that has no reference to the component (a script, an
       element somewhere else, another framework): an event on the avatar. */
    const express = (event: Event) => {
      const detail = (event as CustomEvent<{ expression?: string | null; duration?: number }>).detail ?? {};
      controller.express(detail.expression ?? null, detail.duration);
    };
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener(expressiveAvatarEvents.express, express);

    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener(expressiveAvatarEvents.express, express);
      stopVoice();
      speaker.destroy();
      controller.destroy();
      controllerRef.current = null;
      speakerRef.current = null;
      setFace(null);
      setSpeech(null);
    };
  }, [enabled]);

  const pointer = (event: ReactPointerEvent) => ({ x: event.clientX, y: event.clientY, pointerType: event.pointerType });

  return {
    rootRef,
    face,
    speech,
    handlers: {
      onClick: () => speakRef.current(),
      onFocus: () => controllerRef.current?.focus(),
      onBlur: () => controllerRef.current?.reset(),
      onPointerEnter: (event: ReactPointerEvent) => controllerRef.current?.pointerEnter(pointer(event)),
      onPointerMove: (event: ReactPointerEvent) => controllerRef.current?.pointerMove(pointer(event)),
      onPointerLeave: () => controllerRef.current?.pointerLeave(),
    },
  };
}

function resolveImageSource(
  input: string | ExpressiveAvatarImageSource | undefined,
): ExpressiveAvatarImageSource | undefined {
  return typeof input === "string" ? { src: input } : input;
}

export function ExpressiveAvatar({
  apiRef,
  appearance = "plain",
  className,
  crossOrigin,
  decoding = "async",
  expression = "base",
  fetchPriority,
  images,
  interactive = false,
  loading = "lazy",
  name,
  onSpeak,
  phrases,
  referrerPolicy,
  size = "md",
  src,
  voices,
  ...props
}: ExpressiveAvatarProps) {
  const alive = interactive;
  /* `base` asks for nothing. */
  const requested = expression === "base" ? null : expression;
  const behavior = useExpressiveAvatarBehavior({ enabled: alive, phrases, voices, onSpeak, expression: requested, apiRef });
  const sources: Readonly<Record<string, string | ExpressiveAvatarImageSource>> = { ...(src ? { base: src } : {}), ...images };

  /* The look on show: the one asked for if it has an image, else what the face is doing, else `base`. */
  const own = behavior.face ?? restFace;
  const asked = alive ? (own.expression ?? requested) : requested;
  const shown = asked && sources[asked] ? asked : alive && sources[own.look] ? own.look : "base";

  const imageProps = {
    alt: "",
    "aria-hidden": true,
    className: expressiveAvatarParts.image,
    crossOrigin,
    decoding,
    fetchPriority,
    referrerPolicy,
  } as const;
  const rootProps = {
    ...props,
    "aria-label": name,
    className: cx(expressiveAvatarParts.root, className),
    "data-appearance": appearance,
    "data-expression": shown,
    "data-size": size,
  } as const;

  if (!alive) {
    const source = resolveImageSource(sources[shown]);
    return (
      <span {...rootProps} role="img">
        {source?.src ? <img {...source} {...imageProps} loading={loading} /> : null}
      </span>
    );
  }

  /* The words, beside the face and not inside it: the face is clipped to its circle. The typed text is
     decoration; a hidden copy of the whole phrase is what a screen reader gets, announced once. */
  const face = (
    <button
      {...(rootProps as HTMLAttributes<HTMLButtonElement>)}
      {...behavior.handlers}
      ref={behavior.rootRef}
      type="button"
      data-interactive=""
    >
      {Object.keys(sources).map((key) => {
        const source = resolveImageSource(sources[key]);
        return source?.src ? (
          <img
            {...source}
            {...imageProps}
            data-active={key === shown ? "true" : "false"}
            data-state={key}
            /* Eager on purpose: a look that has not loaded when it is needed is a blank frame. */
            loading="eager"
            key={key}
          />
        ) : null;
      })}
    </button>
  );
  return !phrases ? (
    face
  ) : (
    <SpeechHost face={face} speech={behavior.speech} />
  );
}

function SpeechHost({ face, speech }: { face: ReactElement; speech: { text: string; phase: ExpressiveAvatarSpeechPhase } | null }) {
  return (
    <span className={expressiveAvatarParts.host} data-speaking={speech ? "" : undefined}>
      {face}
      <span className={expressiveAvatarParts.bubble} data-phase={speech?.phase ?? "hidden"} aria-hidden="true">
        {speech?.text}
      </span>
      <span className="sk-visually-hidden" role="status">
        {speech && speech.phase !== "typing" ? speech.text : ""}
      </span>
    </span>
  );
}

/* The face at rest, for a render before the controller has said anything. */
const restFace: ExpressiveAvatarFace = { look: "base", expression: null };
