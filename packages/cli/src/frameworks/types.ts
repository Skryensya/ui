import type { Binding } from "../manifest.js";
import type { Project } from "../project.js";

export type Wiring = {
  /** True when something in the project already imports the managed stylesheet. */
  wired: boolean;
  /** What to do when it does not: the one line to add, and where. */
  instruction: string;
};

/*
 * A FRAMEWORK ADAPTER holds everything the CLI must not guess: where a stylesheet belongs, how it
 * reaches the page, and what a person needs to know before a component works there. Commands never
 * ask which framework it is; they ask the adapter, so a third framework is one file here and nothing
 * anywhere else.
 */
export interface FrameworkAdapter {
  id: string;
  label: string;
  /**
   * Who wins when a project matches several. A meta-framework (Next, Astro, React Router, TanStack
   * Start) owns its own routing and layout, so it outranks a bare bundler such as Vite, which sits
   * underneath most of them. Two with the same priority are a real ambiguity, and are reported.
   */
  priority: number;
  /** Whether this project uses the framework. */
  detect(project: Project): boolean;
  /** The binding that fits when none was asked for. */
  defaultBinding(project: Project): Binding;
  /** Where the managed stylesheet lives, relative to the project root. */
  cssFile(project: Project): string;
  /** Whether that stylesheet is imported, and the instruction to import it when it is not. */
  wiring(project: Project, cssFile: string): Wiring;
  /** Things this framework needs the author to know for this binding. Printed once. */
  notes(project: Project, binding: Binding): string[];
}
