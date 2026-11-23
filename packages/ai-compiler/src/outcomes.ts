import type { UsageTree } from "@skryensya/core/usage-tree";
import { emitMarkup, emitReactSource } from "./emit.js";
import { reviewTree, type Review } from "./quality.js";
import { sheetsForTree } from "./sheets-for-tree.js";
import { validateUsageTree, type Problem } from "./validate.js";

/*
 * What `validate_ui` and `review_ui` answer, without the artifact around them: the MCP stamps these
 * with provenance, and the CLI (`skryensya validate`, `skryensya review`) prints them as they are, so
 * a model with no MCP gets the same answer from the same code.
 */

/** A design review of a tree that composes: the findings a good page would not have. `review` is null when the tree is invalid, because nothing about its design can be judged until it holds. */
export type ReviewOutcome = {
  readonly valid: boolean;
  readonly problems: readonly Problem[];
  readonly review: Review | null;
  readonly hint: string;
};

export type ValidateOutcome =
  | {
      readonly valid: false;
      readonly problems: readonly Problem[];
      readonly emitted: null;
      readonly hint: string;
    }
  | {
      readonly valid: true;
      readonly problems: readonly Problem[];
      readonly emitted: {
        readonly vanilla: string;
        readonly react: string;
        readonly reactData: { readonly file: string; readonly source: string } | null;
      };
      /** Every stylesheet the composition needs, from `sheetsForTree`: the closure, not a guess. */
      readonly css: readonly string[];
    };

/**
 * Emits only when valid: the emitter is a renderer, not a checker, and code from an invalid tree looks
 * plausible and is wrong. Throws when a valid tree cannot be emitted, which is a defect in the kit.
 */
export function validateAndEmit(tree: UsageTree): ValidateOutcome {
  const { valid, problems } = validateUsageTree(tree);
  if (!valid) {
    return {
      valid: false,
      problems,
      emitted: null,
      hint: "Fix the errors and validate again. Nothing was emitted: code built from an invalid tree looks plausible and is wrong.",
    };
  }
  /* React comes back as up to TWO files: the component, and the module its collections were moved to. Write both. */
  const react = emitReactSource(tree);
  return {
    valid: true,
    problems,
    emitted: { vanilla: emitMarkup(tree), react: react.component, reactData: react.data ? { file: react.data.file, source: react.data.source } : null },
    css: sheetsForTree(tree).sheets,
  };
}

export function reviewUsageTree(tree: UsageTree): ReviewOutcome {
  const { valid, problems } = validateUsageTree(tree);
  if (!valid) {
    return { valid: false, problems, review: null, hint: "The tree does not compose, so its design cannot be judged yet. Fix the problems with validate_ui first." };
  }
  const review = reviewTree(tree);
  return {
    valid: true,
    problems,
    review,
    hint: review.passes
      ? review.warnings === 0
        ? "No findings. This tree meets every checkable rule; contrast, focus visibility and reflow still have to be checked where it is rendered."
        : "No accessibility errors. The warnings are design smells to weigh, not failures."
      : "Fix the errors: each is an accessibility failure the tree itself causes. Then review again.",
  };
}
