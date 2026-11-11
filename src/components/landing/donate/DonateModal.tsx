"use client";

// DonateModal.tsx: The donation modal, opened by the "Buy Me a Coffee" trigger
// button below the "Open source. Free to explore." footnote. It offers two
// actions:
//   • Generate QR — shows the donation QR code (a short "Generating QR code…"
//     loader plays first, then the image from the environment).
//   • Buy Me a Coffee — opens the configured Ko-fi page.
//
// It reuses the existing design system (dark glass panels, blue accent, thin
// borders, framer-motion animations) so it feels native to the site.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, QrCode, X } from "lucide-react";
import { SUPPORT } from "@/lib/support";
import { EASE } from "@/components/landing/ui/primitives";

type ViewId = "main" | "qr";

// A friendly in-app stand-in for a QR code until the real image is added.
function QrPlaceholder() {
  const modules = [
    [4, 4], [6, 4], [9, 4], [11, 4], [14, 4], [16, 4],
    [4, 6], [9, 6], [11, 6], [14, 6], [16, 6],
    [4, 9], [6, 9], [9, 9], [11, 9], [16, 9],
    [4, 11], [6, 11], [9, 11], [14, 11],
    [6, 14], [9, 14], [14, 14], [16, 14],
    [6, 16], [11, 16], [14, 16], [16, 16],
  ];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2/60 p-5">
      <svg viewBox="0 0 21 21" aria-hidden="true" className="h-36 w-36 text-muted-2">
        {/* Three finder squares */}
        {[
          [1, 1],
          [1, 15],
          [15, 1],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={5} height={5} rx={0.6} fill="currentColor" opacity={0.25} />
            <rect x={x + 1} y={y + 1} width={3} height={3} fill="currentColor" opacity={0.85} />
          </g>
        ))}
        {/* Random-ish data modules */}
        {modules.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" opacity={0.55} />
        ))}
      </svg>
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-2">
        Placeholder QR
      </p>
    </div>
  );
}

// Circular close button.
function CloseButton({ onClick, label = "Close dialog" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition-colors hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <X className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}

// QR display: plays a short "Generating QR code…" loader first, then shows
// the QR image from the environment (or a placeholder if none is configured).
function QrCard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="mt-6 h-60 w-60 overflow-hidden rounded-2xl border border-line bg-surface-2/60 sm:h-64 sm:w-64">
      {ready ? (
        <div className="h-full w-full">
          {SUPPORT.qr ? (
            /* eslint-disable-next-line @next/next/no-img-element -- QR URL is a
               configurable env value that may point to any host (e.g. Cloudinary). */
            <img
              src={SUPPORT.qr}
              alt="Donation QR code"
              width={256}
              height={256}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <QrPlaceholder />
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-2">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
          <p className="text-[12.5px] font-medium text-muted">Generating QR code…</p>
        </div>
      )}
    </div>
  );
}

export function DonateModal() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewId>("main");
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Reset to the picker so the next open starts fresh.
    window.setTimeout(() => setView("main"), 250);
  }, []);

  const goBack = useCallback(() => setView("main"), []);

  // Lock background scrolling while the modal is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  // Escape closes; move focus into the dialog on open.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      {/* Trigger button placed below the footnote in Community. */}
      <div className="mt-6 flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setView("main");
            setOpen(true);
          }}
          className="group inline-flex h-12 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-6 text-[15px] font-medium text-foreground backdrop-blur-md transition-colors duration-300 hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <span className="text-[15px]" aria-hidden="true">☕</span>
          Buy Me a Coffee
        </motion.button>
      </div>

      {/* Modal overlay + panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {/* Backdrop — clicking it closes the dialog. */}
            <motion.button
              type="button"
              aria-label="Close dialog"
              onClick={close}
              className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
            />

            {/* Panel — bottom sheet on mobile, centered card on desktop. */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Support Computer Anatomy"
              tabIndex={-1}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-hidden rounded-t-3xl border border-line bg-surface/95 shadow-[0_-16px_48px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl outline-none sm:rounded-2xl"
            >
              {/* Accent hairline across the very top. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
              />

              {/* Animated transition between the picker and QR views. */}
              <AnimatePresence mode="wait">
                {view === "main" ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="thin-scroll max-h-[92dvh] overflow-y-auto p-6 sm:p-7"
                  >
                    <header className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-bright">
                          Support
                        </p>
                        <h2 className="text-balance text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                          <span aria-hidden="true">☕</span> Support Computer Anatomy
                        </h2>
                      </div>
                      <CloseButton onClick={close} />
                    </header>

                    <p className="mt-3 text-pretty text-[13.5px] leading-relaxed text-muted">
                      Help keep this project free and open-source.
                    </p>

                    {/* The two donation actions. */}
                    <div className="mt-6 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setView("qr")}
                        className="group flex w-full items-center gap-3.5 rounded-xl border border-line bg-surface-2/60 px-4 py-3.5 text-left transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-accent-bright">
                          <QrCode className="h-5 w-5" strokeWidth={1.6} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[14px] font-medium text-foreground">
                            Generate QR
                          </span>
                          <span className="text-[12px] text-muted-2">
                            Scan to donate directly
                          </span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-bright"
                          strokeWidth={1.8}
                        />
                      </button>

                      <a
                        href={SUPPORT.koFiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex w-full items-center gap-3.5 rounded-xl border border-line bg-surface-2/60 px-4 py-3.5 text-left transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        <span className="text-2xl leading-none" aria-hidden="true">☕</span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[14px] font-medium text-foreground">
                            Buy Me a Coffee
                          </span>
                          <span className="text-[12px] text-muted-2">Open the Ko-fi page</span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-bright"
                          strokeWidth={1.8}
                        />
                      </a>
                    </div>

                    <p className="mt-5 font-mono text-[10px] leading-relaxed tracking-tight text-muted-2">
                      Your support keeps every lesson free for everyone.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="thin-scroll max-h-[92dvh] overflow-y-auto p-6 sm:p-7"
                  >
                    <header className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
                        Back
                      </button>
                      <CloseButton onClick={close} />
                    </header>

                    <div className="mt-2 flex flex-col items-center text-center">
                      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        <span aria-hidden="true">☕</span> Support Computer Anatomy
                      </h2>

                      {/* QR code: loader first, then the image from the env. */}
                      <QrCard />

                      <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-muted">
                        Scan the QR code using your mobile banking app.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
