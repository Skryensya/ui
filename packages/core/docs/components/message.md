# message

Category: content. Stylesheet: `@skryensya/core/components/message.css`. Signatures: `Message`, `MessageGroup`, `MessageAvatar`, `MessageContent`, `MessageHeader`, `MessageFooter`, `MessageActions`.

## Message

**Use when**

- one turn in a conversation needs row geometry: side, avatar, content and metadata
- start/end alignment communicates whether the message was received or sent
- the visible surface is supplied by the product: a Bubble, attachment preview, card or custom block

**Avoid when**

- the row is a generic notification or feed item; use Feed or List instead
- the avatar identifies authorship for a card, not a conversation turn; use Avatar in that composition

Alternatives: `Feed`, `List`, `Avatar.image`.

- React: `import { Message } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Options**

| Option | Values | Default |
|---|---|---|
| `align` | "start" \| "end" | `"start"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## MessageGroup

**Use when**

- consecutive messages from the same sender should stack with a shared avatar column

**Avoid when**

- messages come from different people or different times and should read as separate turns

Alternatives: `Message`.

- React: `import { MessageGroup } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

**Example** (canonical tree `message/conversation`; its copy is placeholder, replace it)

```tsx
import {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@skryensya/react/message";

export function MessageGroupExample() {
  return (
    <MessageGroup>
      <Message align="start">
        <MessageAvatar>R</MessageAvatar>
        <MessageContent>
          <MessageHeader>Robin</MessageHeader>Can you review this?<MessageFooter>14:32</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar />
        <MessageContent>
          On it.<MessageActions>Copy</MessageActions>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
```

```html
<div class="sk-message-group">
  <div class="sk-message" data-align="start">
    <div class="sk-message__avatar">R</div>
    <div class="sk-message__content"><div class="sk-message__header">Robin</div>Can you review this?<div class="sk-message__footer">14:32</div></div>
  </div>
  <div class="sk-message" data-align="end">
    <div class="sk-message__avatar"></div>
    <div class="sk-message__content">
      On it.<div class="sk-message__actions">Copy</div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/message.css`.

## MessageAvatar

**Use when**

- the row needs a speaker avatar, or an empty avatar slot to preserve grouped alignment

**Avoid when**

- the image is content inside the message rather than the speaker identity

Alternatives: `Avatar.image`, `Avatar.initials`.

- React: `import { MessageAvatar } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

## MessageContent

**Use when**

- header, message surface and footer need one aligned stack inside the conversation row

**Avoid when**

- there is no conversation row; the surface can stand on its own

Alternatives: `Box`.

- React: `import { MessageContent } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## MessageHeader

**Use when**

- sender name or compact metadata belongs above the message surface

**Avoid when**

- the name is already clear from surrounding context or repeated on every grouped message

Alternatives: `Text`.

- React: `import { MessageHeader } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## MessageFooter

**Use when**

- delivery state, time or edited state belongs below the message surface

**Avoid when**

- the content is an interactive control; use MessageActions for controls

Alternatives: `MessageActions`.

- React: `import { MessageFooter } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## MessageActions

**Use when**

- message-level controls such as copy, react or delete should travel with the message row
- the available actions depend on author or permissions, such as delete only on my messages

**Avoid when**

- the command acts on the whole conversation or selected messages; use Toolbar
- the action is primary content of the message rather than metadata around it

Alternatives: `Toolbar`.

- React: `import { MessageActions } from "@skryensya/react/message"`.
- HTML: a `<div>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-message-avatar-size`, `--sk-message-content-gap`, `--sk-message-footer-offset`, `--sk-message-gap`, `--sk-message-lane-size`, `--sk-message-group-gap`, `--sk-message-header-fg`, `--sk-message-header-font-size`, `--sk-message-footer-fg`, `--sk-message-footer-font-size`, `--sk-message-actions-gap`, `--sk-message-max-inline-size`.
