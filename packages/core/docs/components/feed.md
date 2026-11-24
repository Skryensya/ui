# feed

Category: content. Stylesheet: `@skryensya/core/components/feed.css`. Signatures: `Feed`, `FeedArticle`.

## Feed

**Use when**

- a stream of independent units of content that can load in batches. Posts, comments, activity

**Avoid when**

- it is a list of options to choose from; that is a Listbox or a List
- the order matters by fixed position, not by publication; that is a Table or a plain List
- the conversation has nested replies and actions (vote, reply); that is a CommentThread
- there are no posts yet and the message is the absence itself; that is an EmptyState

Alternatives: `List`, `CommentThread`, `EmptyState`.

- React: `import { Feed } from "@skryensya/react/feed"`.
- HTML: a `<div>` with `data-sk-feed`, enhanced by Vanilla's mount.

- Requires the options: `label`.

**Options**

| Option | Values | Default |
|---|---|---|
| `label` | string |  |
| `busy` | boolean | `false` |
| `keyboard` | boolean | `false` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | one of `FeedArticle` | yes |

**Accessible name**

- role="feed" carries no implicit name. Without one, a screen reader enters a stream of articles with nothing saying what the stream is about. Give one of: `label`.

**Example** (canonical tree `feed/comments`; its copy is placeholder, replace it)

```tsx
import { Feed, FeedArticle } from "@skryensya/react/feed";

export function FeedExample() {
  return (
    <Feed label="Comentarios">
      <FeedArticle posInset={1} setSize={2} label="Ana, hace 2 horas">
        El deploy quedó bien, gracias por revisar.
      </FeedArticle>
      <FeedArticle posInset={2} setSize={2} label="Bruno, hace 1 hora">
        Encontré un caso borde en el filtro.
      </FeedArticle>
    </Feed>
  );
}
```

```html
<div
  class="sk-feed"
  data-sk-feed
  aria-label="Comentarios"
  aria-busy="false"
  role="feed"
>
  <article
    class="sk-feed__article"
    aria-posinset="1"
    aria-setsize="2"
    role="article"
    aria-labelledby="ana-hace-2-horas"
  >
    <div class="sk-feed__article-label" id="ana-hace-2-horas">
      Ana, hace 2 horas
    </div>
    El deploy quedó bien, gracias por revisar.
  </article>
  <article
    class="sk-feed__article"
    aria-posinset="2"
    aria-setsize="2"
    role="article"
    aria-labelledby="bruno-hace-1-hora"
  >
    <div class="sk-feed__article-label" id="bruno-hace-1-hora">
      Bruno, hace 1 hora
    </div>
    Encontré un caso borde en el filtro.
  </article>
</div>
```

Stylesheets: `@skryensya/core/components/feed.css`.

## FeedArticle

**Use when**

- one unit of content inside the feed. A post, a comment

**Avoid when**

- the comment takes nested replies or actions; that is a Comment inside a CommentThread

Alternatives: `Comment`.

- React: `import { FeedArticle } from "@skryensya/react/feed"`.
- HTML: a `<article>`, no JavaScript needed.

- Goes inside: `Feed`.
- Requires the options: `posInset`, `setSize`.

**Options**

| Option | Values | Default |
|---|---|---|
| `posInset` | number |  |
| `setSize` | number |  |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | node | yes |
| `children` | node | yes |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-feed-article-label-gap`, `--sk-feed-article-padding`, `--sk-feed-gap`.
