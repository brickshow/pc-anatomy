"use client";

// step-navigation.tsx: The bottom control bar. Shows a progress bar, the
// current step number, and Previous / Next buttons. "Next" only advances once
// the current step is complete; once the whole build is finished it becomes a
// Reset. All navigation flows through the workspace store.
import { ArrowLeft, ArrowRight, Flag, RotateCcw } from "lucide-react";
import { ASSEMBLY_STEPS } from "@/lib/assembly";
import { useWorkspace } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";

export function StepNavigation() {
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const completedStepIds = useWorkspace((s) => s.completedStepIds);
  const finished = useWorkspace((s) => s.finished);
  const goToStep = useWorkspace((s) => s.goToStep);
  const advanceFromSuccess = useWorkspace((s) => s.advanceFromSuccess);
  const reset = useWorkspace((s) => s.reset);

  const total = ASSEMBLY_STEPS.length;
  const currentId = stepIndex + 1;
  const isFirst = currentId === 1;
  const isLast = currentId === total;
  const stepDone = completedStepIds.includes(currentId);
  const progress = finished ? 1 : completedStepIds.length / total;

  return (
    <div className="shrink-0 border-t border-line bg-surface/70 backdrop-blur-xl">
      {/* Thin progress bar across the top of the bar. */}
      <div className="h-0.5 w-full bg-line">
        <div
          className="h-full bg-linear-to-r from-accent to-accent-bright transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => goToStep(currentId - 1)}
          disabled={isFirst}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent-bright disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        <div className="mx-auto flex flex-col items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
            {finished
              ? "Build complete"
              : `Step ${String(currentId).padStart(2, "0")} of ${total}`}
          </span>
        </div>

        {finished ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-accent/50 bg-accent-soft px-3.5 text-[12.5px] font-semibold text-accent-bright transition-colors hover:bg-accent/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Build again
          </button>
        ) : (
          <button
            type="button"
            onClick={advanceFromSuccess}
            disabled={!stepDone}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[12.5px] font-semibold transition-colors",
              !stepDone
                ? "border border-line bg-surface-2 text-muted disabled:pointer-events-none disabled:opacity-40"
                : "border border-accent/50 bg-accent-soft text-accent-bright hover:bg-accent/20",
            )}
          >
            {isLast ? (
              <>
                <Flag className="h-3.5 w-3.5" />
                Finish
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
