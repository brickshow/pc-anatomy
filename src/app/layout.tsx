// This is the root layout. It wraps EVERY page in the app with the same outer HTML structure,
// and defines the site-wide SEO metadata, social cards, favicons, and core structured data.

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

// Load the Geist font (the default design font) and expose it as CSS variables.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load the Geist Mono font (for code / monospace text) as another CSS variable.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
};

// Site-wide metadata: default tab title, template for page titles, description,
// canonical base, robots directives, social cards, and icons.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | PC Anatomy",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "computer anatomy",
    "PC anatomy",
    "computer components",
    "computer parts",
    "PC components",
    "computer hardware",
    "PC assembly",
    "PC building",
    "learn computer hardware",
  ],
  authors: [{ name: "PC Anatomy Contributors" }],
  creator: "PC Anatomy Contributors",
  publisher: "PC Anatomy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "uUb5qAwcGgKAqrJoIj2F5XOR95JcojIScal50On1foc",
  },
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: SITE_LANGUAGE,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og-image.png")],
  },
  icons: {
    icon: [{ url: "/logo.png", sizes: "any", type: "image/png" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
  },
};

// The layout component. It receives the page's children and puts them inside a full <html> + <body>.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <ChatLauncher />
        {/* Site-wide structured data: identity, organization, and education app info */}
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: absoluteUrl("/"),
              description: SITE_DESCRIPTION,
              inLanguage: SITE_LANGUAGE,
              publisher: { "@type": "Organization", name: SITE_NAME },
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
              logo: absoluteUrl("/logo.png"),
              description: SITE_DESCRIPTION,
              sameAs: [GITHUB_URL],
            },
            {
              "@context": "https://schema.org",
              "@type": "EducationalApplication",
              name: SITE_NAME,
              url: absoluteUrl("/"),
              description: SITE_DESCRIPTION,
              applicationCategory: "EducationalApplication",
              educationalUse:
                "Learn about computer hardware, computer components, and PC assembly",
              operatingSystem: "Web",
            },
          ]}
        />
      </body>
    </html>
  );
}
