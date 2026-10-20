<script lang="ts">
  import { comboboxParts } from "@skryensya/core/combobox";
  import { selectAttrs, selectParts } from "@skryensya/core/select";
  import { selectionParts } from "@skryensya/core/selection";
  import { userSelectAttrs } from "@skryensya/core/user-select";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply.js";
  import { createVirtualizer } from "../runtime/virtualizer.svelte.js";
  import { buildAvatar, type AvatarLike } from "../avatar-dom.js";
  import { remountIcons } from "../icon.js";

  export type GeneratedUser = AvatarLike & { id: string; email?: string; disabled?: boolean };

  /* Same exception, same reasoning as `SelectItems.svelte`'s own banner: generated rather than
     adopted because a roster this size cannot be hand-authored, mounted onto `list` the same way
     `attachColumnResizer` mounts `ColumnResizer.svelte` onto a handle it creates itself. */
  type ItemProps = (props: { item: { value: string; label: string; disabled?: boolean } }) => object;

  let {
    getUsers,
    scrollElement,
    getApi,
    estimateItemSize,
    onReady,
  }: {
    /* A closure, read fresh on every row patch and inside the virtualizer's own reactive options -
       not a plain array prop, which `mount()` only reads once: typing in the search field replaces
       it with a new, filtered array on every keystroke. */
    getUsers: () => readonly GeneratedUser[];
    scrollElement: HTMLElement;
    getApi: () => {
      getItemProps: ItemProps;
      getItemTextProps: ItemProps;
      highlightedValue: string | null;
    };
    estimateItemSize: number;
    onReady: (scrollToIndex: (index: number, options?: { align?: string; behavior?: string }) => void) => void;
  } = $props();

  const toItem = (user: GeneratedUser) => ({ value: user.id, label: user.name, disabled: user.disabled });

  const virtualizer = createVirtualizer<HTMLElement, HTMLDivElement>(() => ({
    count: getUsers().length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateItemSize,
    gap: 2, // `[data-sk-user-select-list]`'s own `gap: 2px` (`user-select.css`)
    overscan: 8,
    getItemKey: (index) => getUsers()[index]!.id,
  }));

  $effect(() => {
    onReady((index, options) => virtualizer.instance.scrollToIndex(index, options as never));
  });

  $effect(() => {
    void virtualizer.items;
    remountIcons(scrollElement);
  });

  function zagPart(node: HTMLElement, getProps: () => object) {
    $effect(() => {
      applyZagProps(node, getProps() as DomProps);
    });
    return { destroy: bindZagEvents(node, () => getProps() as DomProps) };
  }

  function measureRow(node: HTMLDivElement) {
    virtualizer.instance.measureElement(node);
  }

  function mountAvatar(node: HTMLElement, user: GeneratedUser) {
    node.append(buildAvatar(user, "sm"));
  }

  function mountCheck(node: HTMLElement) {
    const glyph = document.createElement("span");
    glyph.dataset.skIcon = "check";
    glyph.dataset.skIconSize = "sm";
    node.append(glyph);
    remountIcons(node);
  }
</script>

<div aria-hidden="true" style:height="{virtualizer.totalSize}px"></div>

{#each virtualizer.items as virtualRow (virtualRow.key)}
  {@const user = getUsers()[virtualRow.index]}
  {#if user}
    <div
      use:zagPart={() => ({
        ...getApi().getItemProps({ item: toItem(user) }),
        "aria-selected": user.id === getApi().highlightedValue ? "true" : undefined,
      })}
      use:measureRow
      class="{selectParts.item} sk-interactive"
      data-index={virtualRow.index}
      {...{ [selectAttrs.item]: "" }}
      style:position="absolute"
      style:top="0"
      style:inset-inline-start="0"
      style:inline-size="100%"
      style:transform="translateY({virtualRow.start}px)"
    >
      <span aria-hidden="true" class={selectionParts.checkbox} {...{ [userSelectAttrs.check]: "" }}>
        <span class={selectionParts.checkboxControl}>
          <span class={selectionParts.checkboxIndicator} data-state="checked" use:mountCheck></span>
        </span>
      </span>
      <span class="sk-inline" data-align="center" data-gap="sm" data-wrap="false">
        <span use:mountAvatar={user}></span>
        <span class={comboboxParts.itemCopy}>
          <span
            use:zagPart={() => getApi().getItemTextProps({ item: toItem(user) })}
            class={selectParts.itemText}
            {...{ [selectAttrs.itemText]: "" }}
          >
            {user.name}
          </span>
          {#if user.email}
            <span class="{selectParts.itemText} {comboboxParts.itemDescription}">{user.email}</span>
          {/if}
        </span>
      </span>
    </div>
  {/if}
{/each}
