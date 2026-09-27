import { comboboxParts } from "@skryensya/core/combobox";
import { selectAttrs, selectParts, selectPositioning, type SelectOptions } from "@skryensya/core/select";
import { select } from "@skryensya/core/machines";
import { selectionParts } from "@skryensya/core/selection";
import {
  userSelectAttrs,
  userSelectLabel,
  userSelectLabels,
  userSelectSearchKey,
  type UserSelectLabels,
} from "@skryensya/core/user-select";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Avatar, AvatarGroup } from "./avatar.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
import { Input } from "./input.js";
import { Inline } from "./layout.js";
import { Loader } from "./loader.js";
import { Text } from "./typography.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type UserSelectUser = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  disabled?: boolean;
};

export type UserSelectProps = {
  id?: string;
  /** Submitted under this name by the hidden native `<select multiple>`, same role as Select's own. */
  name?: string;
  users: readonly UserSelectUser[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
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
   * Select's `variant`. Defaults to `ghost`, unlike Select: the trigger shows faces and names, and
   * a bordered box around a row of avatars reads as a form field where a picker is meant.
   */
  variant?: SelectOptions["variant"];
  /** Where the floating listbox is portalled. See `Select`'s own prop of the same name. */
  container?: RefObject<HTMLElement>;
};

export function UserSelect({
  className,
  container,
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
  value,
  variant = "ghost",
}: UserSelectProps) {
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
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

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const selectedUsers = useMemo(
    () => value.map((userId) => usersById.get(userId)).filter((user): user is UserSelectUser => user != null),
    [value, usersById],
  );

  // Folded once per user list, not once per row per keystroke, same precedent as Combobox's own
  // `searchKeys`. Name and email searched together so "mar" and an email-local-part both match.
  /*
   * SELECTED FIRST, decided when the list OPENS and then held: whoever was already picked sits at the
   * top where they can be reviewed at a glance, but ticking or unticking a row while the list is open
   * never moves it out from under the pointer. The next open re-sorts.
   */
  const listRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [pinned, setPinned] = useState<readonly string[]>(() => value);
  const orderedUsers = useMemo(() => {
    const first = new Set(pinned);
    return [...users.filter((user) => first.has(user.id)), ...users.filter((user) => !first.has(user.id))];
  }, [users, pinned]);

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
    value: [...value],
    positioning: selectPositioning,
    onValueChange(details: { value: string[] }) {
      onValueChange([...details.value]);
    },
    // The search is the user's work-in-progress the same way Combobox's typed query is; closing
    // clears it so the next open starts from the full roster, never a stale filtered view.
    onOpenChange(details: { open: boolean }) {
      // A new order starts at its top: a scroll offset kept from the last open would land mid-list.
      if (details.open) listRef.current?.scrollTo({ top: 0 });
      if (details.open) setPinned(valueRef.current);
      else setQuery("");
    },
  });
  const api = select.connect(service, normalizeProps);
  const anchor = useAnchored(machineId);

  const selectionLabel =
    selectedUsers.length === 0
      ? placeholder
      : selectedUsers.length === 1
        ? `${placeholder}, ${label("selectedOne", { name: selectedUsers[0]!.name })}`
        : `${placeholder}, ${label("selectedMany", { count: selectedUsers.length })}`;

  const triggerProps = api.getTriggerProps();

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
      : filteredUsers.length === 1
        ? label("result")
        : label("results", { count: filteredUsers.length });

  return (
    <div
      className={cx(selectParts.root, className)}
      data-variant={variant}
      ref={rootRef}
      {...{ [selectAttrs.root]: "", [userSelectAttrs.root]: "" }}
    >
      <select {...api.getHiddenSelectProps()} {...{ [selectAttrs.hidden]: "" }}>
        {users.map((user) => (
          <option disabled={user.disabled} key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <div className={selectParts.control} {...{ [selectAttrs.control]: "" }}>
        <button
          {...triggerProps}
          {...anchor.anchor(`${selectParts.trigger} sk-interactive`)}
          {...{ [selectAttrs.trigger]: "" }}
          aria-label={selectionLabel}
          aria-labelledby={undefined}
          type="button"
        >
          {/* Decorative: the button's own `aria-label` above is the one textual representation a
              screen reader gets, so it never has to parse a name next to a stack of avatar images. */}
          {selectedUsers.length === 0 ? (
            <span
              {...api.getValueTextProps()}
              aria-hidden="true"
              className={selectParts.value}
              {...{ [selectAttrs.value]: "" }}
            >
              <span {...{ [userSelectAttrs.unselected]: "" }}>
                <span className="sk-avatar" data-size="sm">
                  <Icon name="user" />
                </span>
                {label("unselected")}
              </span>
            </span>
          ) : (
            <Inline
              {...api.getValueTextProps()}
              align="center"
              aria-hidden="true"
              as="span"
              className={selectParts.value}
              gap="sm"
              wrap={false}
              {...{ [selectAttrs.value]: "" }}
            >
              {selectedUsers.length === 1 ? (
                <Avatar name={selectedUsers[0]!.name} size="sm" src={selectedUsers[0]!.avatarUrl} />
              ) : (
                <AvatarGroup max={maxAvatars}>
                  {selectedUsers.map((user) => (
                    <Avatar key={user.id} name={user.name} size="sm" src={user.avatarUrl} />
                  ))}
                </AvatarGroup>
              )}
              <span className={selectParts.value}>
                {selectedUsers.length === 1 ? selectedUsers[0]!.name : label("count", { count: selectedUsers.length })}
              </span>
            </Inline>
          )}
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
            <Input
              aria-label={searchPlaceholder}
              controlSize="sm"
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              type="search"
              value={query}
            />
            <div aria-atomic="true" className={cx(comboboxParts.status, "sk-visually-hidden")} role="status">
              {resultsStatus}
            </div>
            {loading ? (
              <div className={comboboxParts.empty} role="presentation">
                <Loader size="sm" /> {label("loading")}
              </div>
            ) : users.length === 0 ? (
              <div className={comboboxParts.empty} role="presentation" {...{ [userSelectAttrs.empty]: "" }}>
                <span aria-hidden="true" {...{ [userSelectAttrs.emptyIcon]: "" }}>
                  <Icon name="user" />
                </span>
                <span {...{ [userSelectAttrs.emptyTitle]: "" }}>{label("empty")}</span>
              </div>
            ) : (
              // `tabIndex={-1}`: `getListProps()` defaults it to 0 for a STANDALONE listbox
              // (`composite: false`'s other use case), but here the search input is the one real tab
              // stop; the list is reached through it via `aria-activedescendant`, never by Tab.
              <div
                {...api.getListProps()}
                className="sk-scrollbar"
                ref={listRef}
                tabIndex={-1}
                {...{ [userSelectAttrs.list]: "" }}
              >
                {filteredUsers.map((user) => (
                  <div
                    {...api.getItemProps({ item: user })}
                    className={cx(selectParts.item, "sk-interactive")}
                    key={user.id}
                  >
                    {/* Decorative: the option's own `aria-selected` is the state; this box only shows it.
                        Checked from the row's `data-state` in CSS, so it needs no state of its own. */}
                    <span aria-hidden="true" className={selectionParts.checkbox} {...{ [userSelectAttrs.check]: "" }}>
                      <span className={selectionParts.checkboxControl}>
                        <span className={selectionParts.checkboxIndicator} data-state="checked">
                          <Icon name="check" />
                        </span>
                      </span>
                    </span>
                    <Inline align="center" as="span" gap="sm" wrap={false}>
                      <Avatar aria-hidden="true" name={user.name} size="sm" src={user.avatarUrl} />
                      <span className={comboboxParts.itemCopy}>
                        <span {...api.getItemTextProps({ item: user })} className={selectParts.itemText}>
                          {user.name}
                        </span>
                        {user.email ? (
                          <span className={cx(selectParts.itemText, comboboxParts.itemDescription)}>
                            {user.email}
                          </span>
                        ) : null}
                      </span>
                    </Inline>
                  </div>
                ))}
                {filteredUsers.length === 0 ? (
                  <div className={comboboxParts.empty} role="presentation" {...{ [userSelectAttrs.empty]: "" }}>
                    <span aria-hidden="true" {...{ [userSelectAttrs.emptyIcon]: "" }}>
                      <Icon name="search" />
                    </span>
                    <span {...{ [userSelectAttrs.emptyTitle]: "" }}>{label("noResults", { query: query.trim() })}</span>
                    <span {...{ [userSelectAttrs.emptyHint]: "" }}>{label("noResultsHint")}</span>
                  </div>
                ) : null}
              </div>
            )}
            {value.length > 0 ? (
              <Inline align="center" as="span" gap="sm" justify="between" {...{ [userSelectAttrs.footer]: "" }}>
                <Text as="span" size="caption" tone="secondary">
                  {label("selectedCount", { count: value.length })}
                </Text>
                <Button onClick={() => api.clearValue()} size="sm" variant="ghost">
                  {label("clear")}
                </Button>
              </Inline>
            ) : null}
          </div>
        </div>
      </Portal>
    </div>
  );
}
