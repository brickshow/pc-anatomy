import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// robots.txt rules: allow all legitimate crawlers on public content, block the
// API/chat routes (they are not meant to be indexed), and point to the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}