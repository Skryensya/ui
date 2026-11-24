import { describe, expect, it } from "vitest";
import { agentDocFor, agentDocIds } from "./agent-docs";
import { boldLabel, inlineHtml, parseMarkdown } from "./markdown-blocks";

describe("the agent docs read for a person", () => {
  it("reads every block the generator writes", () => {
    const blocks = parseMarkdown(
      [
        "# button",
        "",
        "Category: actions.",
        "## Button.action",
        "**Use when**",
        "",
        "- it submits a form",
        "- it confirms",
        "",
        "| Option | Values |",
        "|---|---|",
        '| `variant` | "solid" \\| "soft" |',
        "",
        "```tsx",
        "<Button />",
        "",
        "- not a list",
        "```",
      ].join("\n"),
    );
    expect(blocks.map((block) => block.kind)).toEqual(["heading", "paragraph", "heading", "paragraph", "list", "table", "code"]);
    expect(blocks[2]).toMatchObject({ level: 2, id: "button-action" });
    expect(blocks[4]).toMatchObject({ items: ["it submits a form", "it confirms"] });
    expect(blocks[5]).toMatchObject({ head: ["Option", "Values"], rows: [["`variant`", '"solid" | "soft"']] });
    expect(blocks[6]).toMatchObject({ lang: "tsx", code: "<Button />\n\n- not a list" });
  });

  it("escapes markup and keeps code literal", () => {
    expect(inlineHtml('Use `<a href="x">` for **links** & <b>')).toBe(
      'Use <code>&lt;a href=&quot;x&quot;&gt;</code> for <strong>links</strong> &amp; &lt;b&gt;',
    );
    expect(inlineHtml("`**not bold**`")).toBe("<code>**not bold**</code>");
    expect(boldLabel("**Use when**")).toBe("Use when");
    expect(boldLabel("**Example** (canonical tree)")).toBeUndefined();
  });

  it("loses no line of any shipped page", () => {
    for (const id of agentDocIds()) {
      const source = agentDocFor(id)!;
      const kept = parseMarkdown(source)
        .flatMap((block) => {
          if (block.kind === "code") return block.code.split("\n");
          if (block.kind === "list") return block.items;
          if (block.kind === "table") return [block.head, ...block.rows].flat();
          return [block.text];
        })
        .join("\n");
      for (const word of source.split(/\s+/).filter((each) => /^[A-Za-z]{4,}$/.test(each))) expect(kept, `${id}: ${word}`).toContain(word);
    }
  });
});
