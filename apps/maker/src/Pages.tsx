import { duplicatePage, emptyPage, randomId, type MakerSite, type SiteOperation } from "@skryensya/maker-model";
import { Toolbar } from "@skryensya/react/toolbar";
import { IconButton } from "./IconButton";
import { CommitField } from "./Inspector";
import type { Maker } from "./state";

/*
 * THE SITE'S PAGES: the list, in the order the site offers them, and the tools that change it. Each
 * tool is a site operation, so adding, moving or removing a page is undone like anything else.
 * Opening a page is a view change and never a step.
 */

function freePath(site: MakerSite, base: string): string {
  const taken = new Set(site.pages.map((page) => page.path));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

export function Pages({ maker }: { maker: Maker }) {
  const { site, page } = maker;
  const index = site.pages.findIndex((entry) => entry.id === page.id);
  const run = (operations: readonly SiteOperation[], open?: string) => maker.siteGesture(operations, open);

  const add = () => {
    const path = freePath(site, "/page");
    const id = randomId();
    run([{ type: "addPage", page: emptyPage(id, `Page ${site.pages.length + 1}`, path, randomId), index: index + 1 }], id);
  };
  const duplicate = () => {
    const copy = duplicatePage(page, `${page.name} copy`, freePath(site, page.path === "/" ? "/home" : page.path), randomId);
    run([{ type: "addPage", page: copy, index: index + 1 }], copy.id);
  };

  return (
    <div className="maker-pages">
      <Toolbar label="Pages" className="maker-pages__tools">
        <IconButton icon={{ glyph: "add-page" }} label="Add a page" onClick={add} />
        <IconButton icon={{ glyph: "duplicate" }} label="Duplicate this page" onClick={duplicate} />
        <IconButton icon={{ glyph: "move-up" }} label="Move this page up" disabled={index === 0} onClick={() => run([{ type: "movePage", page: page.id, index: index - 1 }])} />
        <IconButton
          icon={{ glyph: "move-down" }}
          label="Move this page down"
          disabled={index === site.pages.length - 1}
          onClick={() => run([{ type: "movePage", page: page.id, index: index + 1 }])}
        />
        <IconButton icon={{ role: "delete" }} label="Remove this page" tone="danger" disabled={site.pages.length === 1} onClick={() => run([{ type: "removePage", page: page.id }])} />
      </Toolbar>
      <ul className="maker-pages__list" aria-label="Pages of the site">
        {site.pages.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="maker-pages__item"
              aria-current={entry.id === page.id ? "page" : undefined}
              onClick={() => maker.setView({ page: entry.id, selected: undefined })}
            >
              <span className="maker-pages__name">{entry.name}</span>
              <span className="maker-pages__path">{entry.path}</span>
            </button>
          </li>
        ))}
      </ul>
      {/* Folded by default: naming a page is occasional, and open it took half the column. */}
      <details className="maker-pages__settings">
        <summary>Page settings: {page.name}</summary>
        <div className="maker-pages__fields">
          <CommitField label="Page name" value={page.name} onCommit={(name) => run([{ type: "renamePage", page: page.id, name }])} />
          <CommitField label="Path" value={page.path} onCommit={(path) => run([{ type: "setPagePath", page: page.id, path }])} />
        </div>
      </details>
    </div>
  );
}
