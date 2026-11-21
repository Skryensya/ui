/*
 * The icon sets a reader can switch the site to, from Preferences. Phosphor is the site's own choice
 * and the default; the others show the kit's point: the components name roles, so any mapped set draws
 * the same page. Each id is a core preset (`skryensya icons <id>` writes `src/icon-sets/<id>.ts`).
 *
 * Cheap on purpose: the pre-paint script and `preferences.ts` read this list. The geometry is loaded
 * by `scripts/icon-set.ts`, one chunk per set, only when a reader picks one.
 */
export const siteIconSets = [
  { id: "ph", label: "Phosphor" },
  { id: "ph-bold", label: "Phosphor Bold" },
  { id: "ph-duotone", label: "Phosphor Duotone" },
  { id: "lucide", label: "Lucide" },
  { id: "material-symbols", label: "Material Symbols" },
  { id: "material-symbols-rounded", label: "Material Symbols Rounded" },
  { id: "tabler", label: "Tabler" },
  { id: "heroicons", label: "Heroicons" },
  { id: "ri", label: "Remix Icon" },
  { id: "bi", label: "Bootstrap Icons" },
  { id: "carbon", label: "Carbon" },
  { id: "fluent", label: "Fluent" },
  { id: "iconoir", label: "Iconoir" },
  { id: "mingcute", label: "MingCute" },
  { id: "hugeicons", label: "Hugeicons" },
  { id: "mdi", label: "Material Design Icons" },
] as const;

export type SiteIconSetId = (typeof siteIconSets)[number]["id"];

export const defaultIconSet: SiteIconSetId = "ph";

export const siteIconSetIds = siteIconSets.map((set) => set.id) as SiteIconSetId[];
