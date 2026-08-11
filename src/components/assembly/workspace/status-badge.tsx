// status-badge.tsx: A small chip that communicates the current interaction
// phase of the active step (ready / selecting / dragging / securing / …).
import { Check, Loader2, TriangleAlert, MousePointerClick } from "lucide-react";
import type { InteractionPhase } from "@/lib/assembly";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  InteractionPhase,
  { label: string; className: string; icon: "hand" | "spinner" | "check" | "alert" | "none" }
> = {
  idle: {
    label: "Ready",
    className: "border-line-strong bg-surface-2 text-muted",
    icon: "hand",
  },
  selecting: {
    label: "Selected",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    icon: "hand",
  },
  dragging: {
    label: "Dragging",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    icon: "hand",
  },
  "valid-target": {
    label: "Drop here",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: "check",
  },
  "invalid-target": {
    label: "Not here",
    className: "border-red-400/40 bg-red-400/10 text-red-300",
    icon: "alert",
  },
  placing: {
    label: "Snapping",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    icon: "spinner",
  },
  placed: {
    label: "Placed",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    icon: "check",
  },
  securing: {
    label: "Securing",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    icon: "spinner",
  },
  secured: {
    label: "Secured",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: "check",
  },
  completed: {
    label: "Complete",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: "check",
  },
};

export function StatusBadge({ status }: { status: InteractionPhase }) {
  const config = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider",
        config.className,
      )}
    >
      {config.icon === "hand" && <MousePointerClick className="h-3 w-3" />}
      {config.icon === "spinner" && <Loader2 className="h-3 w-3 animate-spin" />}
      {config.icon === "check" && <Check className="h-3 w-3" />}
      {config.icon === "alert" && <TriangleAlert className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
