import { describe, expect, it } from "vitest";
import { getDevCommandPaletteOnlyComponentNavigation, getNavigation } from "./navigation";

/*
 * THE COMPONENT RAIL IS TWELVE CATEGORIES, in a fixed order, each alphabetical, each opening and closing.
 *
 * The taxonomy is data in `navigation.ts`, and these assert it is the one the docs promise: the same twelve
 * ids in the same order, the same entries in each, none twice, none missing, the paused and the dev-only
 * kept out of the public rail, and a category flagged to open and close so no renderer has to guess.
 */
const expectedOrder = [
  "actions",
  "forms",
  "navigation",
  "data",
  "typography",
  "identity",
  "surfaces",
  "feedback",
  "overlays",
  "layout",
  "media",
  "utilities",
] as const;

/* Component names as the rail shows them, by category. Two entries the brief did not place sit where a reader would look first. */
const expected: Record<(typeof expectedOrder)[number], readonly string[]> = {
  actions: ["AppBar", "Button", "Clipboard", "CommandPalette", "Dock", "Menu", "Menubar", "SplitButton", "StateButton", "Toolbar"],
  forms: [
    "Calendar", "Checkbox", "ColorPicker", "Combobox", "DatePicker", "Editor", "Drop zone", "FormField", "Input", "Listbox",
    "NumberField", "OtpInput", "PasswordInput", "Questionnaire", "RadioGroup", "SegmentedControl", "Select", "Slider", "Switch",
    "TagsInput", "TimeField", "UserSelect",
  ],
  navigation: ["BackToTop", "Breadcrumb", "Link", "Megamenu", "Navbar", "Nav list", "Pagination", "Sidebar", "SkipLink", "Steps", "Tabs", "Table of contents"],
  data: ["Charts", "ComparisonTable", "DescriptionList", "Meter", "Rating", "Stat", "Table", "TablePager", "Treegrid"],
  typography: ["CodePreview", "Heading", "Kbd", "Quote", "Text"],
  identity: ["Avatar", "Badge", "Expressive Avatar", "Icon", "Tag"],
  surfaces: ["Accordion", "Card", "Changelog", "CommentThread", "Feed", "Folder", "List", "Message", "Procedure", "Tile", "Timeline", "TreeView"],
  feedback: ["Callout", "EmptyState", "Loader", "Placeholder", "Progress", "Toast"],
  overlays: ["Dialog", "Dialog Stack", "Drawer", "Popover", "Tooltip", "Tour", "Vaul", "Window"],
  layout: ["AppShell", "Box", "Footer", "Grid", "Hero", "Inline", "Layout Grid", "Resizable", "Scroll Expand", "Scroll Stack", "Separator", "Stack", "Wrapper"],
  media: ["Canvas", "Carousel", "Compare Slider", "Diagram", "Image Cropper", "ImageFrame", "Lightbox", "Marquee", "MediaOverlay", "Morph Stack", "QRCode", "Sticker", "Video Player", "Audio Player"],
  utilities: ["FadeEdge", "Hotkey", "Presence", "Scrollbar"],
};

const componentsSection = (locale: "es" | "en") => getNavigation(locale).find((section) => section.id === "components")!;

describe("the component navigation", () => {
  it("has the twelve categories, in order", () => {
    expect(componentsSection("en").groups.map((group) => group.id)).toEqual(expectedOrder);
  });

  it("holds exactly the promised entries in each category", () => {
    const groups = componentsSection("en").groups;
    for (const [index, id] of expectedOrder.entries()) {
      expect(groups[index]!.items.map((item) => item.label).sort(), id).toEqual([...expected[id]].sort());
    }
  });

  it("puts every public entry in one category, once", () => {
    const hrefs = componentsSection("en").groups.flatMap((group) => group.items.map((item) => item.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  for (const locale of ["es", "en"] as const) {
    it(`is alphabetical inside each category, in ${locale}`, () => {
      for (const group of componentsSection(locale).groups) {
        const labels = group.items.map((item) => item.label);
        expect(labels, group.id).toEqual(labels.slice().sort((a, b) => a.localeCompare(b, locale)));
      }
    });
  }

  it("translates the categories' names", () => {
    expect(componentsSection("en").groups.map((group) => group.group)).toEqual([
      "Actions",
      "Forms",
      "Navigation",
      "Data",
      "Typography & Code",
      "Labels & Identity",
      "Surfaces & Collections",
      "Feedback",
      "Overlays",
      "Layout",
      "Media & Visuals",
      "Utilities",
    ]);
    expect(componentsSection("es").groups[0]!.group).toBe("Acciones");
  });

  it("keeps the paused and the dev-only out of the public rail", () => {
    const labels = componentsSection("en").groups.flatMap((group) => group.items.map((item) => item.label));
    expect(labels).not.toContain("DataGrid");
    expect(labels).not.toContain("Annotation");
    expect(getDevCommandPaletteOnlyComponentNavigation("en").flatMap((group) => group.items.map((item) => item.label))).toContain("Annotation");
  });

  it("flags the component categories as collapsible, closed until they hold the current page", () => {
    expect(componentsSection("en").groups.every((group) => group.collapsible)).toBe(true);
    expect(componentsSection("en").groups.some((group) => group.defaultOpen)).toBe(false);
  });

  it("makes the foundations' groups collapsible, all open on arrival, each with a stable id", () => {
    const foundations = getNavigation("en").find((section) => section.id === "foundations")!;
    expect(foundations.groups.length).toBeGreaterThan(1);
    expect(foundations.groups.every((group) => group.collapsible && group.defaultOpen)).toBe(true);
    const ids = foundations.groups.map((group) => group.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
