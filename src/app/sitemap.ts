// sitemap.xml — all public, indexable pages with canonical URLs.

import type { MetadataRoute } from "next";
import { SEO_CONTENT } from "@/data/seo";
import { COMPONENTS } from "@/lib/components";
import { SITE_URL, SITE_REVISED_DATE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;

  const componentGuides: MetadataRoute.Sitemap = COMPONENTS
    .filter((component) => SEO_CONTENT[component.id])
    .map((component) => ({
      url: `${site}/components/${component.id}`,
      lastModified: SITE_REVISED_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    {
      url: `${site}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${site}/explore`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site}/assembly`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site}/components/storage`,
      lastModified: SITE_REVISED_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...componentGuides,
  ];
}
