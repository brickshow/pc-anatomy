// The home page of the site. It shows the opening / landing view.

import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, absoluteUrl } from "@/lib/site";

// Metadata is special Next.js information (title, description) used by the browser tab and search engines.
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  keywords: [
    "computer anatomy",
    "computer anatomy 3D",
    "3D computer",
    "3D computer components",
    "interactive 3D computer model",
    "PC anatomy",
    "computer components",
    "computer parts and functions",
    "computer parts",
    "PC components",
    "3D PC parts",
    "computer hardware",
    "PC assembly",
    "PC building",
    "learn computer hardware",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "PC Anatomy — Explore computer anatomy and PC parts in 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og-image.png")],
  },
};

// This is the main component Next.js renders for the "/" URL. It just displays the LandingPage.
// (Global structured data — WebSite, Organization, EducationalApplication — lives in layout.tsx.)
export default function Home() {
  return <LandingPage />;
}
