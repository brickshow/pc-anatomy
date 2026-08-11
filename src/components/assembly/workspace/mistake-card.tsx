// mistake-card.tsx: One small "common mistake" card. Clicking one previews the
// error feedback state inside the viewer (the active card stays highlighted).
import { TriangleAlert } from "lucide-react";
import type { StepMistake } from "@/lib/assembly";
import { cn } from "@/lib/utils";

export function MistakeCard({
  mistake,
  active,
  onSelect,
}: {
  mistake: StepMistake;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-red-400/50 bg-red-400/[0.06]"
          : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface-2",
      )}
    >
      <div className="flex items-start gap-2.5">
        <TriangleAlert
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0",
            active ? "text-red-400" : "text-muted-2",
          )}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "text-[12.5px] font-semibold",
              active ? "text-red-300" : "text-foreground",
            )}
          >
            {mistake.title}
          </p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
            {mistake.detail}
          </p>
        </div>
      </div>
    </button>
  );
}
