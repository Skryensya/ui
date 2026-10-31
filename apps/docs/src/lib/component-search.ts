import { normalizeCommandPaletteQuery } from "@skryensya/core/command-palette";

const normalize = (value: string): string => normalizeCommandPaletteQuery(value).replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export interface ComponentSearchText {
  names: readonly string[];
  terms: readonly { text: string; penalty: number }[];
  context: string;
}

/** Normalize once per entry, not once per alias on every keystroke. */
export function prepareComponentSearch(names: readonly string[], context = ""): ComponentSearchText {
  const fields = [...new Set(names.map((name) => normalize(name.replace(/([a-z\d])([A-Z])/g, "$1 $2"))).filter(Boolean))];
  const terms = new Map<string, number>();
  for (const field of fields) {
    terms.set(field, 0);
    terms.set(field.replaceAll(" ", ""), 0);
  }
  for (const field of fields) {
    const words = field.split(" ");
    for (const word of words) if (!terms.has(word)) terms.set(word, 1);
    if (words.length > 1) {
      const initials = words.map((word) => word[0]).join("");
      if (!terms.has(initials)) terms.set(initials, 2);
    }
  }
  return { names: [...terms].filter(([, penalty]) => penalty === 0).map(([text]) => text), terms: [...terms].map(([text, penalty]) => ({ text, penalty })), context: normalize(context) };
}

/** Bounded edit distance, including adjacent transpositions such as "botno" → "boton". */
function editDistance(source: string, target: string, limit: number): number {
  if (Math.abs(source.length - target.length) > limit) return limit + 1;
  let previous = Array.from({ length: target.length + 1 }, (_, index) => index);
  let beforePrevious = previous;
  for (let row = 1; row <= source.length; row++) {
    const current = [row];
    for (let column = 1; column <= target.length; column++) {
      current[column] = Math.min(
        current[column - 1]! + 1,
        previous[column]! + 1,
        previous[column - 1]! + Number(source[row - 1] !== target[column - 1]),
      );
      if (row > 1 && column > 1 && source[row - 1] === target[column - 2] && source[row - 2] === target[column - 1]) {
        current[column] = Math.min(current[column]!, beforePrevious[column - 2]! + 1);
      }
    }
    if (Math.min(...current) > limit) return limit + 1;
    beforePrevious = previous;
    previous = current;
  }
  return previous[target.length]!;
}

function scoreTerm(query: string, term: string): number | null {
  if (term === query) return 0;
  if (term.startsWith(query)) return 1;
  if (term.includes(query)) return 2;
  if (query.length < 3 || term.length < 3) return null;

  const limit = query.length >= 7 ? 2 : 1;
  const distance = editDistance(query, term, limit);
  if (distance <= limit) return 4 + distance;

  let matched = 0;
  let start = -1;
  let end = 0;
  for (let index = 0; index < term.length && matched < query.length; index++) {
    if (term[index] !== query[matched]) continue;
    if (start === -1) start = index;
    end = index;
    matched++;
  }
  const gaps = end - start + 1 - query.length;
  if (matched !== query.length || gaps > query.length * 2) return null;
  return 8 + gaps / query.length + start / (term.length + 1);
}

/** Lower ranks are better. Only names and aliases are fuzzy; prose must contain the query words. */
export function scoreComponentQuery(entry: ComponentSearchText, query: string): number | null {
  const normalized = normalize(query);
  if (!normalized) return 0;
  const compact = normalized.replaceAll(" ", "");
  if (entry.names.some((name) => name === normalized || name === compact)) return 0;
  if (entry.names.some((name) => name.startsWith(normalized) || name.startsWith(compact))) return 1;
  if (entry.names.some((name) => name.includes(normalized) || name.includes(compact))) return 2;

  let rank = 3;
  for (const word of normalized.split(" ")) {
    let best = entry.context.includes(word) ? 20 : Infinity;
    for (const term of entry.terms) {
      // Initials are exact shortcuts, not another fuzzy word that can outrank the real name.
      if (term.penalty === 2 && term.text !== word) continue;
      const score = scoreTerm(word, term.text);
      if (score !== null) best = Math.min(best, score + term.penalty);
    }
    if (!Number.isFinite(best)) return null;
    rank += best;
  }
  return rank;
}
