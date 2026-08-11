// workspace-store.ts: The interaction state machine for the assembly workspace.
//
// This is the single source of truth for build progress and interaction state.
// The UI panels (steps, tray, instructions) read from it, the 3D workspace
// reads it to know what to render and reports interaction events back into it,
// and — later — the real assembly mechanics will drive and consume exactly this
// same state.
//
// The validation state machine matches the spec:
//   IDLE -> SELECTED -> DRAGGING -> (VALID|INVALID TARGET) -> PLACED -> SECURED -> COMPLETED
// Every interaction goes through here so the UI can always explain the current
// state and never punishes a wrong action (feedback is always explanatory).

import { create } from "zustand";
import {
  ASSEMBLY_INVENTORY,
  ASSEMBLY_STEPS,
  getStepById,
  type InteractionPhase,
  type InventoryItem,
  type StepFeedback,
} from "./assembly";
import { getVisual } from "./assembly-scene";

const ITEM_LOOKUP = Object.fromEntries(
  ASSEMBLY_INVENTORY.map((item) => [item.id, item]),
);

let feedbackSeq = 0;

function makeFeedback(kind: StepFeedback["kind"], message: string): StepFeedback {
  feedbackSeq += 1;
  return { kind, message, id: feedbackSeq };
}

// The outcome of a drop, computed by the 3D workspace and reported back here.
export type DropResult = {
  ok: boolean;
  message: string;
};

export type WorkspaceState = {
  // --- build progress ---
  stepIndex: number;                    // index into ASSEMBLY_STEPS (0-based)
  completedStepIds: number[];           // step ids that are fully finished
  subProgress: Record<number, number>;  // step id -> number of sub-actions done
  optionalPlaced: string[];             // optional parts the user mounted
  finished: boolean;                    // all 8 steps complete

  // --- interaction state ---
  phase: InteractionPhase;
  activeItemId: string | null;          // part currently selected / being dragged
  markerProgress: number;               // markers clicked during a secure/connect sub-action

  // --- ui state ---
  feedback: StepFeedback | null;
  successStepId: number | null;         // step showing the success animation
  showMeActive: boolean;

  // --- actions (UI + 3D workspace call these) ---
  goToStep: (stepId: number) => void;
  selectItem: (itemId: string) => void;
  deselect: () => void;
  startDrag: () => void;
  setDragValidity: (valid: boolean) => void;
  endDrag: (result: DropResult | null) => void;
  placeFromTarget: () => void;
  clickMarker: () => void;
  completeSubAction: () => void;
  completeStep: () => void;
  advanceFromSuccess: () => void;
  praise: (message: string) => void;
  setShowMe: (active: boolean) => void;
  reset: () => void;
};

// The next step id a user still has to complete.
export function firstUncompletedStep(state: WorkspaceState): number {
  for (const step of ASSEMBLY_STEPS) {
    if (!state.completedStepIds.includes(step.id)) return step.id;
  }
  return ASSEMBLY_STEPS.length;
}

// Progress state of a step in the left panel.
export type StepProgressState = "done" | "current" | "locked";

export function getStepProgress(
  stepId: number,
  state: WorkspaceState,
): StepProgressState {
  if (state.completedStepIds.includes(stepId)) return "done";
  if (stepId === firstUncompletedStep(state)) return "current";
  return "locked";
}

// Progress state of one sub-action inside a step.
export type SubActionProgress = "done" | "current" | "pending";

export function getSubActionProgress(
  stepId: number,
  subIndex: number,
  state: WorkspaceState,
): SubActionProgress {
  const done = state.subProgress[stepId] ?? 0;
  if (subIndex < done) return "done";
  if (subIndex === done) return "current";
  return "pending";
}

// Availability of a part in the bottom tray.
export type ItemAvailability = "installed" | "available" | "selected" | "locked";

export function getItemAvailability(
  item: InventoryItem,
  state: WorkspaceState,
): ItemAvailability {
  if (item.id === state.activeItemId) return "selected";
  if (item.stepId && state.completedStepIds.includes(item.stepId)) return "installed";
  const gate = item.stepId ?? item.unlockAfter;
  if (gate === undefined) return "available";
  if (gate > firstUncompletedStep(state)) return "locked";
  return "available";
}

export function getItemLockMessage(item: InventoryItem): string {
  const gate = item.stepId ?? item.unlockAfter;
  const step = getStepById(gate ?? 1);
  return `Complete ${step.componentName} first`;
}

// The id of the part the current step expects to install.
export function currentStepComponentId(state: WorkspaceState): string {
  return ASSEMBLY_STEPS[state.stepIndex].component;
}

function getItemById(id: string | null) {
  if (!id) return undefined;
  return ITEM_LOOKUP[id];
}

export const useWorkspace = create<WorkspaceState>()((set, get) => {
  const resetInteraction = (phase: InteractionPhase = "idle") =>
    set({
      phase,
      activeItemId: null,
      markerProgress: 0,
      feedback: null,
      showMeActive: false,
    });

  return {
    // --- initial state ---
    stepIndex: 0,
    completedStepIds: [],
    subProgress: {},
    optionalPlaced: [],
    finished: false,
    phase: "idle",
    activeItemId: null,
    markerProgress: 0,
    feedback: null,
    successStepId: null,
    showMeActive: false,

    goToStep: (stepId) => {
      const s = get();
      if (getStepProgress(stepId, s) === "locked") return;
      resetInteraction("idle");
      set({ stepIndex: stepId - 1, successStepId: null, finished: false });
    },

    selectItem: (itemId) => {
      const s = get();
      if (s.activeItemId === itemId) {
        resetInteraction("idle");
        return;
      }
      set({ activeItemId: itemId, phase: "selecting", feedback: null, markerProgress: 0 });
    },

    deselect: () => resetInteraction("idle"),

    startDrag: () => {
      const s = get();
      if (s.phase !== "selecting") return;
      set({ phase: "dragging" });
    },

    setDragValidity: (valid) => {
      const s = get();
      if (s.phase !== "dragging" && s.phase !== "valid-target" && s.phase !== "invalid-target") {
        return;
      }
      const next = valid ? "valid-target" : "invalid-target";
      if (s.phase !== next) set({ phase: next });
    },

    endDrag: (result) => {
      const s = get();
      if (
        s.phase !== "dragging" &&
        s.phase !== "valid-target" &&
        s.phase !== "invalid-target"
      ) {
        return;
      }
      const itemId = s.activeItemId;
      const item = getItemById(itemId);
      const step = ASSEMBLY_STEPS[s.stepIndex];

      if (!result?.ok) {
        set({
          phase: "idle",
          activeItemId: null,
          feedback: makeFeedback(
            "incorrect",
            result?.message ?? "Drop the part inside the 3D workspace.",
          ),
        });
        return;
      }

      // Optional parts mount visually but don't advance the build.
      if (item?.optional) {
        set((prev) => ({
          phase: "idle",
          activeItemId: null,
          optionalPlaced: prev.optionalPlaced.includes(itemId!)
            ? prev.optionalPlaced
            : [...prev.optionalPlaced, itemId!],
          feedback: makeFeedback("correct", `${item.name} mounted — nice touch.`),
        }));
        return;
      }

      // The part must belong to the current step.
      if (itemId !== step.component) {
        set({
          phase: "idle",
          activeItemId: null,
          feedback: makeFeedback(
            "incorrect",
            `The ${item?.name ?? "part"} isn't needed right now. ${step.invalidDropMessage}`,
          ),
        });
        return;
      }

      // Accepted drop: the 3D workspace plays the snap animation, then calls
      // completeSubAction() to advance the step.
      set({
        phase: "placing",
        feedback: makeFeedback(
          "correct",
          `${step.componentName} positioned — snapping into place.`,
        ),
      });
    },

    placeFromTarget: () => {
      const s = get();
      if (s.phase !== "selecting") return;
      const step = ASSEMBLY_STEPS[s.stepIndex];
      set({
        phase: "placing",
        activeItemId: step.component,
        feedback: makeFeedback(
          "correct",
          `${step.componentName} positioned — snapping into place.`,
        ),
      });
    },

    clickMarker: () => {
      const s = get();
      const step = ASSEMBLY_STEPS[s.stepIndex];
      const current = step.subActions[s.subProgress[step.id] ?? 0];
      if (s.phase !== "securing") return;
      if (!current || (current.kind !== "secure" && current.kind !== "connect")) return;

      const visual = getVisual(s.activeItemId ?? step.component);
      const total = Math.max(1, visual.securePoints.length);
      const next = s.markerProgress + 1;
      if (next >= total) {
        // All markers clicked — advance the sub-action now.
        get().completeSubAction();
      } else {
        set({ markerProgress: next });
      }
    },

    completeSubAction: () => {
      const s = get();
      const step = ASSEMBLY_STEPS[s.stepIndex];
      const done = (s.subProgress[step.id] ?? 0) + 1;

      if (done >= step.subActions.length) {
        // The last sub-action (verify) is finished — the step is complete.
        set({
          subProgress: { ...s.subProgress, [step.id]: done },
          phase: "completed",
        });
        get().completeStep();
        return;
      }

      const next = step.subActions[done];
      const phase: InteractionPhase =
        next.kind === "secure" || next.kind === "connect"
          ? "securing"
          : next.kind === "verify"
            ? "secured"
            : "placed";

      set({
        subProgress: { ...s.subProgress, [step.id]: done },
        markerProgress: 0,
        phase,
      });
    },

    completeStep: () => {
      const s = get();
      const step = ASSEMBLY_STEPS[s.stepIndex];
      if (s.completedStepIds.includes(step.id)) return;
      set({
        completedStepIds: [...s.completedStepIds, step.id],
        subProgress: { ...s.subProgress, [step.id]: step.subActions.length },
        phase: "completed",
        activeItemId: null,
        markerProgress: 0,
        successStepId: step.id,
      });
    },

    advanceFromSuccess: () => {
      const s = get();
      const next = ASSEMBLY_STEPS[s.stepIndex + 1];
      if (!next) {
        set({ successStepId: null, finished: true, phase: "completed", activeItemId: null });
        return;
      }
      resetInteraction("idle");
      set({ stepIndex: s.stepIndex + 1, successStepId: null });
    },

    praise: (message) => set({ feedback: makeFeedback("correct", message) }),

    setShowMe: (active) => set({ showMeActive: active }),

    reset: () =>
      set({
        stepIndex: 0,
        completedStepIds: [],
        subProgress: {},
        optionalPlaced: [],
        finished: false,
        phase: "idle",
        activeItemId: null,
        markerProgress: 0,
        feedback: null,
        successStepId: null,
        showMeActive: false,
      }),
  };
});
