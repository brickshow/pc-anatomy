"use client";

// parts-tray.tsx: The bottom parts tray. Lists every part in the inventory and
// shows its availability (installed / available / selected / locked). Pressing
// an available part starts a drag into the 3D viewport — the pointer handlers
// come from useDragController in the workspace, so they can compute the drag
// coordinates against the viewport bounds.
import { Check, Lock } from "lucide-react";
import { ASSEMBLY_INVENTORY } from "@/lib/assembly";
import { getItemAvailability, getItemLockMessage, useWorkspace } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { StepIcon } from "./step-icon";

export function PartsTray({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>, itemId: string) => void;
  onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const state = useWorkspace();

  return (
    <div className="shrink-0 border-t border-line bg-surface/70 px-3 pt-2.5 pb-3 backdrop-blur-xl sm:px-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
        Parts Tray
      </p>
      <div className="thin-scroll -mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4">
        <div className="flex w-max gap-2">
          {ASSEMBLY_INVENTORY.map((item) => {
            const availability = getItemAvailability(item, state);
            const locked = availability === "locked";
            const selected = availability === "selected";
            const installed = availability === "installed";
            return (
              <button
                key={item.id}
                type="button"
                title={locked ? getItemLockMessage(item) : item.name}
                onPointerDown={(e) => onPointerDown(e, item.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className={cn(
                  "relative flex w-[92px] shrink-0 select-none flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-colors touch-none",
                  locked && "cursor-not-allowed opacity-45",
                  selected &&
                    "border-accent/60 bg-accent-soft shadow-[0_0_24px_rgba(77,141,255,0.25)]",
                  !selected && !locked && "border-line bg-surface-2/70 hover:border-accent/40",
                  installed && "opacity-75",
                )}
              >
                {installed && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </span>
                )}
                {locked && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-surface-2">
                    <Lock className="h-2.5 w-2.5 text-muted-2" />
                  </span>
                )}
                <StepIcon
                  name={item.icon}
                  className={cn(
                    "h-5 w-5",
                    selected ? "text-accent-bright" : "text-muted",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    selected ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {item.name}
                </span>
                {item.detail && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-2">
                    {item.detail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
