"use client";

// ExploreHeader.tsx: The top navigation bar shown on all screen sizes on the
// Explore page. On mobile/tablet it provides the hamburger button that opens
// the components drawer; on every size it shows the brand and page title.
import Image from "next/image";
import { Menu } from "lucide-react";

export function ExploreHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/80 px-3.5 backdrop-blur-xl">
      {/* Hamburger button opens the components drawer (mobile/tablet only). */}
      <button
        type="button"
        aria-label="Open components list"
        onClick={onOpenMenu}
        className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-foreground transition-colors active:bg-surface-3 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} />
      </button>

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
        <h1 className="hidden truncate text-[10.5px] leading-tight text-muted-2 sm:block">
          Explore Components in 3D
        </h1>
      </div>

      {/* Compact version badge (hidden on small screens). */}
      <span className="ml-auto hidden shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-2 sm:inline-flex">
        v0.1
      </span>
    </header>
  );
}
