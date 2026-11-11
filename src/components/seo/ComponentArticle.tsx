// Server-rendered educational article for a component page. All important
// facts exist as crawlable HTML here (never only inside the 3D viewer), and
// the FAQ section is generated from the same data as the FAQPage JSON-LD so
// the visible content and structured data always match.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ComponentInfo } from "@/lib/components";
import { getComponent } from "@/lib/components";
import type { ComponentSeo } from "@/data/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_NAME,
  SITE_PUBLISHED_DATE,
  SITE_REVISED_DATE,
  absoluteUrl,
} from "@/lib/site";

// Picks the correct indefinite article for a component name ("a CPU", "an SSD").
const VOWEL_SOUND_NAMES = new Set(["SSD", "HDD", "AVR", "M.2 SSD", "M.2"]);
function indefiniteArticle(name: string): string {
  if (VOWEL_SOUND_NAMES.has(name)) return "an";
  return /^[AEIOU]/.test(name) && !name.startsWith("UPS") ? "an" : "a";
}

const SECTION = "mt-10";
const H2 = "text-xl font-semibold tracking-tight text-foreground sm:text-2xl";
const P = "mt-3 text-[15px] leading-relaxed text-muted";

export function ComponentArticle({
  component,
  seo,
}: {
  component: ComponentInfo;
  seo?: ComponentSeo;
}) {
  const canonical = absoluteUrl(`/components/${component.id}`);
  const h1 = `${component.name} — ${component.tagline}`;
  const article = indefiniteArticle(component.name);
  const articleName = `${article} ${component.name}`;

  const faqJsonLd = seo?.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seo.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: h1,
    description: component.short,
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    datePublished: SITE_PUBLISHED_DATE,
    dateModified: SITE_REVISED_DATE,
    mainEntityOfPage: canonical,
    about: component.name,
    inLanguage: "en",
  };

  const related = seo?.related
    .map((id) => getComponent(id))
    .filter((c): c is ComponentInfo => Boolean(c));

  return (
    <div className="bg-background">
      <Breadcrumbs
        crumbs={[
          { name: "Components", href: "/explore" },
          { name: component.name },
        ]}
        className="mx-auto w-full max-w-4xl px-6 pt-6"
      />

      <article className="mx-auto w-full max-w-4xl px-6 pb-6 pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          {h1}
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {component.short} Explore it in the interactive 3D viewer below, with
          the key facts about how it works and how it fits into a PC build.
        </p>

        {seo ? (
          <>
            {/* Direct answer first — readable by humans and AI answer engines */}
            <section className={SECTION}>
              <h2 className={H2}>What Is {articleName}?</h2>
              <p className={P}>{seo.whatIs}</p>
              <p className={P}>{component.overview.description}</p>
            </section>

            <section className={SECTION}>
              <h2 className={H2}>What Does {articleName} Do?</h2>
              <p className={P}>{seo.whatDoes}</p>
              <ul className="mt-4 space-y-2.5">
                {component.functions.map((fn) => (
                  <li
                    key={fn}
                    className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/90"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {fn}
                  </li>
                ))}
              </ul>
            </section>

            <section className={SECTION}>
              <h2 className={H2}>How Does {articleName} Work?</h2>
              <p className={P}>{seo.howItWorks}</p>
            </section>

            {component.specs.length > 0 && (
              <section className={SECTION}>
                <h2 className={H2}>Key Specifications</h2>
                <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Key specifications of the {component.name}
                    </caption>
                    <tbody>
                      {component.specs.map((spec) => (
                        <tr
                          key={spec.label}
                          className="border-b border-line last:border-b-0"
                        >
                          <th
                            scope="row"
                            className="px-5 py-3 font-medium text-muted"
                          >
                            {spec.label}
                          </th>
                          <td className="px-5 py-3 text-foreground">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {seo.concepts.map((concept) => (
              <section key={concept.title} className={SECTION}>
                <h2 className={H2}>{concept.title}</h2>
                <p className={P}>{concept.body}</p>
              </section>
            ))}

            <section className={SECTION}>
              <h2 className={H2}>{component.name} in a PC Build</h2>
              <p className={P}>{seo.inABuild}</p>
              <p className={P}>{component.overview.realWorld}</p>
            </section>
          </>
        ) : (
          <section className={SECTION}>
            <h2 className={H2}>What Is {articleName}?</h2>
            <p className={P}>{component.overview.description}</p>
          </section>
        )}

        {/* Related components — descriptive internal links */}
        {related && related.length > 0 && (
          <section className={SECTION}>
            <h2 className={H2}>Related Computer Components</h2>
            <p className={P}>
              Every part of a computer works together. Learn how the{" "}
              {component.name} connects with the rest of the system:
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/components/${c.id}`}
                    className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-1.5 text-[15px] font-medium text-foreground">
                      {c.name}
                      <ChevronRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="text-[13px] leading-relaxed text-muted">
                      {c.tagline}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Visible FAQ — content matches the FAQPage JSON-LD exactly */}
        {seo && seo.faqs.length > 0 && (
          <section className={SECTION}>
            <h2 className={H2}>Frequently Asked Questions</h2>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {seo.faqs.map((faq) => (
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
        )}

        {/* The interactive 3D model — lazily loaded, the article above is always crawlable */}
        <section className={SECTION} aria-label="Interactive 3D model">
          <h2 className={H2}>Explore the {component.name} in 3D</h2>
          <p className={P}>
            Use the interactive viewer to rotate, zoom, and inspect the{" "}
            {component.name}. Drag to orbit, scroll to zoom, and use the toolbar
            to reset the camera.
          </p>
        </section>
      </article>

      <JsonLd data={[articleJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])]} />
    </div>
  );
}
