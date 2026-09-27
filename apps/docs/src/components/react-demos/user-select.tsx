/*
 * Live React demo for /components/user-select. Self-contained island (no function props crossing
 * the Astro boundary): `UserSelect` is fully controlled, so `value` lives here as `useState`, same
 * shape any real consumer's would.
 */
import { UserSelect, type UserSelectUser } from "@skryensya/react/user-select";
import { useState } from "react";
import { userSelectRoster } from "../../demos/data/user-select";
import { userSelectMessages } from "../../i18n/messages/components/user-select";
import { framedIn } from "./framed";

const framed = framedIn("user-select");

const users: UserSelectUser[] = userSelectRoster.map(({ id, name, email, disabled }) => ({
  id,
  name,
  email,
  disabled,
}));

type DemoProps = { lang?: "es" | "en" };

/* The same `userSelectPage.label.*` messages the Vanilla stage reads, so both halves say the same thing. */
const labelsFor = (lang: "es" | "en") => {
  const messages = userSelectMessages[lang] as Record<string, string>;
  const prefix = "userSelectPage.label.";
  return Object.fromEntries(
    Object.entries(messages)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, text]) => [key.slice(prefix.length), text]),
  );
};

export const UserSelectBasicDemo = framed(function UserSelectBasicDemo({ lang = "es" }: DemoProps) {
  const [value, setValue] = useState<string[]>(["jane"]);

  return (
    <UserSelect
      labels={labelsFor(lang)}
      onValueChange={setValue}
      term={labelsFor(lang).term}
      users={users}
      value={value}
    />
  );
}, { viewport: "menu-deep" });

/** The loading branch: no `useState` needed, `loading` is a static prop here. */
export const UserSelectLoadingDemo = framed(function UserSelectLoadingDemo({ lang = "es" }: DemoProps) {
  return (
    <UserSelect
      labels={labelsFor(lang)}
      loading
      onValueChange={() => {}}
      term={labelsFor(lang).term}
      users={users}
      value={[]}
    />
  );
}, { viewport: "menu" });
