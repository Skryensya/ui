# comment-thread

Category: content. Stylesheet: `@skryensya/core/components/comment-thread.css`. Signatures: `CommentThread`, `Comment`, `CommentActions`, `CommentVote`, `CommentTemplate`, `CommentComposer`.

## CommentThread

**Use when**

- there is a conversation with nested replies and it needs a container that names it

**Avoid when**

- the stream is flat, with no nested replies; that is a Feed
- it is a selectable hierarchy (files, an index); that is a TreeView
- there is one comment and nothing around it; that is a single Comment

Alternatives: `Feed`, `TreeView`.

- React: `import { CommentThread } from "@skryensya/react/comment-thread"`.
- HTML: a `<div>` with `data-sk-comment-thread`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `composerTriggerLabel` | string | `"Write a comment"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `composer` | one of `CommentComposer` |  |
| `children` | one of `Comment` | yes |

**Example** (canonical tree `comment-thread/comment`; its copy is placeholder, replace it)

```tsx
import { Avatar } from "@skryensya/react/avatar";
import { Comment, CommentThread } from "@skryensya/react/comment-thread";

export function CommentThreadExample() {
  return (
    <CommentThread label="Comentarios">
      <Comment
        avatar={<Avatar size="sm" name="Ada">Ad</Avatar>}
        author="Ada"
        timestamp="hace 3h"
      >
        El deploy quedó bien, gracias por revisar.
      </Comment>
    </CommentThread>
  );
}
```

```html
<div
  class="sk-comment-thread"
  data-sk-comment-thread
  aria-label="Comentarios"
  data-composer-trigger-label="Write a comment"
>
  <article
    class="sk-comment"
    data-sk-comment
    data-collapse-label="Hide replies"
  >
    <div class="sk-comment__self">
      <div class="sk-comment__profile">
        <span class="sk-comment__avatar" data-sk-comment-avatar>
          <span
            class="sk-avatar"
            data-size="sm"
            data-appearance="plain"
            aria-label="Ada"
            role="img"
          >
            <span class="sk-avatar__fallback" aria-hidden="true">Ad</span>
          </span>
        </span>
        <div class="sk-comment__author" data-sk-comment-author>Ada</div>
      </div>
      <div class="sk-comment__header">
        <div class="sk-comment__timestamp" data-sk-comment-timestamp>
          hace 3h
        </div>
      </div>
      <div class="sk-comment__gutter"></div>
      <div class="sk-comment__content">
        <div class="sk-comment__body" data-sk-comment-body>
          El deploy quedó bien, gracias por revisar.
        </div>
      </div>
    </div>
  </article>
</div>
```

Stylesheets: `@skryensya/core/components/avatar.css`, `@skryensya/core/components/button.css`, `@skryensya/core/components/comment-thread.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Comment

**Use when**

- one unit of conversation: who wrote it, when, and what it said
- a comment has to be quoted outside its thread; it needs no container

**Avoid when**

- it is content of a flat stream with no replies; that is a FeedArticle

Alternatives: `FeedArticle`.

- React: `import { Comment } from "@skryensya/react/comment-thread"`.
- HTML: a `<article>` with `data-sk-comment`, enhanced by Vanilla's mount.

- Goes inside: `CommentThread`, `Comment`, `CommentTemplate`.

**Options**

| Option | Values | Default |
|---|---|---|
| `commentId` (React: `id`) | string |  |
| `profileHref` | string |  |
| `collapsible` | boolean | `false` |
| `collapseLabel` | string | `"Hide replies"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `avatar` | node |  |
| `author` | node | yes |
| `timestamp` | text |  |
| `children` | node | yes |
| `actions` | node |  |
| `replies` | one of `Comment` |  |
| `replyComposer` | one of `CommentComposer` |  |

## CommentActions

**Use when**

- a comment takes actions: vote, reply, delete

**Avoid when**

- the comment is read-only; then this is simply not composed
- it is an action bar for a whole view, not for one unit of content; that is a Toolbar

Alternatives: `Toolbar`.

- React: `import { CommentActions } from "@skryensya/react/comment-thread"`.
- HTML: a `<div>` with `data-sk-comment-actions`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `reply` | boolean | `false` |
| `replyLabel` | string | `"Reply"` |
| `deletable` | boolean | `false` |
| `deleteLabel` | string | `"Delete"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

## CommentVote

**Use when**

- there is a score that goes up or down, with the reader's own vote reflected
- the product reacts rather than ranks, with like and dislike instead of upvote and downvote: `voteStyle: "like"` draws thumbs, and both labels are then passed (`Like`, `Dislike`, or the product's own words)

**Avoid when**

- it is a single rating with no direction (a like); that is a StateButton

Alternatives: `StateButton`.

- React: `import { CommentVote } from "@skryensya/react/comment-thread"`.
- HTML: a `<div>` with `data-sk-comment-vote`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `voted` | "up" \| "down" \| "none" | `"none"` |
| `voteStyle` | "vote" \| "like" | `"vote"` |
| `voteUpLabel` | string | `"Upvote"` |
| `voteDownLabel` | string | `"Downvote"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `count` | text | yes |

**Example** (canonical tree `comment-thread/vote-like`; its copy is placeholder, replace it)

```tsx
import { CommentVote } from "@skryensya/react/comment-thread";

export function CommentVoteExample() {
  return (
    <CommentVote
      voted="up"
      voteStyle="like"
      voteUpLabel="Me gusta"
      voteDownLabel="No me gusta"
      count="12"
    />
  );
}
```

```html
<div
  class="sk-comment-vote"
  data-sk-comment-vote
  data-voted="up"
  data-vote-style="like"
  data-vote-up-label="Me gusta"
  data-vote-down-label="No me gusta"
>
  <button
    class="sk-comment-vote__up sk-button sk-interactive"
    data-sk-comment-vote-up
    type="button"
    aria-pressed="true"
    data-icon-only
    data-size="sm"
    data-variant="ghost"
  >
    <span aria-hidden="true">
      <span data-sk-icon="like" data-sk-icon-size="md"></span>
    </span>
    <span class="sk-visually-hidden">Me gusta</span>
  </button>
  <span class="sk-comment-vote__count" data-sk-comment-vote-count>12</span>
  <button
    class="sk-comment-vote__down sk-button sk-interactive"
    data-sk-comment-vote-down
    type="button"
    aria-pressed="false"
    data-icon-only
    data-size="sm"
    data-variant="ghost"
  >
    <span aria-hidden="true">
      <span data-sk-icon="dislike" data-sk-icon-size="md"></span>
    </span>
    <span class="sk-visually-hidden">No me gusta</span>
  </button>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/comment-thread.css`, `@skryensya/core/patterns/visually-hidden.css`.

## CommentTemplate

**Use when**

- the app creates comments at runtime and needs a blueprint to clone

**Avoid when**

- the markup is re-rendered whole; in React it is not needed, it simply renders again
- what is created is a transient notice and not a comment; that is a ToastTemplate

Alternatives: `ToastTemplate`.

- React: `import { CommentTemplate } from "@skryensya/react/comment-thread"`.
- HTML: a `<template>`, no JavaScript needed.

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `Comment` | yes |

**Example** (canonical tree `comment-thread/template`; its copy is placeholder, replace it)

```tsx
import { Comment, CommentTemplate } from "@skryensya/react/comment-thread";

export function CommentTemplateExample() {
  return (
    <CommentTemplate>
      <Comment author="Ada" timestamp="hace 3h">
        Una respuesta que todavía no existe.
      </Comment>
    </CommentTemplate>
  );
}
```

```html
<template>
  <article
    class="sk-comment"
    data-sk-comment
    data-collapse-label="Hide replies"
  >
    <div class="sk-comment__self">
      <div class="sk-comment__profile">
        <div class="sk-comment__author" data-sk-comment-author>Ada</div>
      </div>
      <div class="sk-comment__header">
        <div class="sk-comment__timestamp" data-sk-comment-timestamp>
          hace 3h
        </div>
      </div>
      <div class="sk-comment__gutter"></div>
      <div class="sk-comment__content">
        <div class="sk-comment__body" data-sk-comment-body>
          Una respuesta que todavía no existe.
        </div>
      </div>
    </div>
  </article>
</template>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/comment-thread.css`, `@skryensya/core/patterns/visually-hidden.css`.

## CommentComposer

**Use when**

- a comment or a reply has to be written, with whatever control the consumer decides

**Avoid when**

- the form does more than publish a body of text; that is a form of its own with FormField

Alternatives: `FormField`.

- React: `import { CommentComposer } from "@skryensya/react/comment-thread"`.
- HTML: a `<form>` with `data-sk-comment-composer`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `submitLabel` | string | `"Post"` |
| `cancellable` | boolean | `false` |
| `cancelLabel` | string | `"Cancel"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | signature | yes |

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:commentvote` | `onVote` | { id: string \| null, direction: "up" \| "down" } |
| `sk:commentreply` | `onSubmit` | { parentId: string \| null, body: string } |
| `sk:commentdelete` | `onDelete` | { id: string \| null } |
| `sk:commentdiscard` | `onCancel` | { parentId: string \| null, body: string } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-comment-actions-optical`, `--sk-comment-avatar-gap`, `--sk-comment-avatar-ring-color`, `--sk-comment-avatar-ring-width`, `--sk-comment-child-reach`, `--sk-comment-gap`, `--sk-comment-gutter`, `--sk-comment-identity-gap`, `--sk-comment-identity-gutter`, `--sk-comment-indent`, `--sk-comment-measure`, `--sk-comment-meta-gap`, `--sk-comment-node-size`, `--sk-comment-rail-color`, `--sk-comment-rail-elbow`, `--sk-comment-rail-end`, `--sk-comment-rail-overhang`, `--sk-comment-rail-start`, `--sk-comment-rail-width`, `--sk-comment-rail-x`, `--sk-comment-replies-gap`, `--sk-comment-sib-gap`, `--sk-comment-thread-gap`.
