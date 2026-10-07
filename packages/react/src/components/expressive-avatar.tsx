import {
  expressiveAvatarEvents,
  expressiveAvatarParts,
  type ExpressiveAvatarAppearance,
  type ExpressiveAvatarDirection,
  type ExpressiveAvatarHat,
  type ExpressiveAvatarMode,
  type ExpressiveAvatarMouth,
  type ExpressiveAvatarOutfit,
  type ExpressiveAvatarSize,
  type ExpressiveAvatarTileset,
} from "@skryensya/core/expressive-avatar";
import { expressiveAvatarAtlasLayout } from "@skryensya/core/expressive-avatar-atlas";
import {
  createExpressiveAvatarController,
  createExpressiveAvatarPhraseQueue,
  createExpressiveAvatarSpeaker,
  expressiveAvatarDisplayDuration,
  expressiveAvatarExpressionFor,
  expressiveAvatarCells,
  type ExpressiveAvatarController,
  type ExpressiveAvatarExpressions,
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
  type CSSProperties,
  type ElementType,
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

/** A look by name: one of the built-ins, or any name you gave an expression or an image. */
export type ExpressiveAvatarExpression = ExpressiveAvatarMouth | ExpressiveAvatarDirection | "blink" | "wink" | (string & {});

export type ExpressiveAvatarVoices = Partial<Record<ExpressiveAvatarPhraseCategory, readonly string[]>>;

/** What a page can ask an expressive avatar to do, from anywhere: a button, a timer, a form that failed. */
export type ExpressiveAvatarApi = {
  /**
   * Shows an expression by name (a built-in, or one in `expressions`, or an image key) until `duration` ms
   * pass, or until it is asked for again or cleared. The face goes on looking, blinking and speaking in the
   * parts the expression does not name.
   */
  express: (name: string | null, options?: { duration?: number }) => void;
  /** Says something now, typed out with the mouth moving, instead of the next phrase in the queue. */
  speak: (phrase: string | ExpressiveAvatarPhrase) => void;
};

export type ExpressiveAvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /**
   * Makes it alive: the eyes follow the pointer, it blinks on its own, and a click makes it speak the next
   * of its `phrases`. The root becomes a button. The `direction`, `mouth`, `blink` and `wink` props are the
   * static face and are ignored while it is alive.
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

  /** Accessible identity name. */
  name: string;
  mode?: ExpressiveAvatarMode;
  size?: ExpressiveAvatarSize;
  appearance?: ExpressiveAvatarAppearance;
  /**
   * Pixel mode: your own tileset. ONE image, a grid of equal cells, and the names of what is in them, in
   * order (`names[i]` is at column `i % columns`, row `floor(i / columns)`). Omit it for the bundled tileset
   * (import `@skryensya/core/components/expressive-avatar-tileset.css` for its image).
   */
  tileset?: ExpressiveAvatarTileset;
  /**
   * Pixel mode: looks of your own. A name for tiles of your tileset, overriding only the parts it names
   * (`leftEye`, `rightEye`, `mouthLeft`, `mouthRight`). Show one with `expression` or `apiRef`.
   */
  expressions?: ExpressiveAvatarExpressions;
  direction?: ExpressiveAvatarDirection;
  mouth?: ExpressiveAvatarMouth;
  outfit?: ExpressiveAvatarOutfit;
  hat?: ExpressiveAvatarHat;
  wink?: boolean;
  blink?: boolean;
  /**
   * The look to show, by name. In pixel mode it is laid over the face (see `expressions`); in image mode it
   * picks an image. `base`, the default, asks for nothing.
   */
  expression?: ExpressiveAvatarExpression;
  /**
   * Image mode: one image per look, keyed by name: the built-ins (`base`, the eight gazes, `blink`, `wink`,
   * `a`, `e`, `i`, `o`, `u`, `closed`, `neutral`, `smile`) and any name of your own. `base` is the one it
   * falls back to. With `interactive` every image is loaded and stacked, so a change of look is a switch and
   * never a load.
   */
  images?: Readonly<Record<string, string | ExpressiveAvatarImageSource>>;
} & Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "crossOrigin" | "decoding" | "fetchPriority" | "loading" | "referrerPolicy"
>;

const bundledTileset: ExpressiveAvatarTileset = expressiveAvatarAtlasLayout;

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
  blink = false,
  className,
  crossOrigin,
  decoding = "async",
  direction = "base",
  expression = "base",
  expressions,
  fetchPriority,
  hat = "none",
  images,
  interactive = false,
  loading = "lazy",
  mode = images ? "image" : "pixel",
  mouth = "default",
  name,
  onSpeak,
  outfit = "base",
  phrases,
  referrerPolicy,
  size = "md",
  tileset = bundledTileset,
  voices,
  wink = false,
  ...props
}: ExpressiveAvatarProps) {
  const alive = interactive;
  /* `base` asks for nothing. */
  const requested = expression === "base" ? null : expression;
  const behavior = useExpressiveAvatarBehavior({ enabled: alive, phrases, voices, onSpeak, expression: requested, apiRef });
  const rootProps = {
    ...props,
    "aria-label": name,
    className: cx(expressiveAvatarParts.root, className),
    "data-appearance": appearance,
    "data-mode": mode,
    "data-size": size,
    role: alive ? undefined : "img",
  } as const;

  /* The words, beside the face and not inside it: the face is clipped to its circle. The typed text is
     decoration; a hidden copy of the whole phrase is what a screen reader gets, announced once. */
  const withSpeech = (face: ReactElement) =>
    !alive || !phrases ? (
      face
    ) : (
      <span className={expressiveAvatarParts.host} data-speaking={behavior.speech ? "" : undefined}>
        {face}
        <span className={expressiveAvatarParts.bubble} data-phase={behavior.speech?.phase ?? "hidden"} aria-hidden="true">
          {behavior.speech?.text}
        </span>
        <span className="sk-visually-hidden" role="status">
          {behavior.speech && behavior.speech.phase !== "typing" ? behavior.speech.text : ""}
        </span>
      </span>
    );

  if (mode === "image") {
    if (!alive) {
      const source = resolveImageSource(images?.[expression] ?? images?.base);
      return (
        <span {...rootProps} data-expression={expression}>
          {source?.src ? (
            <img
              {...source}
              alt=""
              aria-hidden="true"
              className={expressiveAvatarParts.image}
              crossOrigin={crossOrigin}
              decoding={decoding}
              fetchPriority={fetchPriority}
              loading={loading}
              referrerPolicy={referrerPolicy}
            />
          ) : null}
        </span>
      );
    }

    /* Alive: the controller decides the look; every image is mounted and one is shown. A look that was asked
       for by name wins; otherwise the one the face is in. */
    const own = behavior.face ?? restFace;
    const natural = expressiveAvatarExpressionFor(own);
    const asked = own.expression ?? requested;
    const shown = asked && images?.[asked] ? asked : images?.[natural] ? natural : "base";
    const keys = Object.keys(images ?? {});
    return withSpeech(
      <button
        {...(rootProps as HTMLAttributes<HTMLButtonElement>)}
        {...behavior.handlers}
        ref={behavior.rootRef}
        type="button"
        data-expression={shown}
        data-interactive=""
      >
        {keys.map((key) => {
          const source = resolveImageSource(images?.[key]);
          return source?.src ? (
            <img
              {...source}
              alt=""
              aria-hidden="true"
              className={expressiveAvatarParts.image}
              crossOrigin={crossOrigin}
              data-active={key === shown ? "true" : "false"}
              data-state={key}
              decoding={decoding}
              fetchPriority={fetchPriority}
              /* Eager on purpose: a look that has not loaded when it is needed is a blank frame. */
              loading="eager"
              referrerPolicy={referrerPolicy}
              key={key}
            />
          ) : null;
        })}
      </button>,
    );
  }

  /*
   * PIXEL MODE. The face is 36 cells of one image: each is a window onto the tileset, and a tile is shown by
   * where the image sits behind the window. Changing an eye is changing a position, so nothing is loaded or
   * remounted and there is no frame without an eye.
   */
  const columns = tileset.columns;
  const rows = Math.ceil(tileset.names.length / columns);

  const own: ExpressiveAvatarFace = behavior.face ?? {
    leftEye: blink ? "blink" : direction,
    rightEye: blink ? "blink" : wink ? "wink" : direction,
    mouth,
    expression: requested,
  };
  /* Every cell from core, the same call the vanilla enhancer makes, so the two draw one face. */
  const cells = expressiveAvatarCells(own, { outfit, hat, tileset, expressions });

  const rootStyle = {
    ...props.style,
    "--sk-expressive-avatar-columns": columns,
    "--sk-expressive-avatar-rows": rows,
    ...(tileset.src ? { "--sk-expressive-avatar-atlas": `url("${tileset.src}")` } : {}),
  } as CSSProperties;

  const Root: ElementType = alive ? "button" : "span";
  const face = (
    <Root
      {...rootProps}
      {...(alive ? { ...behavior.handlers, ref: behavior.rootRef, type: "button" } : {})}
      style={rootStyle}
      data-direction={own.leftEye}
      data-hat={hat}
      data-mouth={own.mouth}
      data-outfit={outfit}
      data-expression={own.expression ?? undefined}
      data-interactive={alive ? "" : undefined}
    >
      <span className={expressiveAvatarParts.grid} aria-hidden="true">
        {cells.map((cell, index) => (
          <span
            className={expressiveAvatarParts.tile}
            style={
              {
                "--sk-expressive-avatar-column": cell.column,
                "--sk-expressive-avatar-row": cell.row,
                "--sk-expressive-avatar-hat-column": cell.hatColumn,
                "--sk-expressive-avatar-hat-row": cell.hatRow,
              } as CSSProperties
            }
            key={index}
          />
        ))}
      </span>
    </Root>
  );

  return withSpeech(face);
}

/* The face at rest, for a render before the controller has said anything. */
const restFace: ExpressiveAvatarFace = { leftEye: "base", rightEye: "base", mouth: "default", expression: null };
