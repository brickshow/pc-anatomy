// step-timeline.tsx: The vertical sub-action timeline for the active assembly
// step. Each item is a numbered circle with a title and one-line detail,
// connected by a thin vertical line. Items reflect the step's live progress:
//   done    -> ✓ (emerald)
//   current -> highlighted accent number
//   pending -> dimmed
import { Check } from "lucide-react";
import type { SubAction } from "@/lib/assembly";
import { cn } from "@/lib/utils";

export function StepTimeline({
  subActions,
  done,
}: {
  subActions: SubAction[];
  done: number;
}) {
  return (
    <ol className="space-y-0">
      {subActions.map((sa, i) => {
        const isLast = i === subActions.length - 1;
        const state = i < done ? "done" : i === done ? "current" : "pending";
        return (
          <li key={sa.id} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Vertical connector line, dropped below the last item. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 bottom-0 w-px bg-line-strong"
              />
            )}
            <span
              className={cn(
                "relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11.5px] font-bold",
                state === "done" &&
                  "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
                state === "current" &&
                  "border-accent/50 bg-accent-soft text-accent-bright",
                state === "pending" &&
                  "border-line-strong bg-surface-2 text-muted-2",
              )}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-[13px] font-semibold",
                  state === "done" ? "text-muted" : "text-foreground",
                )}
              >
                {sa.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                {sa.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
