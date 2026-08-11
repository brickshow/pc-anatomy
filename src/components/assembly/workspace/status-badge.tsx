// status-badge.tsx: A small chip that communicates the current install status
// of the active step (waiting / installing / installed / error).
import { Check, Loader2, TriangleAlert, MousePointerClick } from "lucide-react";
import type { InstallStatus } from "@/lib/assembly";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  InstallStatus,
  { label: string; className: string; iconClassName: string }
> = {
  idle: {
    label: "Waiting",
    className: "border-line-strong bg-surface-2 text-muted",
    iconClassName: "text-muted-2",
  },
  installing: {
    label: "Installing",
    className: "border-accent/40 bg-accent-soft text-accent-bright",
    iconClassName: "text-accent-bright",
  },
  installed: {
    label: "Installed",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    iconClassName: "text-emerald-400",
  },
  error: {
    label: "Check",
    className: "border-red-400/30 bg-red-400/10 text-red-300",
    iconClassName: "text-red-400",
  },
};

export function StatusBadge({ status }: { status: InstallStatus }) {
  const config = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider",
        config.className,
      )}
    >
      {status === "idle" && (
        <MousePointerClick className={cn("h-3 w-3", config.iconClassName)} />
      )}
      {status === "installing" && (
        <Loader2
          className={cn("h-3 w-3 animate-spin", config.iconClassName)}
        />
      )}
      {status === "installed" && (
        <Check className={cn("h-3 w-3", config.iconClassName)} />
      )}
      {status === "error" && (
        <TriangleAlert className={cn("h-3 w-3", config.iconClassName)} />
      )}
      {config.label}
    </span>
  );
}
