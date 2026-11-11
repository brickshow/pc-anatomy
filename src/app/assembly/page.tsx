// General step-by-step desktop PC assembly guide.

import type { Metadata } from "next";
import { AssemblyGuide } from "@/components/assembly/AssemblyGuide";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Build a Desktop PC: Step-by-Step Guide",
  description:
    "Follow a practical desktop PC build from workspace preparation to first boot, with interactive 3D previews and compatibility reminders.",
  alternates: { canonical: absoluteUrl("/assembly") },
  openGraph: {
    title: "How to Build a Desktop PC: Step-by-Step Guide",
    description: "A practical desktop PC assembly guide with interactive 3D part previews.",
    url: absoluteUrl("/assembly"),
    siteName: SITE_NAME,
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
    title: "How to Build a Desktop PC: Step-by-Step Guide",
    description: "A practical desktop PC assembly guide with interactive 3D part previews.",
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function AssemblyPage() {
  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-3">
        <Breadcrumbs
          crumbs={[{ name: "PC assembly guide", href: "/assembly" }]}
          className="mx-auto max-w-6xl"
        />
      </div>
      <AssemblyGuide />
    </>
  );
}
