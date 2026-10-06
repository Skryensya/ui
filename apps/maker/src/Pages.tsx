import { duplicatePage, emptyPage, layoutsOf, randomId, starterLayout, type MakerSite, type SiteOperation } from "@skryensya/maker-model";
import { Select } from "@skryensya/react/select";
import { Switch } from "@skryensya/react/switch";
import { Icon } from "@skryensya/react/icon";
import { Menu } from "@skryensya/react/menu";
import { Toolbar } from "@skryensya/react/toolbar";
import { Button } from "@skryensya/react/button";
import { IconButton } from "./IconButton";
import { CommitField } from "./Inspector";
import type { Maker } from "./state";
import { Heading, Text } from "@skryensya/react/typography";
import { TileButton, TileContent } from "@skryensya/react/tile";

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

/**
 * What can be done to the open page, as commands the Pages list and the Maker's bar share. Each is a
 * site operation, so it is undone like anything else.
 */
export function pageCommands(maker: Maker) {
  const { site, page } = maker;
  const index = site.pages.findIndex((entry) => entry.id === page.id);
  const run = (operations: readonly SiteOperation[], open?: string) => maker.siteGesture(operations, open);
  return {
    index,
    canMoveUp: index > 0,
    canMoveDown: index < site.pages.length - 1,
    canRemove: site.pages.length > 1,
    add() {
      const path = freePath(site, "/page");
      const id = randomId();
      /* With a layout open there is no page to follow: the new page goes last. */
      run([{ type: "addPage", page: emptyPage(id, `Page ${site.pages.length + 1}`, path, randomId), index: index < 0 ? site.pages.length : index + 1 }], id);
    },
    duplicate() {
      const copy = duplicatePage(page, `${page.name} copy`, freePath(site, page.path === "/" ? "/home" : page.path), randomId);
      run([{ type: "addPage", page: copy, index: index + 1 }], copy.id);
    },
    moveUp: () => run([{ type: "movePage", page: page.id, index: index - 1 }]),
    moveDown: () => run([{ type: "movePage", page: page.id, index: index + 1 }]),
    remove: () => run([{ type: "removePage", page: page.id }]),
    /** A layout to start from, made the site's default when it has none: pages then have it without being asked. */
    addLayout() {
      const id = randomId();
      run([{ type: "addLayout", layout: starterLayout(id, `Layout ${layoutsOf(site).length + 1}`, randomId), makeDefault: site.defaultLayout === undefined }], id);
    },
  };
}

export function Pages({ maker, titleId }: { maker: Maker; titleId: string }) {
  const { site, page } = maker;
  const commands = pageCommands(maker);
  const add = commands.add;
  const duplicate = commands.duplicate;
  const run = (operations: readonly SiteOperation[], open?: string) => maker.siteGesture(operations, open);

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
        <span>
          <Heading as="h2" size="h6" flush className="maker__panel-title" id={titleId}>
            Pages
          </Heading>
          <span className="maker__panel-meta">{site.pages.length} total</span>
        </span>
        <Toolbar label="Pages" className="maker-pages__tools">
          <IconButton icon={{ role: "add" }} label="Add a page" onClick={add} />
        </Toolbar>
      </header>
      <ul className="maker-pages__list" aria-label="Pages of the site">
        {site.pages.map((entry, at) => (
          <li key={entry.id} className="maker-pages__row">
            <TileButton
              padding="sm"
              className="maker-pages__item"
              aria-current={entry.id === page.id ? "page" : undefined}
              onClick={() => maker.setView({ page: entry.id, selected: undefined })}
            >
              <TileContent title={entry.name} description={entry.path} />
            </TileButton>
            {/* Only the open page's: the actions act on it, and a menu per row is noise. */}
            {entry.id === page.id ? menu(entry, at) : null}
          </li>
        ))}
      </ul>
      <header className="maker__panel-header maker-pages__layouts-head">
        <span>
          <Heading as="h2" size="h6" flush className="maker__panel-title">
            Layouts
          </Heading>
          <span className="maker__panel-meta">shared by pages</span>
        </span>
        <Toolbar label="Layouts" className="maker-pages__tools">
          <IconButton icon={{ role: "add" }} label="Add a layout" onClick={commands.addLayout} />
        </Toolbar>
      </header>
      {layoutsOf(site).length === 0 ? (
        <Text size="sm" tone="secondary" className="maker-pages__empty">
          A layout is a header, a footer and more that every page sits in. Add one and each page, new ones too, has it.
        </Text>
      ) : (
        <ul className="maker-pages__list" aria-label="Layouts of the site">
          {layoutsOf(site).map((layout) => (
            <li key={layout.id} className="maker-pages__row">
              <TileButton
                padding="sm"
                className="maker-pages__item"
                aria-current={layout.id === page.id ? "page" : undefined}
                onClick={() => maker.setView({ page: layout.id, selected: undefined })}
              >
                <TileContent title={layout.name} description={layout.id === site.defaultLayout ? "default for new pages" : "shared"} />
              </TileButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The open page's name and path, and the layout it sits in; for a layout, its name and whether it is the default. */
export function PageSettings({ maker }: { maker: Maker }) {
  const { page, site } = maker;
  const run = (operations: readonly SiteOperation[]) => maker.siteGesture(operations);
  if (maker.isLayout) {
    return (
      <section className="maker-page-settings" aria-label="Layout">
        <CommitField label="Layout name" value={page.name} onCommit={(name) => run([{ type: "renameLayout", layout: page.id, name }])} />
        <Switch checked={site.defaultLayout === page.id} onCheckedChange={({ checked }) => run([{ type: "setDefaultLayout", ...(checked === true ? { layout: page.id } : {}) }])}>
          Use for pages that do not choose one
        </Switch>
        <Text size="sm" tone="secondary">The page goes where the Main is. Add a header, a footer or a side rail from Insert; every page that uses this layout changes with it.</Text>
        <Button size="sm" variant="ghost" tone="danger" onClick={() => run([{ type: "removeLayout", layout: page.id }])}>Remove this layout</Button>
      </section>
    );
  }
  const layouts = layoutsOf(site);
  const defaultName = layouts.find((layout) => layout.id === site.defaultLayout)?.name;
  const current = page.layout ?? "inherit";
  return (
    <section className="maker-page-settings" aria-label="Page">
      <CommitField label="Page name" value={page.name} onCommit={(name) => run([{ type: "renamePage", page: page.id, name }])} />
      <CommitField label="Path" value={page.path} onCommit={(path) => run([{ type: "setPagePath", page: page.id, path }])} />
      {layouts.length > 0 ? (
        <Select
          label="Layout"
          value={current}
          options={[
            { value: "inherit", label: defaultName ? `Site default (${defaultName})` : "Site default (none)" },
            { value: "none", label: "None" },
            ...layouts.map((layout) => ({ value: layout.id, label: layout.name })),
          ]}
          onValueChange={({ value: [next] }) => {
            if (next !== undefined) run([{ type: "setPageLayout", page: page.id, ...(next === "inherit" ? {} : { layout: next }) }]);
          }}
        />
      ) : null}
    </section>
  );
}
