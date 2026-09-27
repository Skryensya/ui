/* The backdrop lives in `src/lib/frost-stage.ts`, beside the wrapper that stages a whole demo on it
   (a function here would be read as a tree factory by trees.test.ts). Re-exported for the demos
   that already import it from here. */
export { frostStage } from "../../lib/frost-stage";
