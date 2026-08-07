// The "Explore" page, shown at the /explore URL. It hosts the interactive 3D component explorer.

import type { Metadata } from "next";
import { Explorer } from "@/components/explorer/Explorer";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `Explore Computer Hardware in Interactive 3D | ${SITE_NAME}`,
  },
  description:
    "Explore computer hardware components in interactive 3D. Rotate, inspect and learn about the CPU, GPU, RAM, motherboard, storage, cooling, and more on Computer Anatomy.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: `Explore Computer Hardware in 3D | ${SITE_NAME}`,
    description:
      "Explore computer hardware components interactively in 3D and learn how each part works.",
    url: `${SITE_URL}/explore`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Interactive Computer Hardware Explorer",
  url: `${SITE_URL}/explore`,
  description:
    "An interactive 3D explorer for learning computer hardware components: CPU, GPU, RAM, motherboard, storage, cooling, and more.",
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
};

// The page component. It simply renders the Explorer UI.
export default function ExplorePage() {
  return (
    <>
      <Explorer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}