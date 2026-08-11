"use client";

// step-navigation.tsx: The bottom control bar. Shows a progress bar, the
// current step number, and Previous / Next buttons that move through the build.
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepNavigation({
  stepId,
  total,
  onPrev,
  onNext,
}: {
  stepId: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isFirst = stepId === 1;
  const isLast = stepId === total;
  const progress = stepId / total;

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
          onClick={onPrev}
          disabled={isFirst}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent-bright disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        <div className="mx-auto flex flex-col items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
            Step {String(stepId).padStart(2, "0")} of {total}
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[12.5px] font-semibold transition-colors",
            isLast
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
      </div>
    </div>
  );
}
