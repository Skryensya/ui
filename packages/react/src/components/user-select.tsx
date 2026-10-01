import { comboboxParts } from "@skryensya/core/combobox";
import { selectAttrs, selectParts, selectPositioning } from "@skryensya/core/select";
import { select } from "@skryensya/core/machines";
import { selectionParts } from "@skryensya/core/selection";
import {
  userSelectAttrs,
  userSelectContract,
  userSelectLabel,
  userSelectLabels,
  userSelectSearchKey,
  type UserSelectLabels,
} from "@skryensya/core/user-select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Avatar, AvatarGroup } from "./avatar.js";
import { Icon } from "./icon.js";
import { Loader } from "./loader.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

const { variant: variantOption } = userSelectContract.options;

export type UserSelectUser = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** What the avatar shows without a photo. Derived from `name` when absent. */
  initials?: string;
  disabled?: boolean;
};

export type UserSelectProps = {
  id?: string;
  /** Submitted under this name by the hidden native `<select multiple>`, same role as Select's own. */
  name?: string;
  users: readonly UserSelectUser[];
  /** The selection, controlled. Leave it out and pass `defaultValue` to let the component own it. */
  value?: readonly string[];
  /** The selection it opens with when uncontrolled: ids, as an array or space-separated. */
  defaultValue?: string | readonly string[];
  onValueChange?: (value: string[]) => void;
  /**
   * The noun for what is picked, plural: "users" by default. Every default string reads it
   * ("3 users", "No users available"), so `term="members"` relabels the whole picker in English.
   */
  term?: string;
  /**
   * Any of the composition's strings, as templates (`{term}`, `{count}`, `{name}`, `{query}`); see
   * `userSelectLabels` in `@skryensya/core/user-select` for every key and its default. Localizing
   * means passing these, since another language's sentences do not come from swapping one noun.
   */
  labels?: Partial<Omit<UserSelectLabels, "term">>;
  /** Shorthand for `labels.placeholder`. */
  placeholder?: string;
  /** Shorthand for `labels.searchPlaceholder`. */
  searchPlaceholder?: string;
  /** Shorthand for `labels.unselected`: shown in the trigger, beside an empty disc, while nobody is selected. */
  unselectedLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Caps the trigger's avatar stack; the rest collapse into `GroupedAvatar`'s own "+N". */
  maxAvatars?: number;
  className?: string;
  /**
   * How much body the trigger has. Defaults to `ghost`, unlike Select: the trigger shows faces and
   * names, and a bordered box around a row of avatars reads as a form field where a picker is meant.
   */
  variant?: (typeof userSelectContract.options.variant.values)[number];
  /** Where the floating listbox is portalled. See `Select`'s own prop of the same name. */
  container?: RefObject<HTMLElement>;
};

const toIds = (value: string | readonly string[] | undefined): string[] =>
  value === undefined ? [] : typeof value === "string" ? value.split(/\s+/).filter(Boolean) : [...value];

/*
 * THE DOM IS THE CONTRACT'S TEMPLATE (`userSelectContract`), element for element, and G2 holds this
 * binding and the Vanilla enhancer to it. That is why the inner pieces are plain elements carrying
 * the kit's classes rather than `Input`, `Button`, `Text` or `Inline`: those components add their own
 * attributes (a validation hook, an appearance, a ref'd value attribute) that authored markup does not
 * carry, and every one of them was a divergence between the two bindings.
 */
export function UserSelect({
  className,
  container,
  defaultValue,
  disabled,
  id,
  labels: labelOverrides,
  loading,
  maxAvatars = 3,
  name,
  onValueChange,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  term,
  unselectedLabel: unselectedProp,
  users,
  value: valueProp,
  variant = variantOption.default,
}: UserSelectProps) {
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const labels: UserSelectLabels = {
    ...userSelectLabels,
    ...labelOverrides,
    ...(term === undefined ? {} : { term }),
    ...(placeholderProp === undefined ? {} : { placeholder: placeholderProp }),
    ...(searchPlaceholderProp === undefined ? {} : { searchPlaceholder: searchPlaceholderProp }),
    ...(unselectedProp === undefined ? {} : { unselected: unselectedProp }),
  };
  const label = (key: Exclude<keyof UserSelectLabels, "term">, values?: Record<string, string | number>) =>
    userSelectLabel(labels, key, values);
  const placeholder = label("placeholder");
  const searchPlaceholder = label("searchPlaceholder");

  /*
   * SELECTED FIRST, decided when the list OPENS and then held: whoever was already picked sits at the
   * top where they can be reviewed at a glance, but ticking or unticking a row while the list is open
   * never moves it out from under the pointer. The next open re-sorts.
   */
  const initialValue = useMemo(() => (valueProp ? [...valueProp] : toIds(defaultValue)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [pinned, setPinned] = useState<readonly string[]>(initialValue);
  const orderedUsers = useMemo(() => {
    const first = new Set(pinned);
    return [...users.filter((user) => first.has(user.id)), ...users.filter((user) => !first.has(user.id))];
  }, [users, pinned]);

  // Folded once per user list, not once per row per keystroke, same precedent as Combobox's own
  // `searchKeys`. Name and email searched together so "mar" and an email-local-part both match.
  const searchKeys = useMemo(
    () => new Map(users.map((user) => [user.id, userSelectSearchKey(`${user.name} ${user.email ?? ""}`)])),
    [users],
  );
  const filteredUsers = useMemo(() => {
    const needle = userSelectSearchKey(query.trim());
    if (!needle) return orderedUsers;
    return orderedUsers.filter((user) => searchKeys.get(user.id)!.includes(needle));
  }, [orderedUsers, query, searchKeys]);

  const collection = useMemo(
    () =>
      select.collection<UserSelectUser>({
        items: [...filteredUsers],
        itemToString: (user) => user.name,
        itemToValue: (user) => user.id,
        isItemDisabled: (user) => Boolean(user.disabled),
      }),
    [filteredUsers],
  );

  const service = useMachine(select.machine, {
    id: machineId,
    collection,
    name,
    multiple: true,
    // The listbox is a `role="dialog"` wrapper around OUR search field plus a nested
    // `role="listbox"` (`getListProps`), not a listbox directly holding the field: `composite: true`
    // (the default) puts the listbox role and `aria-activedescendant` on the same element Select
    // itself focuses, which has no room for a text input as a child. `false` is what Zag ships this
    // split for.
    composite: false,
    // Multiple selection defaults this to `false` already (`select.machine.js`), stated explicitly
    // because "does not close on select" is the one behavior this whole component depends on.
    closeOnSelect: false,
    disabled,
    ...(valueProp ? { value: [...valueProp] } : { defaultValue: initialValue }),
    positioning: selectPositioning,
    // The clear button's accessible name is its visible text, not Zag's own "Clear value".
    translations: { clearTriggerLabel: label("clear") },
    onValueChange(details: { value: string[] }) {
      onValueChange?.([...details.value]);
    },
    // Every open starts from the full roster, never a stale filtered view. Cleared on OPEN rather
    // than on close: closing is an exit transition, and clearing then brought every filtered-out row
    // back into the box while it was still fading out. A new order also starts at its top.
    onOpenChange(details: { open: boolean }) {
      if (!details.open) return;
      setQuery("");
      if (searchRef.current) searchRef.current.value = "";
      setPinned(valueRef.current);
      listRef.current?.scrollTo({ top: 0 });
    },
  });
  const api = select.connect(service, normalizeProps);
  const anchor = useAnchored(machineId);

  const value = api.value;
  const valueRef = useRef(value);
  valueRef.current = value;

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const selectedUsers = value
    .map((userId) => usersById.get(userId))
    .filter((user): user is UserSelectUser => user != null);

  const selectionLabel =
    selectedUsers.length === 0
      ? placeholder
      : selectedUsers.length === 1
        ? `${placeholder}, ${label("selectedOne", { name: selectedUsers[0]!.name })}`
        : `${placeholder}, ${label("selectedMany", { count: selectedUsers.length })}`;

  // Content's own `onKeyDown` (bubbled up from the search input below) maps Space to "toggle the
  // highlighted user", same as Enter: correct for a bare listbox, wrong for a live text field where
  // a person types "Jane Cooper". Stopping it here before it reaches that handler is the one place
  // this component's search behavior has to diverge from a plain reused listbox, and only for that
  // one key; Enter, the arrows, Home and End all still reach it and drive the list untouched.
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") event.stopPropagation();
  };

  const resultsStatus = !api.open
    ? null
    : loading
      ? label("loading")
      : filteredUsers.length === 0
        ? users.length === 0
          ? label("empty")
          : label("noResults", { query: query.trim() })
        : filteredUsers.length === 1
          ? label("result")
          : label("results", { count: filteredUsers.length });

  const noRoster = users.length === 0;
  // The summary avatar is the row's own, drawn again: same props, so the same DOM the Vanilla
  // enhancer gets by cloning the row's authored one.
  const avatarOf = (user: UserSelectUser) => (
    <Avatar aria-hidden="true" key={user.id} name={user.name} size="sm" src={user.avatarUrl}>
      {user.initials}
    </Avatar>
  );

  return (
    <div
      {...api.getRootProps()}
      className={cx(selectParts.root, className)}
      data-loading={loading ? "" : undefined}
      data-variant={variant}
      ref={rootRef}
      {...{ [userSelectAttrs.root]: "" }}
    >
      <select {...api.getHiddenSelectProps()} {...{ [selectAttrs.hidden]: "" }}>
        {users.map((user) => (
          <option disabled={user.disabled} key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <div {...api.getControlProps()} className={selectParts.control} {...{ [selectAttrs.control]: "" }}>
        <button
          {...api.getTriggerProps()}
          {...anchor.anchor(`${selectParts.trigger} sk-interactive`)}
          {...{ [selectAttrs.trigger]: "" }}
          aria-label={selectionLabel}
          aria-labelledby={undefined}
          type="button"
        >
          {/* Decorative: the button's own `aria-label` above is the one textual representation a
              screen reader gets, so it never has to parse a name next to a stack of avatar images. */}
          <span aria-hidden="true" className={selectParts.value} {...{ [selectAttrs.value]: "" }}>
            {selectedUsers.length === 0 ? (
              <span {...{ [userSelectAttrs.unselected]: "" }}>
                <span className="sk-avatar" data-size="sm">
                  <Icon name="user" size="sm" />
                </span>
                {label("unselected")}
              </span>
            ) : (
              <span className="sk-inline" data-align="center" data-gap="sm" data-wrap="false">
                {selectedUsers.length === 1 ? (
                  avatarOf(selectedUsers[0]!)
                ) : (
                  <AvatarGroup max={maxAvatars}>{selectedUsers.map(avatarOf)}</AvatarGroup>
                )}
                <span className={selectParts.value}>
                  {selectedUsers.length === 1 ? selectedUsers[0]!.name : label("count", { count: selectedUsers.length })}
                </span>
              </span>
            )}
          </span>
          <span
            {...api.getIndicatorProps()}
            aria-hidden="true"
            className={selectParts.indicator}
            {...{ [selectAttrs.indicator]: "" }}
          >
            <span data-state="closed">
              <Icon name="chevron-down" />
            </span>
            <span data-state="open">
              <Icon name="chevron-up" />
            </span>
          </span>
        </button>
      </div>
      <Portal container={container}>
        <div
          {...anchor.positioner(api.getPositionerProps(), selectParts.positioner)}
          {...{ [selectAttrs.positioner]: "" }}
        >
          <div {...api.getContentProps()} className={selectParts.content} {...{ [selectAttrs.content]: "" }}>
            {/* Uncontrolled: a controlled input writes a `value` attribute authored markup never has. */}
            <input
              aria-label={searchPlaceholder}
              className="sk-input"
              data-size="sm"
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              ref={searchRef}
              type="search"
              {...{ [userSelectAttrs.search]: "" }}
            />
            <div
              aria-atomic="true"
              className={cx(comboboxParts.status, "sk-visually-hidden")}
              role="status"
              {...{ [userSelectAttrs.status]: "" }}
            >
              {resultsStatus}
            </div>
            {/* The same two nodes as the Vanilla binding: a loading row before the list, and the list
                hidden while it shows, so one tree renders one DOM in both. */}
            <div className={comboboxParts.empty} hidden={!loading} role="presentation" {...{ [userSelectAttrs.loading]: "" }}>
              <Loader size="sm" /> {label("loading")}
            </div>
            {/* `tabIndex={-1}`: `getListProps()` defaults it to 0 for a STANDALONE listbox
                (`composite: false`'s other use case), but here the search input is the one real tab
                stop; the list is reached through it via `aria-activedescendant`, never by Tab. */}
            <div
              {...api.getListProps()}
              className="sk-scrollbar"
              ref={listRef}
              hidden={loading}
              tabIndex={-1}
              {...{ [userSelectAttrs.list]: "" }}
            >
              {filteredUsers.map((user) => (
                <div
                  {...api.getItemProps({ item: user })}
                  className={cx(selectParts.item, "sk-interactive")}
                  key={user.id}
                  {...{ [selectAttrs.item]: "" }}
                >
                  {/* Decorative: the option's own `aria-selected` is the state; this box only shows it.
                      Checked from the row's `data-state` in CSS, so it needs no state of its own. */}
                  <span aria-hidden="true" className={selectionParts.checkbox} {...{ [userSelectAttrs.check]: "" }}>
                    <span className={selectionParts.checkboxControl}>
                      <span className={selectionParts.checkboxIndicator} data-state="checked">
                        <Icon name="check" size="sm" />
                      </span>
                    </span>
                  </span>
                  <span className="sk-inline" data-align="center" data-gap="sm" data-wrap="false">
                    {avatarOf(user)}
                    <span className={comboboxParts.itemCopy}>
                      <span
                        {...api.getItemTextProps({ item: user })}
                        className={selectParts.itemText}
                        {...{ [selectAttrs.itemText]: "" }}
                      >
                        {user.name}
                      </span>
                      {user.email ? (
                        <span className={cx(selectParts.itemText, comboboxParts.itemDescription)}>{user.email}</span>
                      ) : null}
                    </span>
                  </span>
                </div>
              ))}
              <div
                className={comboboxParts.empty}
                hidden={filteredUsers.length > 0}
                role="presentation"
                {...{ [userSelectAttrs.empty]: "" }}
              >
                <span aria-hidden="true" {...{ [userSelectAttrs.emptyIcon]: "" }}>
                  <Icon name={noRoster ? "user" : "search"} />
                </span>
                <span {...{ [userSelectAttrs.emptyTitle]: "" }}>
                  {noRoster ? label("empty") : label("noResults", { query: query.trim() })}
                </span>
                <span hidden={noRoster} {...{ [userSelectAttrs.emptyHint]: "" }}>
                  {noRoster ? "" : label("noResultsHint")}
                </span>
              </div>
            </div>
            <span
              className="sk-inline"
              data-align="center"
              data-gap="sm"
              data-justify="between"
              hidden={value.length === 0}
              {...{ [userSelectAttrs.footer]: "" }}
            >
              <span className="sk-text" data-size="caption" data-tone="secondary" {...{ [userSelectAttrs.count]: "" }}>
                {label("selectedCount", { count: value.length })}
              </span>
              <button
                {...api.getClearTriggerProps()}
                className="sk-button sk-interactive"
                data-size="sm"
                data-variant="ghost"
                type="button"
                {...{ [userSelectAttrs.clear]: "" }}
              >
                {label("clear")}
              </button>
            </span>
          </div>
        </div>
      </Portal>
    </div>
  );
}
