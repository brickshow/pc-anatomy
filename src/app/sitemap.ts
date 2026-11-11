// sitemap.xml — all public, indexable pages with canonical URLs.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;

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
  ];
}
