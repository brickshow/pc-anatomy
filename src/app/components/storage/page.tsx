// Computer storage topic page: /components/storage
// Explains storage as a concept (SSD, HDD, NVMe, SATA) and links to the
// dedicated storage component pages. Fully server-rendered and crawlable.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SourceLinks } from "@/components/seo/SourceLinks";
import { SEO_SOURCES } from "@/data/seoSources";
import { ModelViewerSection } from "@/components/viewer/ModelViewerSection";
import {
  SITE_NAME,
  SITE_PUBLISHED_DATE,
  SITE_REVISED_DATE,
  absoluteUrl,
} from "@/lib/site";

const CANONICAL = "/components/storage";
const H1 = "Computer Storage — SSDs, HDDs, and NVMe";
const P = "mt-3 text-[15px] leading-relaxed text-muted";
const H2 = "text-xl font-semibold tracking-tight text-foreground sm:text-2xl";
const SECTION = "mt-10";

const FAQS = [
  {
    q: "What is computer storage?",
    a: "Computer storage is the permanent memory that keeps the operating system, programs, and files when the power is off. Storage drives — SSDs and HDDs — are slower than RAM but retain data for years.",
  },
  {
    q: "What is the difference between SSD and HDD?",
    a: "An SSD (Solid-State Drive) stores data on flash memory with no moving parts: fast, silent, and durable. An HDD (Hard Disk Drive) stores data on spinning magnetic platters: slower but cheaper per gigabyte.",
  },
  {
    q: "What is the difference between SATA and NVMe?",
    a: "SATA is the older storage interface that tops out around 550 MB/s. NVMe connects storage directly over PCIe lanes and reaches several gigabytes per second, which is why modern PCs boot and load in seconds.",
  },
  {
    q: "What is the difference between storage and RAM?",
    a: "Storage is permanent and holds data when the PC is off. RAM is fast, temporary working memory that holds data the CPU is actively using and loses everything when power is lost.",
  },
];

export const metadata: Metadata = {
  title: "Computer Storage: SSD, HDD & NVMe Guide",
  description:
    "What is computer storage? Learn how SSDs, HDDs, NVMe, and SATA drives work, the difference between storage and RAM, and how storage fits into a PC build.",
  alternates: { canonical: absoluteUrl(CANONICAL) },
  openGraph: {
    title: "Computer Storage: SSD, HDD & NVMe Guide",
    description:
      "Learn how SSDs, HDDs, NVMe, and SATA storage work and how they fit into a PC build.",
    url: absoluteUrl(CANONICAL),
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "PC Anatomy — Explore Computer Hardware in 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Computer Storage: SSD, HDD & NVMe Guide",
    description:
      "Learn how SSDs, HDDs, NVMe, and SATA storage work and how they fit into a PC build.",
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function StoragePage() {
  const canonical = absoluteUrl(CANONICAL);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: H1,
    description:
      "Computer storage explained: SSDs, HDDs, NVMe, SATA, capacity, speed, and the difference between storage and RAM.",
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    datePublished: SITE_PUBLISHED_DATE,
    dateModified: SITE_REVISED_DATE,
    mainEntityOfPage: canonical,
    about: "Computer storage",
    inLanguage: "en",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs
        crumbs={[
          { name: "Components", href: "/explore" },
          { name: "Storage", href: CANONICAL },
        ]}
        className="mx-auto w-full max-w-4xl px-6 pt-6"
      />

      <article className="mx-auto w-full max-w-4xl px-6 pb-6 pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          {H1}
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Computer storage is the permanent memory of a PC — where the
          operating system, programs, and files live when the power is off.
          Explore how SSDs, HDDs, NVMe, and SATA drives work and how they fit
          into a PC build, with interactive 3D models of each drive type.
        </p>
        <p className="mt-3 text-xs text-muted-2">
          By PC Anatomy contributors · Published {SITE_PUBLISHED_DATE} · Updated {SITE_REVISED_DATE}
        </p>

        <section className={SECTION}>
          <h2 className={H2}>What Is Computer Storage?</h2>
          <p className={P}>
            Computer storage is the component that keeps data permanently. When
            you install a program, save a document, or download a game, it is
            written to a storage drive and survives restarts. Storage comes in
            two main technologies: solid-state drives (SSDs) with no moving
            parts, and hard disk drives (HDDs) with spinning magnetic platters.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>SSD — Solid-State Drive</h2>
          <p className={P}>
            An SSD stores data on NAND flash memory chips. With no moving
            parts, it delivers near-instant boot times, snappy application
            loading, and resistance to shock. SATA SSDs reach about 550 MB/s —
            already ten times faster than a hard drive — while NVMe SSDs
            connect over PCIe lanes and reach multiple gigabytes per second.
          </p>
          <p className={P}>
            <Link
              href="/components/ssd"
              className="font-medium text-accent transition-colors hover:text-accent-bright"
            >
              Learn how a 2.5-inch SATA SSD works
            </Link>{" "}
            and{" "}
            <Link
              href="/components/m2-ssd"
              className="font-medium text-accent transition-colors hover:text-accent-bright"
            >
              why M.2 NVMe drives are the fastest consumer storage
            </Link>
            .
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>HDD — Hard Disk Drive</h2>
          <p className={P}>
            An HDD stores data magnetically on platters spinning at 5,400 or
            7,200 RPM. It is the cheapest way to add terabytes of capacity,
            which is why hard drives still dominate bulk archives, backups,
            and NAS storage — even though SSDs have replaced them for operating
            systems and games.
          </p>
          <p className={P}>
            <Link
              href="/components/hdd"
              className="font-medium text-accent transition-colors hover:text-accent-bright"
            >
              Explore the hard disk drive in 3D
            </Link>
            .
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>NVMe and SATA — How Drives Connect</h2>
          <p className={P}>
            SATA is the older serial interface that tops out at about 550 MB/s
            and serves both 2.5-inch SSDs and hard drives. NVMe (Non-Volatile
            Memory Express) is a protocol that lets flash storage talk directly
            to the CPU over PCIe lanes, bypassing SATA&apos;s bottleneck entirely —
            the reason M.2 NVMe drives can read beyond 7 GB/s.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>Storage Capacity and Speed</h2>
          <p className={P}>
            Capacity, measured in gigabytes (GB) and terabytes (TB), decides
            how many programs, games, and files you can keep installed. Speed
            decides how fast they open: SSDs dominate random-access workloads
            like booting and launching apps, while sequential throughput
            matters for large file transfers. A common desktop setup pairs a
            fast NVMe SSD for the operating system with a large HDD for
            archives.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>Storage vs RAM</h2>
          <p className={P}>
            Storage and RAM are both memory, but they do different jobs.
            Storage is permanent: it keeps data when the power is off. RAM is
            fast, temporary working memory that holds what the CPU is using
            right now and erases when the PC shuts down. Programs load from
            storage into RAM before the processor can use them, which is why
            enough RAM matters for smooth multitasking.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>Related Computer Components</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { id: "ssd", name: "SSD", tag: "2.5-inch SATA Solid State Drive" },
              { id: "m2-ssd", name: "M.2 SSD", tag: "NVMe Solid State Drive" },
              { id: "hdd", name: "HDD", tag: "Hard Disk Drive" },
              { id: "ram", name: "RAM", tag: "Random Access Memory" },
            ].map((c) => (
              <li key={c.id}>
                <Link
                  href={`/components/${c.id}`}
                  className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-2"
                >
                  <span className="text-[15px] font-medium text-foreground">
                    {c.name}
                  </span>
                  <span className="text-[13px] leading-relaxed text-muted">
                    {c.tag}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span
                    aria-hidden="true"
                    className="text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <SourceLinks sources={SEO_SOURCES.storage} />

        <section className={SECTION}>
          <h2 className={H2}>Explore Storage Hardware in 3D</h2>
          <p className={P}>
            Rotate and inspect a real hard disk drive in the interactive viewer
            below, then compare it with the{" "}
            <Link
              href="/components/ssd"
              className="font-medium text-accent transition-colors hover:text-accent-bright"
            >
              SATA SSD
            </Link>{" "}
            and{" "}
            <Link
              href="/components/m2-ssd"
              className="font-medium text-accent transition-colors hover:text-accent-bright"
            >
              M.2 NVMe SSD
            </Link>{" "}
            pages.
          </p>
          <div className="mt-4">
            <ModelViewerSection model="/models/hdd.glb" label="Interactive 3D hard disk drive model" />
          </div>
        </section>
      </article>

      <JsonLd data={[articleJsonLd, faqJsonLd]} />
    </div>
  );
}
