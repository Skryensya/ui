import { Feed, FeedArticle } from "@skryensya/react/feed";
import { BreakCaseFindings } from "./debug-case-findings";

const DEMO = [
  { title: "Release ready", body: "Sam Lee updated the release checklist." },
  {
    title: "Billing contact updated",
    body: "Jo confirmed the next invoice recipient.",
  },
];
const CASES = [
  { label: "Demo", articles: DEMO },
  {
    label: "Worst case",
    articles: [
      {
        title:
          "Aleksandra Wiśniewska-Kowalczyk - International product infrastructure",
        body: "Contact bartholomew.fitzgerald@northwind-industries-holdings.example.com. Review https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved before approval.",
      },
      {
        title: "Benachrichtigungseinstellungen",
        body: "Paramètres de confidentialité et de sécurité · 王秀英 产品团队",
      },
      { title: "Jo", body: "<script>alert(1)</script> &amp; **bold**" },
    ],
  },
  { label: "Empty", articles: [] },
  { label: "One", articles: [DEMO[0]] },
  { label: "Loading more", articles: DEMO, busy: true },
  {
    label: "1,000 articles",
    articles: Array.from({ length: 1000 }, (_, i) => ({
      title: `Workspace update ${i + 1}`,
      body: `Project ${(i % 37) + 1} completed its billing contact review.`,
    })),
  },
];

export function FeedBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Feed</h1>
        <p className="break-intro">
          Long article names and URLs, zero/one/1,000 articles and busy state.
          Keyboard mode is enabled: PageDown/PageUp move through articles,
          Ctrl+Home/End leave the feed.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, articles, busy }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Feed - {label}</h2>
            <BreakCaseFindings component="feed" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "100%",
                  ...(articles.length === 1000
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <Feed
                  label={`Workspace updates - ${label}`}
                  keyboard
                  busy={busy}
                >
                  {articles.map(({ title, body }, i) => (
                    <FeedArticle
                      key={i}
                      label={title}
                      posInset={i + 1}
                      setSize={busy ? -1 : articles.length}
                    >
                      <p>{body}</p>
                    </FeedArticle>
                  ))}
                </Feed>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
