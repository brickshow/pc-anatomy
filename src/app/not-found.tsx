// 404 page — rendered for unmatched routes and missing components.
// Next.js returns the correct HTTP 404 status for this page.

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Computer Components in 3D" },
  { href: "/assembly", label: "How to Assemble a PC" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <p className="font-mono text-sm tracking-widest text-accent">404</p>
      <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
        The page you are looking for does not exist, or it may have moved to a
        new address. Try one of these instead:
      </p>
      <nav aria-label="Suggested pages" className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-surface-2"
          >
            {link.label}
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </nav>
    </div>
  );
}
