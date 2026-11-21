/*
 * The set every test render binds (see test-setup.ts), built from the same Iconify collection a
 * consumer installs. Test-only: a consumer writes theirs with `skryensya icons <set>`, so the JSON
 * never reaches a browser bundle. The heavier collections are loaded only by icon.test.tsx.
 */
import lucide from "@iconify-json/lucide/icons.json" with { type: "json" };
import { iconSetFromIconify, iconifyPresets } from "@skryensya/core/iconify";

export const lucideIcons = iconSetFromIconify(lucide, iconifyPresets.lucide!);
