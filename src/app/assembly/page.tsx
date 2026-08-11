// PC assembly homepage: /assembly — a clean, game-style landing for the PC
// assembly experience. A centered hero announces the build guide, and the
// primary CTA leads to the workspace at /assembly/workspace (currently a
// "coming soon" placeholder with a waitlist). Server-rendered and indexable.

import type { Metadata } from "next";
import { AssemblyHeader } from "@/components/assembly/AssemblyHeader";
import { AssemblyMenu } from "@/components/assembly/AssemblyMenu";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "PC Assembly — Build a PC, Step by Step",
  description:
    "Build a PC step by step. Learn where each component goes and how it connects.",
  alternates: { canonical: absoluteUrl("/assembly") },
  openGraph: {
    title: "PC Assembly — Build a PC, Step by Step",
    description: SITE_DESCRIPTION,
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
    title: "PC Assembly — Build a PC, Step by Step",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function AssemblyHomePage() {
  return (
    <>
      <AssemblyHeader />
      <main className="relative h-[calc(100dvh-4rem)] overflow-hidden viewer-backdrop">
        <AssemblyMenu />
      </main>
    </>
  );
}
