"use client";

// use-drag-controller.ts: Pointer-capture handlers that let a tray item be
// dragged into the 3D viewport. They write the pointer NDC into drag-bus on
// move and finalize the drop (through the store) on pointerup. The scene reads
// the NDC every frame and writes back the ghost position + validity.
//
// Interaction model:
//   pointerdown -> select the part (phase "selecting")
//   move past a small threshold -> start dragging (phase "dragging")
//   pointerup     -> if the scene reported a valid drop, snap; otherwise show
//                    explanatory feedback (never punishes a wrong drop).

import { useRef, type PointerEvent, type RefObject } from "react";
import { ASSEMBLY_INVENTORY } from "@/lib/assembly";
import { getItemAvailability, useWorkspace } from "@/lib/workspace-store";
import { dragBus } from "./drag-bus";

// Pixels of movement before a press becomes a drag (keeps plain clicks as
// select/toggle, which is what makes the drop-ring "place" click work).
const DRAG_THRESHOLD = 6;

const ACTIVE_PHASES = ["dragging", "valid-target", "invalid-target"];

export function useDragController(viewerRef: RefObject<HTMLDivElement | null>) {
  const originRef = useRef<{ x: number; y: number } | null>(null);

  const trayPointerDown = (e: PointerEvent<HTMLButtonElement>, itemId: string) => {
    const item = ASSEMBLY_INVENTORY.find((i) => i.id === itemId);
    const s = useWorkspace.getState();
    if (!item || getItemAvailability(item, s) === "locked") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    originRef.current = { x: e.clientX, y: e.clientY };
    s.selectItem(itemId);
  };

  const trayPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = useWorkspace.getState();

    // Promote a select into a drag once the pointer moves far enough.
    if (s.phase === "selecting") {
      const o = originRef.current;
      if (!o) return;
      if (Math.hypot(e.clientX - o.x, e.clientY - o.y) < DRAG_THRESHOLD) return;
      s.startDrag();
    }

    // Re-read: startDrag may have just promoted "selecting" -> "dragging".
    const s2 = useWorkspace.getState();
    if (!ACTIVE_PHASES.includes(s2.phase)) return;
    writeNdc(e, viewerRef);
  };

  const trayPointerUp = () => {
    const s = useWorkspace.getState();
    originRef.current = null;
    if (!ACTIVE_PHASES.includes(s.phase)) return;

    const { ghost, valid, message } = dragBus;
    dragBus.reset();
    s.endDrag(
      ghost && valid
        ? { ok: true, message: "" }
        : { ok: false, message: message || "Drop the part inside the 3D workspace." },
    );
  };

  return { trayPointerDown, trayPointerMove, trayPointerUp };
}

// Converts a pointer position into NDC relative to the 3D viewport.
function writeNdc(
  e: PointerEvent<HTMLButtonElement>,
  viewerRef: RefObject<HTMLDivElement | null>,
) {
  const rect = viewerRef.current?.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return;
  dragBus.ndc = {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
  };
}
