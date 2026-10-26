import { useEffect, useRef, useState } from "react";
import {
  CommentThread,
  Comment,
  CommentActions,
  CommentVote,
  CommentComposer,
} from "@skryensya/react/comment-thread";
import type { CommentVoteState } from "@skryensya/core/comment-thread";
import { Avatar } from "@skryensya/react/avatar";
import { FormField } from "@skryensya/react/form-field";
import { Textarea } from "@skryensya/react/input";
import { BreakCaseFindings } from "./debug-case-findings";

type Entry = {
  author: string;
  body: string;
  timestamp?: string;
  count: number;
  replies?: Entry[];
};
const DEMO: Entry[] = [
  {
    author: "Sam Lee",
    body: "The release checklist is ready for review.",
    timestamp: "3 hours ago",
    count: 1,
  },
];
const WORST: Entry[] = [
  {
    author: "Aleksandra Wiśniewska-Kowalczyk",
    body: "Please contact bartholomew.fitzgerald@northwind-industries-holdings.example.com and review https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved before approving the international billing reconciliation.",
    timestamp: "September 18, 2026 at 10:42 UTC · edited",
    count: 1284,
    replies: [
      {
        author: "王秀英",
        body: "产品团队 · Paramètres de confidentialité et de sécurité",
        count: 0,
        replies: [
          {
            author: "Jo",
            body: "Confirmed",
            count: 1,
            replies: [
              {
                author: "Đặng Thị Ngọc Hân",
                body: "Reviewed",
                count: 0,
                replies: [
                  {
                    author: "نور الهدى عبد الرحمن",
                    body: "تم التأكيد",
                    count: 0,
                    replies: [{ author: "J", body: "Done", count: 0 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    author: "Jo",
    body: "<script>alert(1)</script> &amp; **bold**",
    count: -42,
  },
];
const CASES = [
  { label: "Demo", entries: DEMO },
  { label: "Worst case", entries: WORST },
  { label: "Empty", entries: [] },
  { label: "One", entries: [DEMO[0]] },
  {
    label: "1,000 comments",
    entries: Array.from({ length: 1000 }, (_, i) => ({
      author: `Reviewer ${i + 1}`,
      body: `Project ${(i % 37) + 1} review completed.`,
      count: i % 12,
    })),
  },
];

function ThreadEntry({ entry, id }: { entry: Entry; id: string }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [vote, setVote] = useState<CommentVoteState>("none");
  const [reply, setReply] = useState("");
  const replyForm = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const dialog = replyForm.current?.closest("dialog");
    const closed = () => setReplyOpen(false);
    dialog?.addEventListener("close", closed);
    return () => dialog?.removeEventListener("close", closed);
  }, []);
  const count = entry.count + (vote === "up" ? 1 : vote === "down" ? -1 : 0);
  return (
    <Comment
      id={id}
      author={entry.author}
      avatar={<Avatar name={entry.author} size="sm" />}
      timestamp={entry.timestamp}
      collapsible={Boolean(entry.replies?.length)}
      collapseLabel="Toggle replies"
      replyOpen={replyOpen}
      actions={
        <CommentActions
          reply
          replyLabel="Reply"
          replyOpen={replyOpen}
          onReply={() => setReplyOpen((open) => !open)}
        >
          <CommentVote
            count={new Intl.NumberFormat("en-US").format(count)}
            voted={vote}
            onVote={(next) =>
              setVote((current) => (current === next ? "none" : next))
            }
          />
        </CommentActions>
      }
      replyComposer={
        <CommentComposer
          ref={replyForm}
          submitLabel="Post reply"
          cancelLabel="Cancel"
          cancellable
          onCancel={() => setReplyOpen(false)}
          onSubmit={(body) => {
            setReply(body);
            setReplyOpen(false);
          }}
        >
          <FormField label={`Reply to ${entry.author}`}>
            <Textarea />
          </FormField>
        </CommentComposer>
      }
      replies={entry.replies?.map((child, i) => (
        <ThreadEntry key={i} entry={child} id={`${id}-${i}`} />
      ))}
    >
      <p>{entry.body}</p>
      {reply ? <p>Local reply: {reply}</p> : null}
    </Comment>
  );
}

export function CommentThreadBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: CommentThread</h1>
        <p className="break-intro">
          Six levels of replies, long authors and contacts, optional timestamps,
          negative/large vote counts and zero/one/1,000 comments. Replies/votes
          stay local; nothing is sent or saved.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, entries }, index) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">CommentThread - {label}</h2>
            <BreakCaseFindings component="comment-thread" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "100%",
                  ...(entries.length === 1000
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <CommentThread label={`Release discussion - ${label}`}>
                  {entries.map((entry, i) => (
                    <ThreadEntry
                      key={i}
                      entry={entry}
                      id={`break-comment-${index}-${i}`}
                    />
                  ))}
                </CommentThread>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
