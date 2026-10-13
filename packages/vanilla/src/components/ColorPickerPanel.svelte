<script lang="ts">
  import { colorPickerPanelParts } from "@skryensya/core/color-picker";
  import { colorPicker } from "@skryensya/core/machines";
  import { buttonParts } from "@skryensya/core/button";
  import type { PropTypes } from "@zag-js/svelte";

  type ColorPickerApi = ReturnType<typeof colorPicker.connect<PropTypes>>;
  /*
   * THE PANEL BODY: area, hue/alpha rails, hex field, presets, eyedropper. Entirely
   * derived from `api`  -  nothing here is authored markup  -  same role `CalendarView` plays inside
   * DatePicker. `anatomy` gates which rows draw: "compact" stops after the area, hue rail and
   * presets; "full" adds the alpha rail, the hex field and the eyedropper.
   */
  const { api, anatomy, swatches = [] }: { api: ColorPickerApi; anatomy: "compact" | "full"; swatches?: string[] } =
    $props();

  const P = colorPickerPanelParts;

  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;
</script>

<div {...api.getAreaProps()} class={P.area}>
  <div {...api.getAreaBackgroundProps()} class={P.areaBackground}></div>
  <div {...api.getAreaThumbProps()} class={P.areaThumb}></div>
</div>

<div class={P.hueSlider} {...api.getChannelSliderProps({ channel: "hue" })}>
  <div class={P.hueTrack} {...api.getChannelSliderTrackProps({ channel: "hue" })}>
    <div class={P.hueThumb} {...api.getChannelSliderThumbProps({ channel: "hue" })}></div>
  </div>
</div>

{#if anatomy === "full"}
  <div class={P.alphaSlider} {...api.getChannelSliderProps({ channel: "alpha" })}>
    <div {...api.getTransparencyGridProps({ size: "8px" })}></div>
    <div class={P.alphaTrack} {...api.getChannelSliderTrackProps({ channel: "alpha" })}>
      <div class={P.alphaThumb} {...api.getChannelSliderThumbProps({ channel: "alpha" })}></div>
    </div>
  </div>

  <div class={P.channels}>
    <input class={P.channelInput} {...api.getChannelInputProps({ channel: "hex" })} />
  </div>
{/if}

{#if swatches.length > 0}
  <div class={P.swatchGroup} {...api.getSwatchGroupProps()}>
    {#each swatches as swatch (swatch)}
      <button class={P.swatchTrigger} {...api.getSwatchTriggerProps({ value: swatch })}>
        <span class={P.swatchSwatch} {...api.getSwatchProps({ value: swatch })}></span>
      </button>
    {/each}
  </div>
{/if}

{#if anatomy === "full" && hasEyeDropper}
  <button
    class="{P.eyedropper} {buttonParts.root} {buttonParts.interactive}"
    data-size="sm"
    data-variant="ghost"
    data-icon-only=""
    {...api.getEyeDropperTriggerProps()}
  >
    <!-- An eyedropper is not among the icon set's stable roles (`icon.ts`); it is this component's
         only affordance, so it is drawn here instead of adding a new role to the shared vocabulary
         for a single consumer. -->
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m2 22 1-4 9.5-9.5" />
      <path d="M12.5 8.5 16 5" />
      <path d="M14.5 3.5 20.5 9.5 17.5 12.5 11.5 6.5Z" />
    </svg>
  </button>
{/if}
