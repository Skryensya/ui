/*
 * Diagnostic only, for /debug/slider-break. Renders the REAL `@skryensya/react` Slider and
 * SliderRange (Zag-backed) once per stress scenario. The page around it adds labels and
 * fixed-width containers and nothing else: no fonts, no token overrides, no simulated themes. A
 * slider observed under any of those is a different slider.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Slider, SliderRange } from "@skryensya/react/slider";
import type { ReactNode } from "react";

function Case({
  label,
  note,
  broke,
  fixed,
  children,
}: {
  label: string;
  note?: string;
  broke?: string;
  fixed?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
      {fixed ? <p className="break-case__fixed">WAS BROKEN, NOW {fixed}</p> : null}
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-group" data-toc-transparent>
      <h2 className="break-group__title">{title}</h2>
      {children}
    </section>
  );
}

export function SliderBreak() {
  return (
    <>
      <Group title="Baseline">
        <Case label="Typical, defaultValue=20">
          <Slider aria-label="Volume" defaultValue={20} max={100} min={0} />
        </Case>
        <Case label="At the bounds themselves: 0 and 100">
          <div className="break-stack">
            <Slider aria-label="At minimum" defaultValue={0} max={100} min={0} />
            <Slider aria-label="At maximum" defaultValue={100} max={100} min={0} />
          </div>
        </Case>
        <Case label="SliderRange, typical">
          <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="Maximum price" lowLabel="Minimum price" max={200} min={0} />
        </Case>
      </Group>

      <Group title="Content / accessibility">
        <Case
          label="No aria-label, no aria-labelledby"
          fixed="flagged. `warnMissingSliderName` (slider.tsx) now logs a dev console error, mirroring Switch's own warnMissingSwitchName - the contract's own a11y rule already required one of the two; nothing checked it at runtime. SliderRange has no equivalent gap: lowLabel/highLabel are required PROPS at the type level, not optional strings, so there was nothing to check there."
        >
          <Slider defaultValue={50} max={100} min={0} />
        </Case>
      </Group>

      <Group title="Numbers">
        <Case label="A non-zero min, temperature-style scale (-10..40)">
          <Slider aria-label="Target temperature" defaultValue={15} max={40} min={-10} />
        </Case>
        <Case label="A large range with a step that does not evenly divide it (0..100, step=7)" note="Zag's own machine owns step-snapping; checking the thumb still lands on a value the keyboard can reach exactly, not something this binding's CSS/markup controls.">
          <Slider aria-label="Odd stepping" defaultValue={21} max={100} min={0} step={7} />
        </Case>
        <Case label="An inverted authored range on SliderRange (low above high)" note="clampSliderRange (slider.ts) swaps the two defensively before the machine ever sees them - this is the authored defaultLowValue/defaultHighValue the other way round.">
          <SliderRange defaultHighValue={20} defaultLowValue={80} highLabel="High" lowLabel="Low" max={100} min={0} />
        </Case>
      </Group>

      <Group title="States">
        <Case label="Disabled, Slider and SliderRange">
          <div className="break-stack">
            <Slider aria-label="Disabled" defaultValue={50} disabled max={100} min={0} />
            <SliderRange defaultHighValue={70} defaultLowValue={30} disabled highLabel="High" lowLabel="Low" max={100} min={0} />
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container" fixed="SSR now inherits direction, CSS mirrors the first paint, and the ready marker keeps Vanilla off React; ArrowLeft increases the value in RTL.">
          <div dir="rtl" className="break-rtl">
            <Slider aria-label="مستوى الصوت" defaultValue={60} max={100} min={0} />
          </div>
        </Case>
      </Group>
    </>
  );
}
