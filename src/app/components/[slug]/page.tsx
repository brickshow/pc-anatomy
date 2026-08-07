// The detail page for a single computer component, e.g. /components/cpu.
// The [slug] part of the URL tells this page which component to show.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent } from "@/lib/components";
import { DetailView } from "@/components/detail/DetailView";
import { componentSeo, SITE_URL, SITE_NAME } from "@/lib/site";

// Metadata for a single component page. Every component gets its own unique
// title, description, canonical URL, and social card.
export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return {};
  const seo = componentSeo(component.id);
  const url = `${SITE_URL}/components/${component.id}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: `/components/${component.id}` },
    keywords: [
      component.name,
      component.tagline,
      "computer hardware",
      "computer components",
    ],
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: "article",
      siteName: SITE_NAME,
    },
  };
}

// At build time, generate one page for every component so each URL becomes a static page.
export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.id }));
}

// The page component. It looks up the component by its URL slug and shows its details.
export default async function ComponentPage({
  params,
}: PageProps<"/components/[slug]">) {
  const { slug } = await params;
  const component = getComponent(slug);
  // If no component matches this slug, show the 404 page.
  if (!component) notFound();

  // Breadcrumb structured data so search engines understand the site structure
  // (Home → Components → This component).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_URL}/explore`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: component.name,
            item: `${SITE_URL}/components/${component.id}`,
          },
        ],
      },
      {
        "@type": "WebPage",
        name: component.name,
        url: `${SITE_URL}/components/${component.id}`,
        description: component.short,
        inLanguage: "en",
      },
    ],
  };

  return (
    <>
      <DetailView component={component} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}