// The home page of the site. It shows the opening / landing view.

import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { FAQ_ITEMS } from "@/data/faq";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  WEBSITE_JSONLD,
  ORGANIZATION_JSONLD,
} from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

// Structured data for the landing page: it describes the page itself plus the
// genuine, useful FAQ. The answers are exact matches for the visible FAQ section.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    WEBSITE_JSONLD,
    ORGANIZATION_JSONLD,
    {
      "@type": "WebPage",
      name: `${SITE_NAME} — ${SITE_TAGLINE}`,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      isPartOf: WEBSITE_JSONLD,
      about: [
        "computer hardware",
        "computer parts",
        "computer components",
        "computer anatomy",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

// This is the main component Next.js renders for the "/" URL. It just displays the LandingPage.
export default function Home() {
  return (
    <>
      <LandingPage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}