import {
  createQuestionnaireStore,
  formatQuestionnaireLabel,
  isQuestionnaireItemInvalid,
  isQuestionnaireItemVisible,
  parseQuestionnaireShowWhen,
  questionnaireAnswer,
  questionnaireAnswerStep,
  questionnaireAttrs,
  questionnaireContract,
  questionnaireControlValues,
  type QuestionnaireTextType,
  type QuestionnaireProgressOrientation,
  questionnaireDefaultLabels,
  questionnaireEvents,
  questionnaireNavigation,
  questionnaireParts,
  questionnaireProgress,
  questionnaireStepsWindow,
  questionnaireShortcuts,
  questionnaireValues,
  resolveQuestionnaireKey,
  type QuestionnaireAnswer,
  type QuestionnaireEffect,
  type QuestionnaireEvent,
  type QuestionnaireItemDefinition,
  type QuestionnaireKeyTarget,
  type QuestionnaireProgressMode,
  type QuestionnaireShortcutMode,
  type QuestionnaireState,
  type QuestionnaireStore,
} from "@skryensya/core/questionnaire";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type FormHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Box } from "./layout.js";
import { RadioGroup } from "./selection.js";
import { Button } from "./button.js";
import { FormField } from "./form-field.js";
import { Input, Textarea } from "./input.js";
import { kbdParts } from "@skryensya/core/kbd";
import { Kbd } from "./kbd.js";
import { Progress } from "./progress.js";
import { Steps } from "./steps.js";
import { TileCheckbox, TileRadioGroup } from "./tile.js";

/*
 * QUESTIONNAIRE (React). The state is `@skryensya/core/questionnaire`'s store, read through
 * `useSyncExternalStore`; every control below is CONTROLLED by it and reports back as an event. Nothing
 * here reads an answer out of the DOM. The DOM is touched for exactly two things the state cannot do:
 * moving focus, and `requestSubmit()` on the form, both carried out as the effects a transition returns.
 */

const {
  progress: progressOption,
  progressOrientation: progressOrientationOption,
  shortcuts: shortcutsOption,
} = questionnaireContract.options;

const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ") || undefined;

export type QuestionnaireChoice = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type QuestionnaireItemProps = {
  name: string;
  title: string;
  /**
   * The section this question belongs to, read fresh on every question rather than deduplicated
   * against the one before it: the questionnaire shows one question at a time, so there is no
   * sibling it would ever repeat BESIDE, only a step's own "Shipping details" surviving a Next the
   * same way a wizard's own step title does. Two consecutive questions sharing a string is the
   * author saying so twice, not this component noticing a group.
   */
  section?: ReactNode;
  /** Shown under `section`, once, on every question that names it. */
  sectionDescription?: ReactNode;
  description?: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  choices?: readonly QuestionnaireChoice[];
  /** Free text, alone or beside the choices. Needs `textLabel`. */
  text?: boolean;
  /**
   * A control this component does not know: a FileUpload, a Select for a list too long to be tiles,
   * a NumberField. It owns its own state; the questionnaire learns the answer from its native form
   * state and keeps progress, required and branching.
   */
  control?: ReactNode;
  textLabel?: string;
  textPlaceholder?: string;
  /**
   * The kind of typed answer. Written onto the control as its `type`, so each value brings the
   * browser's own keyboard, control and validation: `email` and `url` are checked before submit,
   * `tel` brings the phone keypad, `number` brings steppers, `date` brings the platform's own picker.
   */
  textType?: QuestionnaireTextType;
  /**
   * Makes the answer a textarea, this many rows tall. Two rows asks for a sentence, eight a story.
   *
   * Left out, the question decides: when free text is its ONLY input (no choices, no slotted control) and
   * no `textType` is given, the answer is a textarea of {@link SOLE_TEXT_LINES} rows, because a step that asks
   * one open question is asking for more than a single line. Writing `textType="text"` keeps one line there.
   * Typed answers (`email`, `number`, `date`...) are never turned into a textarea, and neither is text that
   * sits beside choices ("pick one, or write your own"). The contract's template makes the same choice.
   */
  textLines?: number;
  /** Bounds for `textType="number"`, straight through to the control. */
  textMin?: number;
  textMax?: number;
  textStep?: number;
  /** Short name for this question in Steps progress. Defaults to `title`. */
  stepLabel?: string;
  /** Lays the single choice out as a Likert scale: the same radios, across instead of down. */
  likert?: boolean;
  likertMinLabel?: string;
  likertMaxLabel?: string;
  /** Branching: gate question (`showWhenItem`) plus one of the comma-list attrs below. */
  showWhenItem?: string;
  showWhenAny?: string;
  showWhenAll?: string;
  showWhenNone?: string;
  className?: string;
};

/* `string`, not `typeof questionnaireDefaultLabels`: that would type each label as its own English
 * literal ("Previous", "Next"...), so a locale's own `previousLabel="Anterior"` would not compile. */
type Labels = { [K in keyof typeof questionnaireDefaultLabels]: string };

export type QuestionnaireProps = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> &
  Partial<Labels> & {
    children: ReactNode;
    progress?: QuestionnaireProgressMode;
    /** Where the rail goes: above the question, or beside it. Only `steps` and `segments` have one. */
    progressOrientation?: QuestionnaireProgressOrientation;
    shortcuts?: QuestionnaireShortcutMode;
    /** The question to start on. */
    defaultItem?: string;
    /** Controls the active question: the questionnaire moves there whenever this changes. */
    item?: string;
    onItemChange?: (details: { item: string }) => void;
    defaultAnswers?: Readonly<Record<string, Partial<QuestionnaireAnswer>>>;
    /** Every question valid: the answers, as the questionnaire holds them. Called before `onSubmit`. */
    onValuesSubmit?: (details: { values: Readonly<Record<string, string | readonly string[]>> }) => void;
    /**
     * Every answer so far, valid or not, called after every change: the one hook a draft that
     * saves itself needs. Before this, the only answers a consumer could read were the ones
     * `onValuesSubmit` hands over at a valid submit, so a draft had to listen to the `<form>`'s own
     * `change`/`input` and re-read `new FormData(form)` by field name - which works only because
     * every control happens to carry `name`, and leaves the true state in two places (the machine
     * and the DOM) instead of one.
     */
    onValuesChange?: (details: { values: Readonly<Record<string, string | readonly string[]>> }) => void;
  };

type QuestionnaireContextValue = {
  state: QuestionnaireState;
  send: (event: QuestionnaireEvent) => void;
  labels: Labels;
  shortcuts: QuestionnaireShortcutMode;
  positionId: string;
  register: (name: string, element: HTMLFieldSetElement | null) => void;
  /**
   * How a `QuestionnaireItem` reaches the store from behind any number of wrapper components -
   * a wizard step's own `<SurveyQuestion>`, say - that `definitionsOf`'s one-level walk of
   * `Questionnaire`'s own `children` cannot see through (React does not render a component to
   * find out what it holds; that is the one thing a wrapper is FOR). Direct children register
   * too, redundantly with `definitionsOf`'s own read of them: the merge below dedupes by name, so
   * registering is harmless there and the only path that matters once something is in between.
   * Returns the unregister, run on unmount or whenever the definition is about to be replaced.
   */
  registerDefinition: (definition: QuestionnaireItemDefinition, title: string, stepLabel?: string) => () => void;
};

type FormSubmitEvent = Parameters<NonNullable<FormHTMLAttributes<HTMLFormElement>["onSubmit"]>>[0];

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

function useQuestionnaire(component: string): QuestionnaireContextValue {
  const context = useContext(QuestionnaireContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Questionnaire>.`);
  return context;
}

/** The definitions, from the items' own props: the children ARE the list, so there is no second one. */
function definitionsOf(children: ReactNode): { definitions: QuestionnaireItemDefinition[]; items: QuestionnaireItemProps[] } {
  const items = Children.toArray(children)
    .filter((child): child is ReactElement<QuestionnaireItemProps> => isValidElement(child) && child.type === QuestionnaireItem)
    .map((child) => child.props);
  const definitions = items.map((item) => ({
    name: item.name,
    required: item.required,
    disabled: item.disabled,
    multiple: item.multiple,
    likert: item.likert,
    text: item.text,
    choices: item.choices?.map((choice) => ({ value: choice.value, disabled: choice.disabled })),
    showWhen: parseQuestionnaireShowWhen(
      item.showWhenItem,
      item.showWhenAny,
      item.showWhenAll,
      item.showWhenNone,
    ),
  }));
  return { definitions, items };
}

const TEXT_TYPES = new Set(["text", "email", "search", "tel", "url", "password", "number", "date", "time", "datetime-local", "month", "week"]);

function isTextEntry(element: Element): boolean {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLInputElement) return TEXT_TYPES.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

/** The answer controls of one question, in reading order. Focus lives in the DOM; answers do not. */
function answerControls(fieldset: HTMLFieldSetElement | undefined): HTMLInputElement[] {
  if (!fieldset) return [];
  return Array.from(fieldset.querySelectorAll<HTMLInputElement>("input")).filter(
    (input) => !input.disabled && (input.type === "radio" || input.type === "checkbox" || TEXT_TYPES.has(input.type)),
  );
}

export function Questionnaire({
  children,
  className,
  defaultAnswers,
  defaultItem,
  item,
  onItemChange,
  onKeyDown,
  onReset,
  onSubmit,
  onValuesChange,
  onValuesSubmit,
  progress = progressOption.default,
  progressOrientation = progressOrientationOption.default,
  shortcuts = shortcutsOption.default,
  previousLabel = questionnaireDefaultLabels.previousLabel,
  nextLabel = questionnaireDefaultLabels.nextLabel,
  skipLabel = questionnaireDefaultLabels.skipLabel,
  submitLabel = questionnaireDefaultLabels.submitLabel,
  positionLabel = questionnaireDefaultLabels.positionLabel,
  progressLabel = questionnaireDefaultLabels.progressLabel,
  errorLabel = questionnaireDefaultLabels.errorLabel,
  skippableErrorLabel = questionnaireDefaultLabels.skippableErrorLabel,
  ...props
}: QuestionnaireProps) {
  const { definitions, items } = definitionsOf(children);
  const definitionsKey = JSON.stringify(definitions);

  const [store] = useState<QuestionnaireStore>(() =>
    createQuestionnaireStore({ items: definitions, defaultItem: item ?? defaultItem, defaultAnswers }),
  );
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  /*
   * EVERY `QuestionnaireItem` NOT ALREADY FOUND by `definitionsOf`'s shallow walk - one nested
   * inside a wrapper component the walk cannot see through. Order among the shallow items is
   * `definitionsOf`'s own (DOM order, exactly as authored); order WITHIN this registry is each
   * item's own effect firing, which React runs in that same document order for a single commit,
   * so a run of wrapped items keeps the order they were written in relative to EACH OTHER.
   * shortcut: a wrapped item interleaved between two direct ones lands after every direct item
   * instead of between them. Upgrade by dropping `definitionsOf`'s walk and making every item's
   * own registration the ONLY source of the list, direct or not; this stays additive to it
   * instead, so the already-tested direct-children path (every consumer there is today) takes
   * none of that risk.
   */
  const registryRef = useRef(new Map<string, { definition: QuestionnaireItemDefinition; title: string; stepLabel?: string }>());
  const [registryVersion, setRegistryVersion] = useState(0);
  const registerDefinition = useCallback(
    (definition: QuestionnaireItemDefinition, title: string, stepLabel?: string) => {
      registryRef.current.set(definition.name, { definition, title, stepLabel });
      setRegistryVersion((count) => count + 1);
      return () => {
        registryRef.current.delete(definition.name);
        setRegistryVersion((count) => count + 1);
      };
    },
    [],
  );
  const registeredExtras = useMemo(
    () => [...registryRef.current.values()].filter((entry) => !definitions.some((def) => def.name === entry.definition.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [definitionsKey, registryVersion],
  );
  const mergedDefinitions = useMemo(
    () => [...definitions, ...registeredExtras.map((entry) => entry.definition)],
    [definitions, registeredExtras],
  );
  const mergedDefinitionsKey = JSON.stringify(mergedDefinitions);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fieldsets = useRef(new Map<string, HTMLFieldSetElement>());
  const pending = useRef<QuestionnaireEffect[]>([]);
  const [, setFlush] = useState(0);
  const positionId = useId();
  const onItemChangeRef = useRef(onItemChange);
  onItemChangeRef.current = onItemChange;

  // Every change, valid or not: `answers` is a new object per dispatch (the store is immutable),
  // so this depends on it directly rather than on the whole `state`, which also changes shape for
  // reasons (the active question, a skip) a draft that only cares about VALUES has no reason to
  // re-run for.
  useEffect(() => {
    onValuesChange?.({ values: questionnaireValues(state) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.answers]);

  const send = useCallback(
    (event: QuestionnaireEvent) => {
      const effects = store.dispatch(event);
      if (effects.length === 0) return;
      pending.current.push(...effects);
      // A commit to run them after: focus has to land on what this render reveals, not what it hides.
      setFlush((count) => count + 1);
    },
    [store],
  );

  const register = useCallback((name: string, element: HTMLFieldSetElement | null) => {
    if (element) fieldsets.current.set(name, element);
    else fieldsets.current.delete(name);
  }, []);

  // The children changed shape: a question added, removed or redefined - directly, or (the merged
  // half) through a wrapper registering/unregistering/updating one behind `registerDefinition`.
  // Compared by value, so a re-render with the same questions sends nothing.
  useLayoutEffect(() => {
    if (JSON.stringify(store.getState().items) !== mergedDefinitionsKey) {
      send({ type: "items", items: JSON.parse(mergedDefinitionsKey) as QuestionnaireItemDefinition[] });
    }
  }, [mergedDefinitionsKey, send, store]);

  useEffect(() => {
    if (item !== undefined && item !== store.getState().active) send({ type: "goTo", name: item });
  }, [item, send, store]);

  useLayoutEffect(() => {
    const effects = pending.current.splice(0);
    for (const effect of effects) {
      if (effect.type === "item-change") {
        onItemChangeRef.current?.({ item: effect.name });
        formRef.current?.dispatchEvent(
          new CustomEvent(questionnaireEvents.itemChange, { bubbles: true, detail: { item: effect.name } }),
        );
      } else if (effect.type === "focus-item") {
        fieldsets.current.get(effect.name)?.focus();
      } else if (effect.type === "focus-invalid") {
        const controls = answerControls(fieldsets.current.get(effect.name));
        (controls[0] ?? fieldsets.current.get(effect.name))?.focus();
      } else if (effect.type === "request-submit") {
        formRef.current?.requestSubmit();
      }
    }
  });

  const handleSubmit = (event: FormSubmitEvent) => {
    const effects = store.dispatch({ type: "submit" });
    const submitted = effects.find((effect) => effect.type === "submitted");
    if (!submitted) {
      event.preventDefault();
      pending.current.push(...effects);
      setFlush((count) => count + 1);
      return;
    }
    event.currentTarget.dispatchEvent(
      new CustomEvent(questionnaireEvents.submit, { bubbles: true, detail: { values: submitted.values } }),
    );
    onValuesSubmit?.({ values: submitted.values });
    onSubmit?.(event);
  };

  const handleReset = (event: FormEvent<HTMLFormElement>) => {
    onReset?.(event);
    if (!event.defaultPrevented) send({ type: "reset" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const current = store.getState();
    const target = keyTarget(event.target, current, fieldsets.current);
    const action = resolveQuestionnaireKey(
      {
        key: event.key,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        repeat: event.repeat,
        composing: event.nativeEvent.isComposing || event.keyCode === 229,
      },
      target,
      current,
      shortcuts,
    );
    if (!action) return;

    if (action.type === "move-answer") {
      const controls = answerControls(current.active ? fieldsets.current.get(current.active) : undefined);
      const index = controls.indexOf(event.target as HTMLInputElement);
      const next = questionnaireAnswerStep(index, controls.length, action.direction);
      if (next === null) return;
      const destination = controls[next]!;
      // Radio to radio is the browser's (and the radio group's) own move.
      if (target.kind === "choice" && target.radio && destination.type === "radio") return;
      event.preventDefault();
      destination.focus();
      if (destination.type === "radio" && current.active) {
        send({ type: "choose", name: current.active, value: destination.value });
      }
      return;
    }

    event.preventDefault();
    if (action.type === "dispatch") send(action.event);
    else if (action.type === "pick" && current.active) {
      const definition = current.items.find((entry) => entry.name === current.active);
      const selected = questionnaireAnswer(current, current.active).choices.includes(action.value);
      if (definition?.multiple) send({ type: "select", name: current.active, value: action.value, selected: !selected });
      else send({ type: "choose", name: current.active, value: action.value });
      answerControls(fieldsets.current.get(current.active))
        .find((input) => (input.type === "radio" || input.type === "checkbox") && input.value === action.value)
        ?.focus();
    }
  };

  const navigation = questionnaireNavigation(state);
  const progressState = questionnaireProgress(state);
  /* Both rail modes need the same window; they differ only in how Steps draws a stage. */
  const stepsWindow = progress === "steps" || progress === "segments" ? questionnaireStepsWindow(state) : null;
  const labels: Labels = {
    previousLabel,
    nextLabel,
    skipLabel,
    submitLabel,
    positionLabel,
    progressLabel,
    errorLabel,
    skippableErrorLabel,
  };
  const labelsKey = JSON.stringify(labels);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const context = useMemo(
    () => ({ state, send, labels, shortcuts, positionId, register, registerDefinition }),
    [state, send, labelsKey, shortcuts, positionId, register, registerDefinition],
  );
  const titles = new Map(items.map((entry) => [entry.name, entry.stepLabel ?? entry.title]));
  for (const entry of registeredExtras) titles.set(entry.definition.name, entry.stepLabel ?? entry.title);

  /*
   * The mount point, so both bindings ship the same markup, plus the lifecycle marker that says it is
   * already mounted: React IS the questionnaire here, and the Vanilla enhancer's pending selector
   * (`:not([data-sk-ready])`) has to skip it rather than wire a second one over the same form. The
   * same guard `ExpandableTile` writes for its own enhancer.
   */
  const mountAttrs = { [questionnaireAttrs.root]: "", "data-sk-ready": "true" };

  return (
    <QuestionnaireContext.Provider value={context}>
      <form
        {...props}
        className={cx(questionnaireParts.root, className)}
        data-default-item={defaultItem}
        data-progress={progress}
        data-progress-orientation={progressOrientation}
        data-shortcuts={shortcuts}
        {...mountAttrs}
        noValidate
        onKeyDown={handleKeyDown}
        onReset={handleReset}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className={questionnaireParts.progress} {...{ [questionnaireAttrs.progress]: "" }}>
          <p className={questionnaireParts.position} id={positionId}>
            {formatQuestionnaireLabel(positionLabel, { current: progressState.current, total: progressState.total })}
          </p>
          {progress === "bar" ? (
            <Progress label={progressLabel} max={Math.max(progressState.total, 1)} value={progressState.settled} />
          ) : null}
          {stepsWindow ? (
            <Steps
              aria-label={progressLabel}
              appearance={progress === "segments" ? "segments" : "markers"}
              data-orientation={progress === "segments" ? "horizontal" : progressOrientation}
              data-window-after={stepsWindow.hasAfter ? "" : undefined}
              data-window-before={stepsWindow.hasBefore ? "" : undefined}
              steps={stepsWindow.steps.map((step) => ({
                label: titles.get(step.name) ?? step.name,
                marker: step.status === "complete" ? undefined : String(step.index + 1),
                status: step.status,
              }))}
            />
          ) : null}
        </div>
        {children}
        <div className={questionnaireParts.actions}>
          <Button
            className={questionnaireParts.previous}
            hidden={!navigation.canPrevious}
            size="sm"
            onClick={() => send({ type: "previous" })}
            variant="soft"
            {...{ [questionnaireAttrs.previous]: "" }}
          >
            {previousLabel}
          </Button>
          <Button
            className={questionnaireParts.skip}
            hidden={!navigation.canSkip}
            onClick={() => send({ type: "skip" })}
            size="sm"
            variant="ghost"
            {...{ [questionnaireAttrs.skip]: "" }}
          >
            {skipLabel}
          </Button>
          <Button
            className={questionnaireParts.next}
            hidden={!navigation.canNext}
            onClick={() => send({ type: "next" })}
            size="sm"
            {...{ [questionnaireAttrs.next]: "" }}
          >
            {nextLabel}
          </Button>
          <Button
            className={questionnaireParts.submit}
            hidden={!navigation.canSubmit}
            size="sm"
            type="submit"
            {...{ [questionnaireAttrs.submit]: "" }}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </QuestionnaireContext.Provider>
  );
}

/** Classifies a keydown target against the STATE: whether a choice is checked is the answer's, not the input's. */
function keyTarget(
  element: Element,
  state: QuestionnaireState,
  fieldsets: ReadonlyMap<string, HTMLFieldSetElement>,
): QuestionnaireKeyTarget {
  const active = state.active;
  const fieldset = active ? fieldsets.get(active) : undefined;
  const answer = active ? questionnaireAnswer(state, active) : undefined;
  const inside = !!fieldset && fieldset.contains(element);
  if (element instanceof HTMLInputElement && inside && answer) {
    if (element.type === "radio" || element.type === "checkbox") {
      return { kind: "choice", radio: element.type === "radio", checked: answer.choices.includes(element.value) };
    }
    if (TEXT_TYPES.has(element.type)) return { kind: "text", filled: answer.text.trim().length > 0 };
  }
  return isTextEntry(element) ? { kind: "field" } : { kind: "other" };
}

/*
 * The choice's content. Its shortcut key is the tile's `aside`, a sibling of the content and never
 * part of the answer's text, as the contract template places it.
 */
function ChoiceContent({ choice }: { choice: QuestionnaireChoice }) {
  return (
    <>
      <span className="sk-tile__title">{choice.label}</span>
      {choice.description ? <span className="sk-tile__description">{choice.description}</span> : null}
    </>
  );
}

/*
 * The shortcut key, when the questionnaire has them on. The key comes from
 * core's own `questionnaireShortcuts`, the SAME map the keyboard resolves against, so the letter on
 * screen is always the letter that works (a CSS counter here would be a second, drifting count, and
 * would number a tenth choice that `numbers` mode cannot reach). Empty when there is none, which is
 * what the stylesheet hides.
 */
function ChoiceShortcut({ shortcut }: { shortcut: string | null }) {
  /* Kbd logs an error for empty children; the empty keycap is the stylesheet's own hide hook, so it is spelled out here. */
  if (!shortcut) return <kbd aria-hidden="true" data-tone="neutral" className={`${kbdParts.root} ${questionnaireParts.shortcut}`} />;
  return (
    <Kbd aria-hidden="true" className={questionnaireParts.shortcut}>
      {shortcut ?? ""}
    </Kbd>
  );
}

/** Rows of the textarea a question gets when free text is its only input. */
export const SOLE_TEXT_LINES = 3;

export function QuestionnaireItem({
  choices,
  className,
  description,
  disabled = false,
  likert = false,
  likertMaxLabel,
  likertMinLabel,
  multiple = false,
  name,
  required = false,
  showWhenAll,
  showWhenAny,
  showWhenItem,
  showWhenNone,
  stepLabel,
  text = false,
  textLabel,
  control,
  textPlaceholder,
  textType,
  textLines,
  textMin,
  textMax,
  textStep,
  title,
  section,
  sectionDescription,
}: QuestionnaireItemProps) {
  const { state, send, labels, shortcuts, positionId, register, registerDefinition } = useQuestionnaire("QuestionnaireItem");
  const definition = useMemo(
    () => ({
      name,
      required,
      disabled,
      multiple,
      likert,
      text,
      choices: choices?.map((choice) => ({ value: choice.value, disabled: choice.disabled })),
      showWhen: parseQuestionnaireShowWhen(showWhenItem, showWhenAny, showWhenAll, showWhenNone),
    }),
    [choices, disabled, likert, multiple, name, required, showWhenAll, showWhenAny, showWhenItem, showWhenNone, text],
  );
  /*
   * Behind any number of wrapper components, this is the ONLY way `Questionnaire` learns this
   * item exists at all - its own shallow walk of `children` stops at whatever wraps it. Harmless
   * when nothing does: the merge there already dedupes by name against what the walk already
   * found directly.
   */
  useLayoutEffect(
    () => registerDefinition(definition, title, stepLabel),
    [definition, registerDefinition, stepLabel, title],
  );
  const visible = isQuestionnaireItemVisible(state, definition);
  const descriptionId = useId();
  const errorId = useId();
  const active = !disabled && state.active === name;
  const invalid = isQuestionnaireItemInvalid(state, name);
  const answer = questionnaireAnswer(state, name);
  /* The ONLY input is the free text: no choices, no slotted control, and plain text rather than a typed answer. */
  const soleText = text && !control && !choices?.length && textType === undefined;
  const lines = textLines ?? (soleText ? SOLE_TEXT_LINES : undefined);
  const fieldsetRef = useRef<HTMLFieldSetElement | null>(null);
  const ref = useCallback(
    (element: HTMLFieldSetElement | null) => {
      fieldsetRef.current = element;
      register(name, element);
    },
    [name, register],
  );

  const itemDefinition = state.items.find((entry) => entry.name === name) ?? definition;
  const shortcutByValue = useMemo(() => questionnaireShortcuts(itemDefinition, shortcuts), [itemDefinition, shortcuts]);

  /*
   * `aria-keyshortcuts` on each choice, announced by the same map the hint is drawn from. It is written
   * onto the DOM rather than passed as a prop because the input belongs to TileRadioGroup/TileCheckbox,
   * which take no per-choice input props: this is presentation the questionnaire owns about a control it
   * composes, never state read back out of the page.
   */
  useLayoutEffect(() => {
    const fieldset = fieldsetRef.current;
    if (!fieldset) return;
    for (const input of fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]')) {
      const shortcut = shortcutByValue.get(input.value);
      if (shortcut) input.setAttribute("aria-keyshortcuts", shortcut);
      else input.removeAttribute("aria-keyshortcuts");
    }
  }, [shortcutByValue, choices]);

  if (!visible) return null;

  return (
    <fieldset
      aria-describedby={cx(description && descriptionId, active && positionId, invalid && errorId)}
      aria-invalid={invalid ? "true" : undefined}
      className={cx(questionnaireParts.item, className)}
      data-active={active ? "" : undefined}
      data-multiple={multiple ? "" : undefined}
      data-required={required ? "" : undefined}
      data-step-label={stepLabel}
      data-likert={likert ? "" : undefined}
      data-likert-max={likertMaxLabel}
      data-likert-min={likertMinLabel}
      data-show-when-all={showWhenAll}
      data-show-when-any={showWhenAny}
      data-show-when-item={showWhenItem}
      data-show-when-none={showWhenNone}
      data-text={text ? "" : undefined}
      disabled={disabled}
      inert={!active}
      ref={ref}
      tabIndex={-1}
      {...{ [questionnaireAttrs.item]: "" }}
    >
      {section ? (
        <div className={questionnaireParts.section}>
          <p className={questionnaireParts.sectionTitle}>{section}</p>
          {sectionDescription ? <p className={questionnaireParts.sectionDescription}>{sectionDescription}</p> : null}
        </div>
      ) : null}
      <legend className={questionnaireParts.title}>{title}</legend>
      {description ? (
        <p className={questionnaireParts.description} id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className={questionnaireParts.answers} data-name={name}>
        {choices && likert ? (
          /*
           * A scale is native radios in a Box, not a stack of tiles: a tile is a surface you press,
           * and five of them across a page read as five cards rather than one scale.
           */
          <Box border="subtle" className={questionnaireParts.choices} data-likert="" padding="sm">
            <RadioGroup
              className={questionnaireParts.scale}
              items={choices.map((choice) => ({ value: choice.value, label: choice.label, disabled: choice.disabled }))}
              name={name}
              onValueChange={(details) => send({ type: "choose", name, value: details.value })}
              orientation="vertical"
              value={answer.choices[0] ?? null}
            />
            {likertMinLabel || likertMaxLabel ? (
              <div className={questionnaireParts.anchors}>
                {likertMinLabel ? <span className={questionnaireParts.anchor}>{likertMinLabel}</span> : null}
                {likertMaxLabel ? <span className={questionnaireParts.anchor}>{likertMaxLabel}</span> : null}
              </div>
            ) : null}
          </Box>
        ) : null}
        {choices && !multiple && !likert ? (
          <TileRadioGroup
            className={questionnaireParts.choices}
            data-name={name}
            padding="md"
            items={choices.map((choice) => ({
              value: choice.value,
              disabled: choice.disabled,
              children: <ChoiceContent choice={choice} />,
              aside: <ChoiceShortcut shortcut={shortcutByValue.get(choice.value) ?? null} />,
            }))}
            name={name}
            onValueChange={(details) => send({ type: "choose", name, value: details.value })}
            value={answer.choices[0] ?? null}
          />
        ) : null}
        {choices && multiple ? (
          <div className={questionnaireParts.choices}>
            {choices.map((choice) => (
              <TileCheckbox
                checked={answer.choices.includes(choice.value)}
                disabled={choice.disabled}
                padding="md"
                key={choice.value}
                name={name}
                onCheck={(details) => send({ type: "select", name, value: choice.value, selected: details.checked === true })}
                value={choice.value}
                aside={<ChoiceShortcut shortcut={shortcutByValue.get(choice.value) ?? null} />}
              >
                <ChoiceContent choice={choice} />
              </TileCheckbox>
            ))}
          </div>
        ) : null}
        {control ? (
          /*
           * THE SLOTTED CONTROL. React cannot control a child it did not render, and should not try:
           * the control owns its own state. What it can do is hear the `change` / `input` every
           * native form control fires - React's synthetic ones bubble, so one listener on the box
           * covers whatever is inside it - and read the slot's form state with the SAME reader the
           * Vanilla enhancer uses, out of Core, so the two cannot drift about what an answer is.
           */
          <div
            className={questionnaireParts.control}
            onChange={(event) =>
              send({ type: "control", name, values: questionnaireControlValues(event.currentTarget) })
            }
            onInput={(event) =>
              send({ type: "control", name, values: questionnaireControlValues(event.currentTarget) })
            }
          >
            {control}
          </div>
        ) : null}
        {text ? (
          <FormField className={questionnaireParts.text} label={textLabel ?? title}>
            {lines === undefined ? (
              <Input
                controlSize="sm"
                max={textMax}
                min={textMin}
                name={name}
                onChange={(event) => send({ type: "text", name, text: event.target.value })}
                placeholder={textPlaceholder}
                step={textStep}
                type={textType}
                value={answer.text}
              />
            ) : (
              <Textarea
                controlSize="sm"
                name={name}
                onChange={(event) => send({ type: "text", name, text: event.target.value })}
                placeholder={textPlaceholder}
                rows={lines}
                value={answer.text}
              />
            )}
          </FormField>
        ) : null}
      </div>
      <p
        className={questionnaireParts.error}
        id={errorId}
        role={invalid ? "alert" : undefined}
        {...{ [questionnaireAttrs.error]: "" }}
      >
        {invalid ? (required ? labels.errorLabel : labels.skippableErrorLabel) : ""}
      </p>
    </fieldset>
  );
}
