# questionnaire

Category: forms. Stylesheet: `@skryensya/core/components/questionnaire.css`. Signatures: `Questionnaire`, `QuestionnaireItem`.

## Questionnaire

**Use when**

- several questions are answered one at a time, with visible progress and validation before moving on
- a survey, an onboarding or an intake where each question deserves the whole screen

**Avoid when**

- all the questions fit and read together; that is a form of FormFields
- the stages are screens with content of their own, not questions; that is Steps over your own navigation
- you only need to show progress (a bar or stages) without asking anything; that is Progress or Steps

Alternatives: `FormField`, `Steps`, `Progress`.

- React: `import { Questionnaire } from "@skryensya/react/questionnaire"`.
- HTML: a `<form>` with `data-sk-questionnaire`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `progress` | "text" \| "bar" \| "steps" \| "segments" | `"text"` |
| `progressOrientation` | "horizontal" \| "vertical" | `"horizontal"` |
| `shortcuts` | "none" \| "letters" \| "numbers" | `"none"` |
| `defaultItem` | string |  |
| `previousLabel` | string | `"Previous"` |
| `nextLabel` | string | `"Next"` |
| `skipLabel` | string | `"Skip"` |
| `submitLabel` | string | `"Submit"` |
| `positionLabel` | string | `"Question {current} of {total}"` |
| `progressLabel` | string | `"Questionnaire progress"` |
| `errorLabel` | string | `"Choose an answer to continue."` |
| `skippableErrorLabel` | string | `"Choose an answer or skip this question."` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `QuestionnaireItem` | yes |

**Example** (canonical tree `questionnaire/survey`; its copy is placeholder, replace it)

```tsx
import {
  Questionnaire,
  QuestionnaireItem,
} from "@skryensya/react/questionnaire";
import { choices } from "./questionnaire-choices";

export function QuestionnaireExample() {
  return (
    <Questionnaire
      progress="bar"
      shortcuts="letters"
      aria-label="Encuesta de satisfacción"
    >
      <QuestionnaireItem
        name="frecuencia"
        required
        stepLabel="Frecuencia"
        title="¿Con qué frecuencia usas el kit?"
        description="Elige la opción que más se acerque a tu semana habitual."
        choices={choices}
      />
      <QuestionnaireItem
        name="comentario"
        text
        textLabel="Tu comentario"
        textPlaceholder="Lo que quieras contarnos"
        stepLabel="Comentario"
        title="¿Qué le falta al kit?"
      />
    </Questionnaire>
  );
}
```

`questionnaire-choices.ts`:

```ts
export const choices = [
  { value: "diario", label: "A diario" },
  {
    value: "semanal",
    label: "Algunas veces por semana",
    description: "Dos o tres días.",
  },
  { value: "nunca", label: "Todavía no" },
];
```

```html
<form
  class="sk-questionnaire"
  data-sk-questionnaire
  data-progress="bar"
  data-progress-orientation="horizontal"
  data-shortcuts="letters"
  data-position-label="Question {current} of {total}"
  data-progress-label="Questionnaire progress"
  data-error-label="Choose an answer to continue."
  data-skippable-error-label="Choose an answer or skip this question."
  novalidate
  aria-label="Encuesta de satisfacción"
>
  <div
    class="sk-questionnaire__progress"
    data-sk-questionnaire-progress
    hidden
  ></div>
  <fieldset
    class="sk-questionnaire__item"
    data-sk-questionnaire-item
    data-required
    data-step-label="Frecuencia"
    aria-describedby="sk-form-field-description"
  >
    <legend class="sk-questionnaire__title">
      ¿Con qué frecuencia usas el kit?
    </legend>
    <p
      class="sk-questionnaire__description"
      id="sk-form-field-description"
    >
      Elige la opción que más se acerque a tu semana
      habitual.
    </p>
    <div class="sk-questionnaire__answers" data-name="frecuencia">
      <div
        class="sk-questionnaire__choices"
        data-sk-tile-radio-group
        data-name="frecuencia"
        data-scope="tile"
      >
        <label
          class="sk-tile sk-tile--interactive sk-interactive"
          data-scope="tile"
          data-part="item"
          data-appearance="plain"
          data-padding="md"
        >
          <input value="diario" type="radio" data-part="input">
          <span class="sk-tile__content" data-part="content">
            <span class="sk-tile__title">A diario</span>
          </span>
          <kbd
            class="sk-questionnaire__shortcut sk-kbd"
            aria-hidden="true"
            data-appearance="plain"
            data-tone="neutral"
          ></kbd>
          <span
            class="sk-tile__selection-indicator"
            aria-hidden="true"
            data-part="indicator"
          ></span>
        </label>
        <label
          class="sk-tile sk-tile--interactive sk-interactive"
          data-scope="tile"
          data-part="item"
          data-appearance="plain"
          data-padding="md"
        >
          <input value="semanal" type="radio" data-part="input">
          <span class="sk-tile__content" data-part="content">
            <span class="sk-tile__title">Algunas veces por semana</span>
            <span class="sk-tile__description">Dos o tres días.</span>
          </span>
          <kbd
            class="sk-questionnaire__shortcut sk-kbd"
            aria-hidden="true"
            data-appearance="plain"
            data-tone="neutral"
          ></kbd>
          <span
            class="sk-tile__selection-indicator"
            aria-hidden="true"
            data-part="indicator"
          ></span>
        </label>
        <label
          class="sk-tile sk-tile--interactive sk-interactive"
          data-scope="tile"
          data-part="item"
          data-appearance="plain"
          data-padding="md"
        >
          <input value="nunca" type="radio" data-part="input">
          <span class="sk-tile__content" data-part="content">
            <span class="sk-tile__title">Todavía no</span>
          </span>
          <kbd
            class="sk-questionnaire__shortcut sk-kbd"
            aria-hidden="true"
            data-appearance="plain"
            data-tone="neutral"
          ></kbd>
          <span
            class="sk-tile__selection-indicator"
            aria-hidden="true"
            data-part="indicator"
          ></span>
        </label>
      </div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <fieldset
    class="sk-questionnaire__item"
    data-sk-questionnaire-item
    data-text
    data-step-label="Comentario"
  >
    <legend class="sk-questionnaire__title">¿Qué le falta al kit?</legend>
    <div class="sk-questionnaire__answers" data-name="comentario">
      <div class="sk-questionnaire__text sk-form-field">
        <label class="sk-form-field__label" for="sk-form-field-2-text">
          Tu comentario
        </label>
        <textarea
          class="sk-input"
          name="comentario"
          placeholder="Lo que quieras contarnos"
          data-size="sm"
          rows="3"
          id="sk-form-field-2-text"
        ></textarea>
      </div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <div class="sk-questionnaire__actions">
    <button
      class="sk-questionnaire__previous sk-button sk-interactive"
      data-sk-questionnaire-previous
      type="button"
      hidden
      data-appearance="plain"
      data-size="sm"
      data-tone="neutral"
      data-variant="soft"
    >
      Previous
    </button>
    <button
      class="sk-questionnaire__skip sk-button sk-interactive"
      data-sk-questionnaire-skip
      type="button"
      hidden
      data-appearance="plain"
      data-size="sm"
      data-tone="neutral"
      data-variant="ghost"
    >
      Skip
    </button>
    <button
      class="sk-questionnaire__next sk-button sk-interactive"
      data-sk-questionnaire-next
      type="button"
      hidden
      data-appearance="plain"
      data-size="sm"
      data-tone="neutral"
      data-variant="solid"
    >
      Next
    </button>
    <button
      class="sk-questionnaire__submit sk-button sk-interactive"
      data-sk-questionnaire-submit
      type="submit"
      data-appearance="plain"
      data-size="sm"
      data-tone="neutral"
      data-variant="solid"
    >
      Submit
    </button>
  </div>
</form>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/checkbox.css`, `@skryensya/core/components/form-field.css`, `@skryensya/core/components/input.css`, `@skryensya/core/components/kbd.css`, `@skryensya/core/components/progress.css`, `@skryensya/core/components/questionnaire.css`, `@skryensya/core/components/radio-group.css`, `@skryensya/core/components/steps.css`, `@skryensya/core/components/tile.css`, `@skryensya/core/patterns/box.css`, `@skryensya/core/patterns/layout.css`.

## QuestionnaireItem

**Use when**

- a single-choice, multiple-choice or free-text question inside a Questionnaire
- a question with options and, besides, the chance to write another answer

**Avoid when**

- the choice is not part of a sequence of questions; that is a standalone TileRadioGroup or TileCheckbox

Alternatives: `TileRadioGroup`, `TileCheckbox`, `FormField`.

- React: `import { QuestionnaireItem } from "@skryensya/react/questionnaire"`.
- HTML: a `<fieldset>` with `data-sk-questionnaire-item`, enhanced by Vanilla's mount.

- Goes inside: `Questionnaire`.
- Requires the options: `name`.
- At least one of: `choices`, `text`, `control`.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `required` | boolean | `false` |
| `multiple` | boolean | `false` |
| `disabled` | boolean | `false` |
| `text` | boolean | `false` |
| `textLabel` | string |  |
| `textPlaceholder` | string |  |
| `textType` | "text" \| "email" \| "tel" \| "url" \| "number" \| "date" | `"text"` |
| `textLines` | number |  |
| `textMin` | number |  |
| `textMax` | number |  |
| `textStep` | number |  |
| `stepLabel` | string |  |
| `likert` | boolean | `false` |
| `likertMinLabel` | string |  |
| `likertMaxLabel` | string |  |
| `showWhenItem` | string |  |
| `showWhenAny` | string |  |
| `showWhenAll` | string |  |
| `showWhenNone` | string |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `choices` | a list of items (below) |  |
| `control` | node |  |
| `description` | text |  |
| `section` | text |  |
| `sectionDescription` | text |  |
| `title` | text | yes |

Each item in `choices`, keyed by `value`: `disabled` (boolean), `value` (string), `description` (text), `label` (text, required).

**Accessible name**

- A scale renders its points as bare numbers, so nothing on the page or in the accessibility tree says what 1 and 5 mean. Naming the ends is what turns a row of radios into a question with a direction; the anchors are read as part of the group, not as decoration. Give one of: `likertMinLabel`, `likertMaxLabel`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:questionnaireitemchange` |  | { item: string } |
| `sk:questionnairesubmit` |  | { values: Record<string, string \| string[]> } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-questionnaire-gap`, `--sk-questionnaire-head-gap`, `--sk-questionnaire-item-gap`, `--sk-questionnaire-measure`, `--sk-questionnaire-rail`, `--sk-questionnaire-padding-block`, `--sk-questionnaire-shortcut-fg`, `--sk-questionnaire-shortcut-gap`, `--sk-questionnaire-shortcut-gutter`, `--sk-checkbox-group-gap`, `--sk-checkbox-group-indent`, `--sk-progress-color`, `--sk-progress-fill`, `--sk-steps-connector-size`, `--sk-steps-item-padding`, `--sk-steps-marker-size`, `--sk-steps-segment-size`.
