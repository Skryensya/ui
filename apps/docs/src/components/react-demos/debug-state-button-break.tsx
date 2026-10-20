import { useState } from "react";
import { StateButton } from "@skryensya/react/state-button";
import type { IconStateFace } from "@skryensya/core/state-button";
import { BreakCaseFindings } from "./debug-case-findings";

const FACES: readonly IconStateFace[] = [
  { name: "idle", icon: "copy" },
  { name: "copied", icon: "check" },
  { name: "visible", icon: "visibility" },
];
const CASES = [
  { label: "Demo", faces: FACES, name: "Change preview state" },
  {
    label: "Worst case",
    faces: FACES,
    name: "Afficher les paramètres de confidentialité et de sécurité pour Aleksandra Wiśniewska-Kowalczyk",
  },
  {
    label: "Unknown current (invalid contract)",
    faces: FACES,
    name: "Unknown state",
    initial: "expired",
  },
  {
    label: "Empty faces (invalid contract)",
    faces: [],
    name: "Unavailable preview",
  },
  {
    label: "One face (invalid contract)",
    faces: [FACES[0]],
    name: "One available state",
  },
  {
    label: "Disabled",
    faces: FACES,
    name: "Change preview state",
    disabled: true,
  },
];

function StateCase({ scenario }: { scenario: (typeof CASES)[number] }) {
  const [current, setCurrent] = useState(
    scenario.initial ?? scenario.faces[0]?.name,
  );
  return (
    <section className="break-case">
      <h2 className="break-case__label">StateButton — {scenario.label}</h2>
      <BreakCaseFindings component="state-button" label={scenario.label} />
      <div className="break-case__stage">
        <StateButton
          aria-label={scenario.name}
          faces={scenario.faces}
          current={current}
          disabled={scenario.disabled}
          onClick={() => {
            const index = scenario.faces.findIndex(
              (face) => face.name === current,
            );
            setCurrent(
              scenario.faces[index + 1]?.name ?? scenario.faces[0]?.name,
            );
          }}
        />
      </div>
      <p className="break-case__note">
        current: {current ?? "not set"}. Contract requires at least two faces;
        invalid inputs are identified explicitly, not presented as supported
        usage.
      </p>
    </section>
  );
}

export function StateButtonBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: StateButton</h1>
        <p className="break-intro">
          Cycle real icon faces, test a long accessible name and disabled state;
          missing/unmatched faces deliberately exercise invalid public props.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map((scenario) => (
          <StateCase key={scenario.label} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
