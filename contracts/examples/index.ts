export { areaLabels, domainLabels, intents, intentOf, intentPath, intentTree, hasIntent, subjects, type Intent, type IntentId, type Subject } from "./model/taxonomy.js";
export { SCALES, definePattern } from "./model/types.js";
export type { BuildContext, Fixed, Localized, Locale, Pattern, PatternModule, Relation, RelationKind, Scale, SubjectId, Text, Use } from "./model/types.js";
export { isLocalePair, pairsIn, resolveContent, textIn } from "./model/resolve.js";
export { duplicateIds, entries, entryById, fixedExamples, intentCounts, patternOf, patterns, relationsOf, useOf, uses, type Entry, type Relations } from "./model/registry.js";
export { unplacedFixed, fixed, legacySnippets, type Snippet, type SnippetLevel } from "./fixed/index.js";
export { snippets } from "./model/compat.js";
export { library, type Library } from "./model/library.js";
