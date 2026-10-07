/*
 * The tree walkers live in Core, beside the type they read (see `usage-tree.ts`). They are re-exported
 * here so every importer of the compiler's `usage-walk` keeps working, and so there is one walk.
 */
export { walkUsageTree, contractsIn, signaturesIn } from "@skryensya/core/usage-tree";
