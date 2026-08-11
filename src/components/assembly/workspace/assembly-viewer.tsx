"use client";

// assembly-viewer.tsx: The center 3D viewport of the workspace. The real
// three.js scene plugs in here later; for now this is a styled placeholder
// with a clickable "hotspot" that simulates the installation interaction:
//   idle       -> click to install
//   installing -> brief spinner animation
//   installed  -> success state
//   error      -> the active common-mistake feedback demo
import { motion } from "framer-motion";
import {
  Check,
  Loader2,
  MousePointerClick,
  RotateCw,
  TriangleAlert,
} from "lucide-react";
import type { AssemblyStep, InstallStatus } from "@/lib/assembly";

// HUD-style corner brackets framing the viewport (decorative, like the menu).
const CORNERS = [
  "left-3 top-3 border-l border-t",
  "right-3 top-3 border-r border-t",
  "bottom-3 left-3 border-b border-l",
  "bottom-3 right-3 border-b border-r",
];

export function AssemblyViewer({
  step,
  status,
  mistakeTitle,
  onInstall,
}: {
  step: AssemblyStep;
  status: InstallStatus;
  mistakeTitle: string | null;
  onInstall: () => void;
}) {
  const busy = status === "installing";
  const done = status === "installed";
  const failed = status === "error";

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-line-strong bg-background/40">
      {/* Grid floor + glow backdrop. */}
      <div
        aria-hidden
        className="absolute inset-0 viewer-backdrop"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(140,172,215,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(140,172,215,0.05) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Top-left: target chip. */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted backdrop-blur-md">
          <MousePointerClick className="h-3 w-3 text-accent-bright" />
          Target: {step.target}
        </span>
      </div>

      {/* Top-right: step number chip. */}
      <div className="absolute right-4 top-4 z-10">
        <span className="inline-flex items-center rounded-full border border-line-strong bg-surface/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted backdrop-blur-md">
          Step&nbsp;<span className="text-accent-bright">0{step.id}</span>
        </span>
      </div>

      {/* Corner HUD brackets. */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden sm:block">
        {CORNERS.map((c) => (
          <span key={c} className={`absolute h-5 w-5 border-line-strong ${c}`} />
        ))}
      </div>

      {/* Center interaction hotspot. */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="flex max-w-xs flex-col items-center text-center">
          {busy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-accent/30" />
                <Loader2 className="h-7 w-7 animate-spin text-accent-bright" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">
                Installing {step.component}…
              </p>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-widest text-muted">
                Aligning {step.target}
              </p>
            </motion.div>
          )}

          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center"
            >
              <span className="relative flex h-16 w-16 items-center justify-center">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-emerald-400/40"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </span>
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {step.component} installed
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Perfect — aligned and locked into the {step.target}.
              </p>
            </motion.div>
          )}

          {failed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10">
                <TriangleAlert className="h-7 w-7 text-red-400" />
              </span>
              <p className="mt-4 text-sm font-semibold text-red-300">
                {mistakeTitle ?? "Something went wrong"}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Review the checklist and try again.
              </p>
            </motion.div>
          )}

          {status === "idle" && (
            <motion.button
              type="button"
              onClick={onInstall}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col items-center"
            >
              <span className="relative flex h-16 w-16 items-center justify-center">
                {/* Expanding radar ping. */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-accent/50"
                  animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/50 bg-accent-soft shadow-[0_0_30px_rgba(77,141,255,0.35)] transition-colors group-hover:bg-accent/20">
                  <MousePointerClick className="h-6 w-6 text-accent-bright" />
                </span>
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface/85 px-4 py-2 text-[12.5px] font-semibold text-foreground backdrop-blur-md transition-colors group-hover:border-accent/50 group-hover:text-accent-bright">
                Click to install {step.component}
              </span>
              <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
                {step.target} · 0{step.id}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom toolbar hint (the future 3D controls). */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-surface/85 px-4 py-2 backdrop-blur-md">
        <RotateCw className="h-3 w-3 text-muted-2" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
