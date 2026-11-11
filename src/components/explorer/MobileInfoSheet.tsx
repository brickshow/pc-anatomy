"use client";

// MobileInfoSheet.tsx: The bottom information sheet for tablet/mobile. It
// replaces the desktop right-hand DetailPanel. When collapsed it shows just
// the component number, name, short description, and an expand indicator.
// Dragging it up (or tapping) expands it into a tall panel with the full
// educational content: Overview, Functions, Common Issues, Interesting Fact
// and Model Credit. When a motherboard/case/mouse/monitor hotspot is active
// it mirrors the desktop hotspot details instead.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  Lightbulb,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getComponent } from "@/lib/components";
import { useExplorer } from "@/lib/store";
import { ModelCredits } from "@/components/viewer/ModelCredits";

// Height (px) of the sheet when collapsed.
const COLLAPSED_HEIGHT = 120;
// Fraction of the viewport the sheet occupies when fully expanded.
const EXPANDED_FRACTION = 0.76;
// Drag distance (px) that counts as an intentional expand/collapse gesture.
const DRAG_THRESHOLD = 42;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
      {children}
    </h3>
  );
}

export function MobileInfoSheet() {
  const selectedId = useExplorer((s) => s.selectedId);
  const hotspotPart = useExplorer((s) => s.hotspotPart);
  const hotspotActive = useExplorer((s) => s.hotspotActive);
  const hotspotIndex = useExplorer((s) => s.hotspotIndex);
  const hotspotTotal = useExplorer((s) => s.hotspotTotal);
  const nextHotspot = useExplorer((s) => s.nextHotspot);
  const prevHotspot = useExplorer((s) => s.prevHotspot);
  const component = getComponent(selectedId) ?? getComponent("cpu")!;

  // Expanded state + the live height (used while dragging).
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(COLLAPSED_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const dragStartY = useRef(0);

  const expandedHeight = typeof window !== "undefined"
    ? Math.round(window.innerHeight * EXPANDED_FRACTION)
    : 480;

  // Re-clamp the height on resize so an expanded sheet always fits the viewport.
  useEffect(() => {
    const onResize = () => {
      setHeight(expanded
        ? Math.round(window.innerHeight * EXPANDED_FRACTION)
        : COLLAPSED_HEIGHT);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [expanded]);

  const sheetHeight = isDragging
    ? height
    : expanded
      ? expandedHeight
      : COLLAPSED_HEIGHT;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = dragStartY.current - e.clientY;
    const base = expanded ? expandedHeight : COLLAPSED_HEIGHT;
    setHeight(Math.min(expandedHeight, Math.max(COLLAPSED_HEIGHT, base + delta)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const delta = dragStartY.current - e.clientY;
    // A small movement counts as a tap -> toggle.
    if (Math.abs(delta) < 8) {
      setExpanded((v) => !v);
      return;
    }
    // Dragging up past the threshold expands; dragging down collapses.
    if (delta > DRAG_THRESHOLD) setExpanded(true);
    else if (delta < -DRAG_THRESHOLD) setExpanded(false);
    else setHeight(expanded ? expandedHeight : COLLAPSED_HEIGHT);
  };

  // What to show in the summary + (if a hotspot is active) expanded sections.
  const title = hotspotActive && hotspotPart ? hotspotPart.title : component.name;
  const meta = hotspotActive
    ? `${hotspotIndex + 1} of ${hotspotTotal} · ${component.name}`
    : component.tagline;
  const summary = hotspotActive
    ? hotspotPart?.description
    : component.short;

  return (
    // Fixed bottom sheet, shown only on tablet/mobile (hidden on lg+).
    <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <motion.div
        animate={{ height: sheetHeight }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="flex w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-line bg-surface/95 shadow-[0_-16px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {/* Draggable header (grab handle + summary). */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse details" : "Expand details"}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex w-full cursor-pointer touch-none flex-col border-b border-line px-4 pt-2.5 pb-3 text-left"
          style={{ WebkitTouchCallout: "none" }}
        >
          {/* Drag handle pill. */}
          <span className="mx-auto mb-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" />

          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] font-medium tracking-tight text-accent">
              {component.index}
            </span>
            <h2 className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h2>
            {/* Expand/collapse indicator. */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-foreground transition-transform active:scale-95">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </span>
          </div>

          <p className="mt-1 truncate text-[12px] text-muted">{meta}</p>
          {!expanded && summary && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-2">{summary}</p>
          )}
        </button>

        {/* Content area shown when expanded. */}
        {expanded && (
          <>
            {/* Scrollable detailed sections. */}
            <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {hotspotActive && hotspotPart ? (
                /* ---- Hotspot details (mirrors desktop HotspotContent). ---- */
                <>
                  <section className="space-y-1.5">
                    <SectionTitle>
                      <Sparkles className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Overview
                    </SectionTitle>
                    <p className="text-[13px] leading-relaxed text-foreground/90">
                      {hotspotPart.description}
                    </p>
                  </section>
                  <section className="space-y-1.5 rounded-xl border border-line bg-surface-2/60 p-3.5">
                    <SectionTitle>
                      <MapPin className="h-3 w-3" strokeWidth={1.8} />
                      Primary Function
                    </SectionTitle>
                    <p className="text-[12.5px] leading-relaxed text-foreground/85">
                      {hotspotPart.function}
                    </p>
                  </section>
                  <section className="space-y-1.5">
                    <SectionTitle>
                      <Crosshair className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Why It Is Important
                    </SectionTitle>
                    <p className="text-[12.5px] leading-relaxed text-foreground/85">
                      {hotspotPart.importance}
                    </p>
                  </section>
                  <section className="space-y-2">
                    <SectionTitle>
                      <Lightbulb className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Interesting Facts
                    </SectionTitle>
                    {hotspotPart.facts.map((fact) => (
                      <div
                        key={fact}
                        className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <p className="text-[12.5px] leading-relaxed text-muted">{fact}</p>
                      </div>
                    ))}
                  </section>
                </>
              ) : (
                /* ---- Component details (single scroll of all desktop tabs). ---- */
                <>
                  <section className="space-y-1.5">
                    <SectionTitle>
                      <Sparkles className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Overview
                    </SectionTitle>
                    <p className="text-[13px] leading-relaxed text-foreground/90">
                      {component.overview.description}
                    </p>
                    <p className="text-[12.5px] leading-relaxed text-muted">
                      {component.overview.realWorld}
                    </p>
                  </section>

                  <section className="space-y-2">
                    <SectionTitle>
                      <Sparkles className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Functions
                    </SectionTitle>
                    {component.functions.map((fn) => (
                      <div
                        key={fn}
                        className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <p className="text-[12.5px] leading-relaxed text-foreground/90">{fn}</p>
                      </div>
                    ))}
                  </section>

                  <section className="space-y-2">
                    <SectionTitle>
                      <Crosshair className="h-3 w-3 text-accent" strokeWidth={1.8} />
                      Common Issues
                    </SectionTitle>
                    {component.issues.map((issue) => (
                      <div
                        key={issue}
                        className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                        <p className="text-[12.5px] leading-relaxed text-foreground/90">{issue}</p>
                      </div>
                    ))}
                  </section>

                  {/* Interesting fact (accent box). */}
                  <div className="rounded-xl border border-accent/25 bg-accent-soft p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                        Interesting Fact
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-foreground/85">
                      {component.overview.fact}
                    </p>
                  </div>

                  <ModelCredits key={component.id} credit={component.credits} />
                </>
              )}
              {/* Bottom safe-area padding. */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>

            {/* Prev/next hotspot controls pinned at the sheet's bottom (expanded). */}
            <div className="flex items-center justify-between gap-3 border-t border-line p-3">
              <button
                type="button"
                aria-label="Previous hotspot"
                onClick={prevHotspot}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-2 px-4 text-[12px] font-medium text-foreground transition-colors active:bg-surface-3"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
                Previous
              </button>
              <button
                type="button"
                aria-label="Next hotspot"
                onClick={nextHotspot}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 text-[12px] font-semibold text-white transition-colors active:bg-accent-bright"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
            {/* Bottom safe-area padding under the nav row. */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </>
        )}
      </motion.div>
    </div>
  );
}
