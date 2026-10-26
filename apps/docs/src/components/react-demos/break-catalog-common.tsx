import { Component, type ReactNode } from "react";
import { BreakCaseFindings } from "./debug-case-findings";

export const EMAIL = "bartholomew.fitzgerald@northwind-industries-holdings.example.com";
export const URL = "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved";
export const LONG_TITLE = "International billing reconciliation and security administration";
export const LONG_BODY = `Aleksandra Wiśniewska-Kowalczyk coordinates the review. Contact ${EMAIL} and consult ${URL} before approving changes.`;
export const LABELS = [LONG_TITLE, "Benachrichtigungseinstellungen", "Paramètres de confidentialité et de sécurité", "王秀英 · 产品团队", "نور الهدى عبد الرحمن", "Jo"];
export type Fixture = { label: string; title: string; body: string; items: readonly string[]; worst?: boolean };
export const FIXTURES: readonly Fixture[] = [
  { label: "Demo", title: "Workspace review", body: "Review billing settings before the next invoice.", items: ["Overview", "Invoices", "Members"] },
  { label: "Worst case", title: LONG_TITLE, body: LONG_BODY, items: LABELS, worst: true },
  { label: "Empty", title: "Workspace review", body: "", items: [] },
  { label: "One item", title: "Jo", body: "One review is available.", items: ["Jo"] },
];
const LARGE: Fixture = { label: "1,000 items", title: "Workspace archive", body: LONG_BODY, items: Array.from({ length: 1000 }, (_, i) => `Project ${i + 1} - invoice reconciliation`) };

class SpecimenBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) { return { error: error instanceof Error ? error.message : String(error) }; }
  render() {
    return this.state.error ? <pre role="alert" data-break-render-error>{this.state.error}</pre> : this.props.children;
  }
}

export function FixtureCases({ id, render, large = false, fixtures = FIXTURES }: { id: string; render: (fixture: Fixture, index: number) => ReactNode; large?: boolean; fixtures?: readonly Fixture[] }) {
  return <div className="break-scenario-grid">{[...fixtures, ...(large ? [LARGE] : [])].map((fixture, index) => <section className="break-case" key={fixture.label} data-break-case={fixture.label}>
    <h2 className="break-case__label">{id} - {fixture.label}</h2>
    <BreakCaseFindings component={id} label={fixture.label} />
    <div className="break-case__stage"><div style={{ inlineSize: "100%", ...(fixture.items.length === 1000 ? { maxBlockSize: "32rem", overflow: "auto" } : {}) }}><SpecimenBoundary>{render(fixture, index)}</SpecimenBoundary></div></div>
  </section>)}</div>;
}
