import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/components";
import { SITE_URL } from "@/lib/site";

// Dynamic sitemap covering every important public page: the landing page,
// the interactive explorer, and each component page. API and private routes
// are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...COMPONENTS.map((component) => ({
      url: `${SITE_URL}/components/${component.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}