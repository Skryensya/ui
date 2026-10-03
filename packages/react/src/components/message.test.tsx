import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Message, MessageActions, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "./message.js";

describe("Message", () => {
  it("renders the conversation row and defaults to start alignment", () => {
    const ui = render(
      <Message>
        <MessageAvatar />
        <MessageContent>Hello</MessageContent>
      </Message>,
    );
    const root = ui.container.querySelector(".sk-message")!;
    expect(root.getAttribute("data-align")).toBe("start");
    expect(root.querySelector(".sk-message__avatar")).not.toBeNull();
    expect(root.querySelector(".sk-message__content")?.textContent).toBe("Hello");
  });

  it("serializes end alignment", () => {
    const ui = render(<Message align="end"><MessageContent>Sent</MessageContent></Message>);
    expect(ui.container.querySelector(".sk-message")?.getAttribute("data-align")).toBe("end");
  });

  it("renders header and footer metadata inside content", () => {
    const ui = render(
      <Message>
        <MessageContent>
          <MessageHeader>Robin</MessageHeader>
          <div>Hi</div>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>,
    );
    expect(ui.container.querySelector(".sk-message__header")?.textContent).toBe("Robin");
    expect(ui.container.querySelector(".sk-message__footer")?.textContent).toBe("Delivered");
  });

  it("renders action controls", () => {
    const ui = render(
      <Message>
        <MessageContent>
          <MessageActions><button type="button">Copy</button></MessageActions>
        </MessageContent>
      </Message>,
    );
    expect(ui.container.querySelector(".sk-message__actions")?.textContent).toBe("Copy");
  });

  it("groups consecutive messages", () => {
    const ui = render(
      <MessageGroup>
        <Message><MessageContent>One</MessageContent></Message>
        <Message><MessageContent>Two</MessageContent></Message>
      </MessageGroup>,
    );
    expect(ui.container.querySelector(".sk-message-group")?.querySelectorAll(".sk-message")).toHaveLength(2);
  });

  it("keeps consumer classes", () => {
    const ui = render(<Message className="mine"><MessageContent className="content">Hi</MessageContent></Message>);
    expect(ui.container.querySelector(".sk-message")?.classList.contains("mine")).toBe(true);
    expect(ui.container.querySelector(".sk-message__content")?.classList.contains("content")).toBe(true);
  });
});
