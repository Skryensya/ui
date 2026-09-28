import { useMemo, useState } from "react";
import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import { parseSite, randomId, serializeSite, toUsageTree, type MakerPageEntry } from "@skryensya/maker-model";
import { IconButton } from "./IconButton";
import { CATALOGUE_HASH, type Maker } from "./state";

/*
 * EXPORT, every form produced by the same emitter `validate_ui` uses, in the browser. A pending
 * page exports anyway, with its problems listed: blocking the export would punish someone who
 * only wanted to keep their work.
 */

type Format = "site" | "tree" | "react" | "html" | "site-react";

/** `/about/team` → `AboutTeamPage`; `/` → `HomePage`. */
function componentName(page: MakerPageEntry): string {
  const words = page.path === "/" ? ["home"] : page.path.split(/[/-]/).filter(Boolean);
  return `${words.map((word) => word[0]!.toUpperCase() + word.slice(1)).join("")}Page`;
}

function fileName(page: MakerPageEntry): string {
  return page.path === "/" ? "index.tsx" : `${page.path.slice(1)}.tsx`;
}

export function ExportPanel({ maker, onClose }: { maker: Maker; onClose: () => void }) {
  const [format, setFormat] = useState<Format>("react");
  const tree = useMemo(() => toUsageTree(maker.page.root), [maker.page.root]);
  const output = useMemo(() => {
    try {
      switch (format) {
        case "site":
          return { text: serializeSite(maker.site, CATALOGUE_HASH), file: "site.maker.json" };
        case "site-react": {
          const files = maker.site.pages.map((page) => {
            const tree = toUsageTree(page.root);
            const source = emitReactSource(tree, { component: componentName(page) });
            const imports = sheetsForTree(tree).sheets.map((sheet) => `import "${sheet}";`).join("\n");
            const data = source.data ? `\n\n// pages/${source.data.file}\n${source.data.source}` : "";
            return `// pages/${fileName(page)}: ${page.name} (${page.path})\n${imports}\n${source.component}${data}`;
          });
          return { text: files.join("\n\n"), file: "pages.tsx.txt" };
        }
        case "tree":
          return { text: JSON.stringify(tree, null, 2), file: "page.usage-tree.json" };
        case "html": {
          const { sheets } = sheetsForTree(tree);
          const links = sheets.map((sheet) => `<!-- import "${sheet}" -->`).join("\n");
          return { text: `${links}\n${emitMarkup(tree)}`, file: "page.html" };
        }
        case "react": {
          const source = emitReactSource(tree, { component: componentName(maker.page) });
          const { sheets } = sheetsForTree(tree);
          const imports = sheets.map((sheet) => `import "${sheet}";`).join("\n");
          const data = source.data ? `\n\n// ${source.data.file}\n${source.data.source}` : "";
          return { text: `${imports}\n${source.component}${data}`, file: "Page.tsx" };
        }
      }
    } catch (error) {
      return { text: `This page cannot be emitted yet: ${error instanceof Error ? error.message : String(error)}`, file: undefined };
    }
  }, [format, tree, maker.page, maker.site]);

  const errors = maker.problems.problems.filter((problem) => problem.severity === "error");

  const download = () => {
    if (!output.file) return;
    const url = URL.createObjectURL(new Blob([output.text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = output.file;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPage = async (file: File) => {
    const opened = parseSite(await file.text(), CATALOGUE_HASH, randomId);
    if (!opened.ok) {
      maker.say(opened.reason);
      return;
    }
    maker.load(opened.site, opened.catalogueChanged ? "The catalogue changed since this site was saved; anything that no longer fits is marked pending." : undefined);
    onClose();
  };

  return (
    <div className="maker-export">
      <Stack gap="md">
        <Inline justify="between" align="center">
          <h2 className="maker-export__title">Export {maker.page.name}</h2>
          <IconButton icon={{ role: "close" }} label="Close export" onClick={onClose} />
        </Inline>
        {errors.length > 0 ? (
          <div className="maker-export__warning" role="status">
            <Text size="sm">
              This page is pending: {errors.length} problem{errors.length === 1 ? "" : "s"}. It exports as it is.
            </Text>
            <ul>
              {errors.slice(0, 8).map((problem, i) => (
                <li key={i}>
                  <Text size="sm">
                    {problem.path}: {problem.message}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <SegmentedControl
          label="Format"
          value={format}
          onValueChange={(value) => setFormat(value as Format)}
          options={[
            { value: "react", label: "React" },
            { value: "html", label: "HTML" },
            { value: "tree", label: "Usage tree" },
            { value: "site-react", label: "All pages" },
            { value: "site", label: "Site" },
          ]}
        />
        <textarea className="maker-export__code" readOnly value={output.text} aria-label="Exported code" spellCheck={false} />
        <Inline gap="sm">
          <Button variant="solid" size="sm" pre={<Icon name="download" />} onClick={download} disabled={!output.file}>
            Download {output.file ?? ""}
          </Button>
          <Button variant="soft" size="sm" pre={<Icon name="copy" />} onClick={() => void navigator.clipboard?.writeText(output.text)}>
            Copy
          </Button>
          <label className="maker-export__import">
            <Icon name="upload" />
            <span>Open a site…</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void importPage(file);
              }}
            />
          </label>
        </Inline>
      </Stack>
    </div>
  );
}
