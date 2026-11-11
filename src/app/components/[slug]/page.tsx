// The detail page for a single computer component, e.g. /components/cpu.
// Each page pairs a fully server-rendered educational article (H1, sections,
// FAQ, related links, structured data) with the existing interactive 3D
// viewer, so the content is crawlable even before WebGL loads.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent } from "@/lib/components";
import { SEO_CONTENT } from "@/data/seo";
import { ComponentArticle } from "@/components/seo/ComponentArticle";
import { DetailView } from "@/components/detail/DetailView";
import { absoluteUrl } from "@/lib/site";

// Only the slugs from generateStaticParams exist. Anything else must be a
// real 404 — this prevents on-demand prerendering of unknown URLs (soft 404s)
// and crawl-sniffing. Old slugs (psu, case) are redirected in next.config.ts.
export const dynamicParams = false;

// At build time, generate one page for every component so each URL becomes a static page.
export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.id }));
}

// Unique metadata (title, description, canonical, social cards) per component.
export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) {
    return {
      title: "Component Not Found",
      robots: { index: false },
    };
  }

  const seo = SEO_CONTENT[component.id];
  const description = (seo?.whatIs ?? component.short).replace(/\s+/g, " ").trim();
  const path = `/components/${component.id}`;

  return {
    title: `${component.name} — ${component.tagline}`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${component.name} — ${component.tagline}`,
      description,
      url: absoluteUrl(path),
      type: "website",
      images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630, alt: "PC Anatomy — Explore Computer Hardware in 3D" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${component.name} — ${component.tagline}`,
      description,
      images: [absoluteUrl("/og-image.png")],
    },
  };
}

// The page component. It renders the SEO article plus the interactive 3D viewer.
export default async function ComponentPage({
  params,
}: PageProps<"/components/[slug]">) {
  const { slug } = await params;
  const component = getComponent(slug);
  // If no component matches this slug, show the 404 page.
  if (!component) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ComponentArticle component={component} seo={SEO_CONTENT[component.id]} />
      <DetailView component={component} />
    </div>
  );
}
