// The "Explore" page, shown at the /explore URL. It hosts the interactive 3D component explorer.

import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/Explorer";
import { absoluteUrl } from "@/lib/site";

// Next.js metadata for this page (tab title + search engine description).
export const metadata: Metadata = {
  title: "Explore Computer Components in 3D",
  description:
    "Explore an interactive 3D computer model and inspect processors, graphics cards, memory, storage, cooling, and other PC components.",
  alternates: { canonical: absoluteUrl("/explore") },
  openGraph: {
    title: "Explore Computer Components in 3D",
    description:
      "Explore an interactive 3D computer model and inspect the parts that make a PC work.",
    url: absoluteUrl("/explore"),
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
    title: "Explore Computer Components in 3D",
    description:
      "Explore an interactive 3D computer model and inspect PC components.",
    images: [absoluteUrl("/og-image.png")],
  },
};

// Keep the route focused on the full-screen 3D explorer.
export default function ExplorePage() {
  return <Explorer />;
}
