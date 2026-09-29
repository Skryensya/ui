/* Types for the two dependencies that do not resolve their own under NodeNext. */

/* jsdom ships no types and nothing else in the tree imports it directly; this is the one member used. */
declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string);
    readonly window: Window & typeof globalThis;
  }
}

/* The package's `exports` map hides its own index.d.ts from NodeNext resolution; this is the part used. */
declare module "@bramus/specificity" {
  export default class Specificity {
    static calculate(selector: string): { value: { a: number; b: number; c: number } }[];
  }
}
