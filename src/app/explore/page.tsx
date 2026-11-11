// The "Explore" page, shown at the /explore URL. It hosts the interactive 3D component explorer.

import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/Explorer";
import { ExploreEducation } from "@/components/explorer/ExploreEducation";
import { absoluteUrl } from "@/lib/site";

// Next.js metadata for this page (tab title + search engine description).
export const metadata: Metadata = {
  title: "Explore Computer Components in 3D",
  description:
    "Explore computer components in interactive 3D, learn what each part does, and open detailed guides for processors, graphics, memory, storage, cooling, and more.",
  alternates: { canonical: absoluteUrl("/explore") },
  openGraph: {
    title: "Explore Computer Components in 3D",
    description:
      "Explore computer parts in interactive 3D and open clear guides to each component's role, function, and build connections.",
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
      "Explore computer parts in interactive 3D and learn what each component does.",
    images: [absoluteUrl("/og-image.png")],
  },
};

// The page component. It simply renders the Explorer UI.
export default function ExplorePage() {
  return (
    <>
      <Explorer />
      <ExploreEducation />
    </>
  );
}
