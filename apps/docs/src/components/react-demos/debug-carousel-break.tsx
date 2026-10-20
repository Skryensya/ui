import { Carousel, CarouselSlide } from "@skryensya/react/carousel";
import type { ReactNode } from "react";

type Slide = {
  title?: string;
  eyebrow?: string;
  description?: string;
  metric?: string;
};

const DEMO: readonly Slide[] = [
  { eyebrow: "Workspace", title: "Billing", description: "Review invoices and payment methods." },
  { eyebrow: "Workspace", title: "Team", description: "Invite people to the workspace." },
  { eyebrow: "Report", title: "Monthly activity", metric: "128 members" },
  { eyebrow: "Product", title: "Starter plan", metric: "$24 / month" },
];

const WORST: readonly Slide[] = [
  {
    eyebrow: "1,284 members",
    title: "Aleksandra Wiśniewska-Kowalczyk",
    description: "Senior Product Design Engineer, Platform Infrastructure",
    metric: "Invitation expired 12 days ago",
  },
  {
    eyebrow: "Billing",
    title: "Benachrichtigungseinstellungen",
    description: "International billing and security notifications for the workspace administrator.",
    metric: "$12,345,678.90",
  },
  {
    eyebrow: "Account owner",
    title: "Jo",
    description: "A very short name beside a long secondary description: the layout should still read as one card.",
    metric: "1 member",
  },
  {
    eyebrow: "Regional report",
    title: "王秀英 — Billing overview",
    description: "国际账单和安全通知；الفواتير والتنبيهات الأمنية.",
    metric: "0 unresolved alerts",
  },
  {
    eyebrow: "Imported title",
    title: "<script>alert(1)</script> &amp; **literal text**",
    description:
      "This quarterly report covers the billing-contact change, its approval history, the affected invoices, and the notification schedule. It is intentionally a full editorial summary rather than a one-line card teaser, because the slide must remain readable when a real team shares the complete context.",
  },
  { title: "J" },
];

const HUGE: readonly Slide[] = Array.from({ length: 1_000 }, (_, index) => ({
  eyebrow: "Saved photo",
  title: `Photo ${String(index + 1).padStart(4, "0")}`,
  description: "Coastline from the quarterly field report.",
}));

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <article className="break-carousel-card">
      {slide.eyebrow ? <p className="break-carousel-card__eyebrow">{slide.eyebrow}</p> : null}
      {slide.title ? <h3 className="break-carousel-card__title">{slide.title}</h3> : null}
      {slide.description ? <p className="break-carousel-card__description">{slide.description}</p> : null}
      {slide.metric ? <p className="break-carousel-card__metric">{slide.metric}</p> : null}
    </article>
  );
}

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Track({
  label,
  slides,
  slideSize,
  dir,
  indicator,
}: {
  label: string;
  slides: readonly Slide[];
  slideSize?: string;
  dir?: "ltr" | "rtl";
  indicator?: "dots" | "count";
}) {
  return (
    <div className="break-w-320">
      <Carousel aria-label={label} dir={dir} indicator={indicator} slideSize={slideSize}>
        {slides.map((slide, index) => (
          <CarouselSlide key={`${index}-${slide.title ?? "untitled"}`}>
            <SlideCard slide={slide} />
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  );
}

export function CarouselBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Carousel</h1>
        <p className="break-intro">
          Slides accept arbitrary React content and have no declared count or text-length limit. These
          cases cover ordinary cards, mixed-length copy, empty/single tracks, RTL, and 1,000 saved items.
          Inspect at 320px, 200% zoom, dark mode, and a 1100px container.
        </p>
      </header>

      <div className="break-scenario-grid">
        <Case label="Carousel — Demo data — 320px">
          <Track label="Workspace highlights" slides={DEMO} slideSize="min(88%, 20rem)" />
        </Case>
        <Case label="Carousel — Worst case — 320px">
          <Track label="International billing and security updates" slides={WORST} slideSize="min(88%, 20rem)" />
        </Case>
        <Case label="Carousel — Worst case — RTL">
          <Track dir="rtl" label="التقارير الإقليمية والتنبيهات الأمنية" slides={WORST} slideSize="min(88%, 20rem)" />
        </Case>
        <Case label="Carousel — Empty">
          <Track label="Recently viewed reports" slides={[]} />
        </Case>
        <Case label="Carousel — One slide">
          <Track label="Pinned report" slides={[DEMO[0]!]} />
        </Case>
        <Case label="Carousel — 1,000 slides — dots by default">
          <Track label="Saved photos" slides={HUGE} slideSize="100%" />
        </Case>
      </div>

      <Case label="Carousel — Worst case — 1100px container">
        <div className="break-w-1100" style={{ inlineSize: "min(1100px, calc(100vw - 2rem))" }}>
          <Carousel aria-label="Featured plans and workspace reports" slideSize="min(42%, 28rem)">
            {WORST.map((slide, index) => (
              <CarouselSlide key={`${index}-${slide.title ?? "untitled"}`}>
                <SlideCard slide={slide} />
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      </Case>
    </div>
  );
}
