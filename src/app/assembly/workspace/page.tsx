// PC assembly workspace: /assembly/workspace — the interactive, step-by-step
// PC assembly guide. Server-rendered page shell (header + metadata) that
// mounts the client-side AssemblyWorkspace, which fills the remaining height.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AssemblyWorkspace } from "@/components/assembly/workspace/assembly-workspace";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Assembly Workspace — Build a PC, Step by Step",
  description:
    "The interactive, step-by-step PC assembly workspace. Install components, review the instructions, avoid the common mistakes, and build a PC from the ground up.",
  alternates: { canonical: absoluteUrl("/assembly/workspace") },
  openGraph: {
    title: "Assembly Workspace — Build a PC, Step by Step",
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/assembly/workspace"),
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
    title: "Assembly Workspace — Build a PC, Step by Step",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function AssemblyWorkspacePage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden viewer-backdrop">
      {/* Workspace header, mirroring the app's other headers. */}
      <header className="relative z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3.5 backdrop-blur-xl">
        <Image
          src="/logo.png"
          alt="Computer Anatomy logo"
          width={128}
          height={128}
          priority
          className="h-8 w-8 rounded-lg object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[13.5px] font-semibold leading-tight tracking-tight text-foreground">
            Computer Anatomy
          </span>
          <span className="hidden truncate text-[10.5px] leading-tight text-muted-2 sm:block">
            Assembly Workspace
          </span>
        </div>
        <Link
          href="/assembly"
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-xl border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent-bright"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Assembly Home
        </Link>
      </header>

      <AssemblyWorkspace />
    </div>
  );
}
