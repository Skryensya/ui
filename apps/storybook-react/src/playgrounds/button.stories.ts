import "@skryensya/core/components/button.css";
import "@skryensya/core/patterns/icon.css";
import {
  buttonPlaygroundArgs,
  buttonPlaygroundArgTypes,
  buttonPlaygroundTree,
  type ButtonPlaygroundArgs,
} from "@skryensya/storybook-kit/button-playground";
import { argsStory, type Meta, type StoryObj } from "../tree-story";

export default { title: "Playground/Button" } satisfies Meta;

export const Playground: StoryObj<ButtonPlaygroundArgs> = argsStory(buttonPlaygroundTree, {
  args: buttonPlaygroundArgs,
  argTypes: buttonPlaygroundArgTypes,
});
