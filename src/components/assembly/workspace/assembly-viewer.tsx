"use client";

// assembly-viewer.tsx: The center 3D viewport of the workspace. Hosts the
// interactive scene (assembly-scene.tsx), a model loading overlay, HUD chips,
// and the context hint that appears while a part is being dragged in.
import type { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MousePointerClick, RotateCw } from "lucide-react";
import { useProgress } from "@react-three/drei";
import { ASSEMBLY_STEPS } from "@/lib/assembly";
import { useWorkspace } from "@/lib/workspace-store";
import { AssemblyScene } from "./scene/assembly-scene";

// HUD-style corner brackets framing the viewport (decorative).
const CORNERS = [
  "left-3 top-3 border-l border-t",
  "right-3 top-3 border-r border-t",
  "bottom-3 left-3 border-b border-l",
  "bottom-3 right-3 border-b border-r",
];

function SceneLoader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-accent-bright" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Loading 3D model · {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

export function AssemblyViewer({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const phase = useWorkspace((s) => s.phase);
  const step = ASSEMBLY_STEPS[stepIndex];

  const dragging =
    phase === "dragging" || phase === "valid-target" || phase === "invalid-target";

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-line-strong bg-background/40">
      {/* Grid floor + glow backdrop behind the transparent canvas. */}
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

      <AssemblyScene />
      <SceneLoader />

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

      {/* Drag context hint. */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-surface/85 px-4 py-2 font-mono text-[10.5px] uppercase tracking-widest text-accent-bright shadow-[0_0_24px_rgba(77,141,255,0.25)] backdrop-blur-md">
              <MousePointerClick className="h-3 w-3" />
              Release to {phase === "valid-target" ? "drop the part" : "return it"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom toolbar hint. */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-surface/85 px-4 py-2 backdrop-blur-md">
        <RotateCw className="h-3 w-3 text-muted-2" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
