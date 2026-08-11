"use client";

// assembly-workspace.tsx: The full interactive workspace. Composes the build
// progress rail, the 3D viewport, the step details panel, the parts tray, and
// the navigation bar — all driven by the single workspace store, so every part
// of the UI always reflects the same interaction state.
//
//   - Progress rail   -> which steps are done / current / locked
//   - 3D viewport     -> the interactive scene + feedback toasts + success overlays
//   - Step details    -> sub-action timeline + the "next action" card
//   - Parts tray      -> drag a part from here into the viewport
//   - Navigation      -> Previous / Next / Build again through the store
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ListChecks,
  PartyPopper,
  Play,
  Square,
  TriangleAlert,
} from "lucide-react";
import { ASSEMBLY_STEPS } from "@/lib/assembly";
import type { StepFeedback } from "@/lib/assembly";
import {
  getStepProgress,
  useWorkspace,
} from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { StepIcon } from "./step-icon";
import { StatusBadge } from "./status-badge";
import { AssemblyViewer } from "./assembly-viewer";
import { StepNavigation } from "./step-navigation";
import { PartsTray } from "./parts-tray";
import { StepDetails } from "./step-details";
import { useDragController } from "./scene/use-drag-controller";

const EASE = [0.22, 1, 0.36, 1] as const;

const TOTAL = ASSEMBLY_STEPS.length;

// Floating feedback pill over the viewport (✓ Correct / ⚠ Try again).
function FeedbackToast({ feedback }: { feedback: StepFeedback | null }) {
  const correct = feedback?.kind === "correct";
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="absolute left-1/2 top-3 z-30 -translate-x-1/2"
        >
          <span
            className={cn(
              "inline-flex max-w-[min(92vw,420px)] items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold backdrop-blur-md",
              correct
                ? "border-emerald-400/40 bg-surface/90 text-emerald-300"
                : "border-red-400/40 bg-surface/90 text-red-300",
            )}
          >
            {correct ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-red-400" />
            )}
            <span className="truncate">{feedback.message}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AssemblyWorkspace() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { trayPointerDown, trayPointerMove, trayPointerUp } =
    useDragController(viewerRef);

  const state = useWorkspace();
  const {
    stepIndex,
    completedStepIds,
    subProgress,
    phase,
    feedback,
    successStepId,
    showMeActive,
    finished,
    goToStep,
    setShowMe,
    advanceFromSuccess,
    reset,
  } = state;

  const step = ASSEMBLY_STEPS[stepIndex];
  const currentId = stepIndex + 1;
  const successStep = successStepId ? ASSEMBLY_STEPS[successStepId - 1] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        {/* Workspace header: current step + live status + show-me toggle. */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent-soft">
              <StepIcon name={step.icon} className="h-4.5 w-4.5 text-accent-bright" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight text-foreground">
                {step.title}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
                Step 0{step.id} · {step.component}
              </p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMe(!showMeActive)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold transition-colors",
                showMeActive
                  ? "border-accent/60 bg-accent-soft text-accent-bright"
                  : "border-line bg-surface-2 text-muted hover:border-accent/40 hover:text-accent-bright",
              )}
            >
              {showMeActive ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {showMeActive ? "Stop guide" : "Show me"}
              </span>
              <span className="sm:hidden">{showMeActive ? "Stop" : "Guide"}</span>
            </button>
            <StatusBadge status={phase} />
          </div>
        </div>

        {/* Mobile step strip (horizontal, below lg). */}
        <div className="thin-scroll -mx-3 shrink-0 overflow-x-auto px-3 sm:-mx-4 sm:px-4 lg:hidden">
          <div className="flex w-max gap-2">
            {ASSEMBLY_STEPS.map((s) => {
              const progress = getStepProgress(s.id, state);
              const done = progress === "done";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                    s.id === currentId
                      ? "border-accent/60 bg-accent-soft text-accent-bright"
                      : done
                        ? "border-emerald-400/25 bg-surface/70 text-muted"
                        : "border-line bg-surface/70 text-muted",
                  )}
                >
                  <StepIcon name={s.icon} className="h-3.5 w-3.5" />
                  {s.component}
                  {done && <Check className="h-3 w-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main three-column area. */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
          {/* Left rail: build progress (desktop). */}
          <aside className="hidden w-60 shrink-0 flex-col rounded-2xl border border-line bg-surface/60 lg:flex">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <ListChecks className="h-3.5 w-3.5 text-accent-bright" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Build Progress
              </span>
              <span className="ml-auto font-mono text-[10px] text-muted-2">
                {completedStepIds.length}/{TOTAL}
              </span>
            </div>
            <div className="thin-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5">
              {ASSEMBLY_STEPS.map((s) => {
                const progress = getStepProgress(s.id, state);
                const active = progress === "current";
                const done = progress === "done";
                const locked = progress === "locked";
                const subDone = subProgress[s.id] ?? 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-accent/50 bg-accent-soft"
                        : locked
                          ? "cursor-default border-transparent"
                          : "border-transparent hover:border-line hover:bg-surface-2",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10.5px] font-bold",
                        active
                          ? "border-accent/50 bg-accent/15 text-accent-bright"
                          : done
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                            : "border-line-strong bg-surface-2 text-muted-2 group-hover:text-foreground",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : String(s.id).padStart(2, "0")}
                    </span>
                    <StepIcon
                      name={s.icon}
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active
                          ? "text-accent-bright"
                          : done
                            ? "text-emerald-400/80"
                            : "text-muted-2 group-hover:text-foreground",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[12.5px] font-medium",
                          active ? "text-foreground" : "text-muted",
                        )}
                      >
                        {s.component}
                      </p>
                      {/* Sub-action dots. */}
                      <div className="mt-1 flex items-center gap-1">
                        {s.subActions.map((sa, i) => (
                          <span
                            key={sa.id}
                            className={cn(
                              "h-1 w-3.5 rounded-full",
                              i < subDone
                                ? "bg-emerald-400/70"
                                : i === subDone
                                  ? "bg-accent-bright"
                                  : "bg-line-strong",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-line px-4 py-3">
              <p className="text-[10.5px] leading-relaxed text-muted-2">
                Complete each step to build the full system. Drag parts from the
                tray into the 3D viewport.
              </p>
            </div>
          </aside>

          {/* Center: 3D viewport + overlays. */}
          <div className="relative min-h-0 flex-1">
            <AssemblyViewer containerRef={viewerRef} />
            <FeedbackToast feedback={feedback} />

            {/* Step success overlay. */}
            <AnimatePresence>
              {successStep && !finished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-background/40 backdrop-blur-[2px]"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 12 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex max-w-xs flex-col items-center rounded-2xl border border-line bg-surface/95 p-6 text-center shadow-2xl"
                  >
                    <span className="relative flex h-14 w-14 items-center justify-center">
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-full border border-emerald-400/40"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </span>
                    </span>
                    <p className="mt-4 text-[15px] font-bold text-foreground">
                      {successStep.componentName} installed
                    </p>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {successStep.reference}
                    </p>
                    <button
                      type="button"
                      onClick={advanceFromSuccess}
                      className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-xl border border-accent/50 bg-accent-soft px-4 text-[12.5px] font-semibold text-accent-bright transition-colors hover:bg-accent/20"
                    >
                      Continue
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Finished overlay. */}
            <AnimatePresence>
              {finished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-[2px]"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 12 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                    className="flex max-w-sm flex-col items-center rounded-2xl border border-line bg-surface/95 p-7 text-center shadow-2xl"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent-soft">
                      <PartyPopper className="h-8 w-8 text-accent-bright" />
                    </span>
                    <p className="mt-4 text-lg font-bold text-foreground">
                      Build complete!
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                      Every component is installed and secured — a complete
                      working PC, built step by step.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-accent/50 bg-accent-soft px-4 text-[12.5px] font-semibold text-accent-bright transition-colors hover:bg-accent/20"
                      >
                        Build again
                      </button>
                      <Link
                        href="/assembly"
                        className="inline-flex h-9 items-center rounded-xl border border-line bg-surface-2 px-4 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent-bright"
                      >
                        Assembly Home
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: step details panel. */}
          <aside className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface/60 backdrop-blur-xl lg:w-[360px] lg:flex-none">
            <StepDetails />
          </aside>
        </div>
      </div>

      {/* Bottom: parts tray + navigation. */}
      <PartsTray
        onPointerDown={trayPointerDown}
        onPointerMove={trayPointerMove}
        onPointerUp={trayPointerUp}
      />
      <StepNavigation />
    </div>
  );
}
