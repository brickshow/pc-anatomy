// drag-bus.ts: A tiny mutable bridge between the DOM (pointer events over the
// viewport) and the R3F scene. The scene reads the pointer NDC every frame and
// writes back the projected ghost position + drop validity, which the DOM drop
// handler consumes on pointerup. Keeping this outside React state avoids
// re-rendering the whole tree on every pointermove.

export type DragBus = {
  // Pointer position in normalized device coordinates over the viewport.
  ndc: { x: number; y: number } | null;
  // Projected ghost position on the workbench plane.
  ghost: { x: number; y: number; z: number } | null;
  // Whether the ghost currently sits over a valid drop target.
  valid: boolean;
  // The latest drop message (empty when valid).
  message: string;
  reset: () => void;
};

export const dragBus: DragBus = {
  ndc: null,
  ghost: null,
  valid: false,
  message: "",
  reset() {
    this.ndc = null;
    this.ghost = null;
    this.valid = false;
    this.message = "";
  },
};
