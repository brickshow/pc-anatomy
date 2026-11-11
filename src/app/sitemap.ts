// sitemap.xml — all public, indexable pages with canonical URLs.

import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/components";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;

  const componentPages = COMPONENTS.map((component) => ({
    url: `${site}/components/${component.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
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
      url: `${site}/components`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site}/components/storage`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...componentPages,
  ];
}
