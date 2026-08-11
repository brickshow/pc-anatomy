// AssemblyHeader.tsx: The top navigation bar for the PC Assembly homepage.
// Mirrors the Explore page header exactly (logo, name + subtitle, an action
// button, and a version badge) so both pages feel like one app. The action
// button links back to the interactive 3D explorer.
import Image from "next/image";
import Link from "next/link";
import { Box } from "lucide-react";

export function AssemblyHeader() {
  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3.5 backdrop-blur-xl">
      {/* Logo mark. */}
      <div className="relative shrink-0">
        <Image
          src="/logo.png"
          alt="Computer Anatomy logo"
          width={128}
          height={128}
          priority
          className="h-8 w-8 rounded-lg object-cover"
        />
      </div>

      {/* Name + short subtitle. */}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13.5px] font-semibold leading-tight tracking-tight text-foreground">
          Computer Anatomy
        </span>
        <span className="hidden truncate text-[10.5px] leading-tight text-muted-2 sm:block">
          Assembly Home
        </span>
      </div>

      {/* 3D Explorer button linking back to the interactive explorer. */}
      <Link
        href="/explore"
        className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-surface-3 hover:text-accent"
      >
        <Box className="h-3.5 w-3.5" strokeWidth={1.8} />
        3D Explorer
      </Link>

      {/* Compact version badge (hidden on small screens). */}
      <span className="hidden shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-2 sm:inline-flex">
        v0.1
      </span>
    </header>
  );
}
