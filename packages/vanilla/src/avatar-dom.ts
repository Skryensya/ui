import { avatarInitials, avatarParts } from "@skryensya/core/avatar";
import { imageFrameParts } from "@skryensya/core/image-frame";

export type AvatarLike = { name: string; avatarUrl?: string; initials?: string };

/*
 * Builds the same markup `Avatar` renders, for the one spot in Vanilla that has no authored node to
 * clone: a `data-sk-user-select-items`-generated row (`UserSelectItems.svelte`) and the trigger
 * summary built from it (`UserSelect.svelte`). Every OTHER Avatar on the page is hand-authored HTML
 * `Avatar.svelte` only patches, same as everywhere else in this binding - this is the one exception,
 * for the same reason `SelectItems.svelte`'s rows are generated rather than adopted.
 */
export function buildAvatar(user: AvatarLike, size: "sm" | "md" | "lg" = "sm"): HTMLSpanElement {
  const root = document.createElement("span");
  root.className = avatarParts.root;
  root.dataset.size = size;

  const fallback = () => {
    root.replaceChildren();
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", user.name);
    const span = document.createElement("span");
    span.className = avatarParts.fallback;
    span.setAttribute("aria-hidden", "true");
    span.textContent = user.initials || avatarInitials(user.name);
    root.append(span);
  };

  if (!user.avatarUrl) {
    fallback();
    return root;
  }

  const frame = document.createElement("span");
  frame.className = imageFrameParts.root;
  frame.dataset.aspect = "1/1";
  frame.dataset.fit = "cover";
  frame.dataset.radius = "pill";
  const img = document.createElement("img");
  img.className = imageFrameParts.media;
  img.src = user.avatarUrl;
  img.alt = user.name;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", fallback, { once: true });
  frame.append(img);
  root.append(frame);
  return root;
}
