import { BreakCaseFindings } from "./debug-case-findings";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@skryensya/react/toolbar";
import { Button } from "@skryensya/react/button";
import { SegmentedControl } from "@skryensya/react/segmented";

const CASES = [
  { label: "Demo", actions: ["Undo", "Redo", "Export"] },
  {
    label: "Worst case",
    actions: [
      "Export the complete billing history",
      "Benachrichtigungseinstellungen",
      "Paramètres de confidentialité",
    ],
  },
  { label: "Empty", actions: [] },
  { label: "One", actions: ["Save"] },
];

export function ToolbarBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Toolbar</h1>
        <p className="break-intro">
          Long action labels, a disabled command and a nested composite. Test
          one tab stop, arrows and Home/End.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, actions }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Toolbar - {label}</h2>
            <BreakCaseFindings component="toolbar" label={label} />
            <div className="break-case__stage">
              <Toolbar label={`Editing - ${label}`}>
                {actions.map((action, i) => (
                  <Button
                    key={action}
                    variant="ghost"
                    disabled={label === "Worst case" && i === 1}
                  >
                    {action}
                  </Button>
                ))}
              </Toolbar>
            </div>
          </section>
        ))}
        <section className="break-case">
          <h2 className="break-case__label">Toolbar - Nested composite</h2>
          <div className="break-case__stage">
            <Toolbar label="Document view">
              <ToolbarGroup label="History">
                <Button variant="ghost">Undo</Button>
                <Button variant="ghost" disabled>
                  Redo
                </Button>
              </ToolbarGroup>
              <ToolbarSeparator />
              <SegmentedControl
                label="View"
                options={[
                  { value: "list", label: "List" },
                  { value: "board", label: "Board" },
                ]}
              />
              <Button variant="ghost">Export</Button>
            </Toolbar>
          </div>
        </section>
      </div>
    </div>
  );
}
