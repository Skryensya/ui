import { duplicatePage, emptyPage, randomId, type MakerSite, type SiteOperation } from "@skryensya/maker-model";
import { Icon } from "@skryensya/react/icon";
import { Menu } from "@skryensya/react/menu";
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

export function Pages({ maker, titleId }: { maker: Maker; titleId: string }) {
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

  const menu = (entry: MakerSite["pages"][number], at: number) => (
    <Menu
      label={`${entry.name} page`}
      triggerLabel="Page actions"
      triggerVariant="ghost"
      triggerSize="sm"
      triggerIconOnly
      triggerClassName="maker-pages__more"
      indicator={null}
      trigger={<Icon name="more" size="sm" />}
      items={[
        { value: "duplicate", label: "Duplicate this page" },
        { value: "up", label: "Move this page up", disabled: at === 0 },
        { value: "down", label: "Move this page down", disabled: at === site.pages.length - 1 },
        { value: "sep", kind: "separator" },
        { value: "remove", label: "Remove this page", tone: "danger", disabled: site.pages.length === 1 },
      ]}
      onSelect={({ value }) => {
        if (value === "duplicate") duplicate();
        if (value === "up") run([{ type: "movePage", page: entry.id, index: at - 1 }]);
        if (value === "down") run([{ type: "movePage", page: entry.id, index: at + 1 }]);
        if (value === "remove") run([{ type: "removePage", page: entry.id }]);
      }}
    />
  );

  return (
    <div className="maker-pages">
      <header className="maker__panel-header">
        <h2 className="maker__panel-title" id={titleId}>
          Pages
        </h2>
        <Toolbar label="Pages" className="maker-pages__tools">
          <IconButton icon={{ role: "add" }} label="Add a page" onClick={add} />
        </Toolbar>
      </header>
      <ul className="maker-pages__list" aria-label="Pages of the site">
        {site.pages.map((entry, at) => (
          <li key={entry.id} className="maker-pages__row">
            <button
              type="button"
              className="maker-pages__item"
              aria-current={entry.id === page.id ? "page" : undefined}
              onClick={() => maker.setView({ page: entry.id, selected: undefined })}
            >
              <span className="maker-pages__name">{entry.name}</span>
              <span className="maker-pages__path">{entry.path}</span>
            </button>
            {/* Only the open page's: the actions act on it, and a menu per row is noise. */}
            {entry.id === page.id ? menu(entry, at) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The open page's name and path: what the inspector shows when nothing on the page is selected. */
export function PageSettings({ maker }: { maker: Maker }) {
  const { page } = maker;
  const run = (operations: readonly SiteOperation[]) => maker.siteGesture(operations);
  return (
    <section className="maker-page-settings" aria-label="Page">
      <CommitField label="Page name" value={page.name} onCommit={(name) => run([{ type: "renamePage", page: page.id, name }])} />
      <CommitField label="Path" value={page.path} onCommit={(path) => run([{ type: "setPagePath", page: page.id, path }])} />
    </section>
  );
}
