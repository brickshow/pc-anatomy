"use client";

// This file is a client component (runs in the browser).
// The Explorer is the main layout of the interactive hardware learning
// page. On desktop (1024px+) it shows the component list (Sidebar), the 3D
// preview (Viewer), and the extra details (DetailPanel) side by side.
// On tablet / mobile it switches to a compact, native-feeling stack: a
// mobile header + full-width viewer, a bottom information sheet, and the
// component list moved into a slide-in drawer. All off it reuses the same
// components and global store so the desktop experience stays unchanged.
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Viewer } from "./Viewer";
import { DetailPanel } from "./DetailPanel";
import { ExploreLoader } from "./ExploreLoader";
import { ExploreHeader } from "./ExploreHeader";
import { MobileDrawer } from "./MobileDrawer";
import { MobileInfoSheet } from "./MobileInfoSheet";

export function Explorer() {
  // Whether the mobile component drawer is open (opened from the header hamburger).
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    // Full-screen layout. A column on mobile/tablet, becoming the original
    // row layout (sidebar | viewer | detail panel) on lg+ screens. The loader
    // overlays everything on open.
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top navigation bar with the brand and page title. */}
      <ExploreHeader onOpenMenu={() => setDrawerOpen(true)} />

      <div className="flex min-h-0 min-w-0 flex-1 lg:flex-row">
        {/* Desktop sidebar: fixed 288px column, hidden on mobile/tablet. */}
        <div className="hidden w-[288px] shrink-0 lg:flex">
          <Sidebar />
        </div>

        {/* The viewer fills the available space: full width on mobile, flex-1 on desktop. */}
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <Viewer />
          </div>
        </main>

        {/* Desktop right detail panel (hidden on mobile/tablet). */}
        <div className="hidden shrink-0 lg:flex">
          <DetailPanel />
        </div>
      </div>

      {/* Mobile/tablet bottom component-information sheet (hidden on desktop). */}
      <MobileInfoSheet />

      {/* Mobile/tablet slide-in drawer holding the component list (reuses Sidebar). */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar />
      </MobileDrawer>

      <ExploreLoader />
    </div>
  );
}
