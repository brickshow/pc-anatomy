// General step-by-step desktop PC assembly guide.

import type { Metadata } from "next";
import { AssemblyGuide } from "@/components/assembly/AssemblyGuide";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Build a Desktop PC: Step-by-Step Guide",
  description:
    "Follow a general desktop PC assembly guide from workspace preparation and component installation to cable checks and first boot. Includes interactive 3D part previews.",
  alternates: { canonical: absoluteUrl("/assembly") },
  openGraph: {
    title: "How to Build a Desktop PC: Step-by-Step Guide",
    description: "A general, interactive desktop PC assembly guide from preparation to first boot.",
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
    description: "A general, interactive desktop PC assembly guide from preparation to first boot.",
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function AssemblyPage() {
  return <AssemblyGuide />;
}
