// step-timeline.tsx: The vertical 3-step instruction timeline for the active
// assembly step. Each item is a numbered circle with a title and one-line
// detail, connected by a thin vertical line.
import type { AssemblyStep } from "@/lib/assembly";

export function StepTimeline({
  instructions,
}: {
  instructions: AssemblyStep["instructions"];
}) {
  return (
    <ol className="space-y-0">
      {instructions.map((instruction, i) => {
        const isLast = i === instructions.length - 1;
        return (
          <li key={instruction.title} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Vertical connector line, dropped below the last item. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 bottom-0 w-px bg-line-strong"
              />
            )}
            <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft font-mono text-[11.5px] font-bold text-accent-bright">
              {i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-[13px] font-semibold text-foreground">
                {instruction.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                {instruction.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
