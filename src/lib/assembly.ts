// assembly.ts: The data layer for the PC Assembly workspace.
//
// Everything the workspace needs to know about a build step, its sub-actions,
// and the parts tray lives here in one reusable structure. The UI, the 3D
// viewport, and (later) the real assembly mechanics are all driven by this
// data, so changing a step's instructions, interactions, or unlock order means
// editing one entry — not touching components.
//
// The assembly engine (physics, exact snapping, per-part validation) is not
// implemented yet. This layer defines the interaction STATE model that the
// engine will drive later.

// The current interaction phase of the workspace. These map 1:1 to the
// validation states the UI must communicate to the user:
//   idle           -> IDLE          waiting for the user to pick up a part
//   selecting      -> SELECTED      part lifted from the parts tray
//   dragging       -> DRAGGING      part carried over the 3D workspace
//   valid-target   -> VALID TARGET  hovering a valid drop target
//   invalid-target -> INVALID TARGET hovering an invalid area
//   placing        -> (transient)   drop accepted, snapping into position
//   placed         -> PLACED        part positioned on its target
//   securing       -> (interactive) clicking screws / ports / clips
//   secured        -> SECURED       part secured, ready to verify
//   completed      -> COMPLETED     step finished, success state shown
export type InteractionPhase =
  | "idle"
  | "selecting"
  | "dragging"
  | "valid-target"
  | "invalid-target"
  | "placing"
  | "placed"
  | "securing"
  | "secured"
  | "completed";

// The kind of interaction a sub-action performs. Each kind is handled by the
// 3D workspace through a generic, data-driven interaction:
//   place   - drag the part from the tray and drop it on the glowing target
//   align   - click the placed part to align its orientation
//   insert  - click the placed part to seat it into the slot
//   secure  - click every mounting marker (screws / clips / lever / feet)
//   connect - click every compatible port marker
//   verify  - confirm the step is correct (finishes the step)
export type SubActionKind =
  | "place"
  | "align"
  | "insert"
  | "secure"
  | "connect"
  | "verify";

// One numbered instruction inside a step. The left panel tracks these as the
// step's sub-progress (✓ done / ● current / ○ pending) and the right panel
// renders them as the step-by-step instructions.
export type SubAction = {
  id: string;
  title: string;
  detail: string;
  kind: SubActionKind;
};

// One piece of validation feedback shown over the workspace.
//   correct   -> "✓ Correct"  (never punishes, just confirms)
//   incorrect -> "⚠ Try Again" with an explanation of what went wrong
export type StepFeedback = {
  kind: "correct" | "incorrect";
  message: string;
  id: number;
};

// The complete definition of a single assembly step.
export type AssemblyStep = {
  id: number;              // 1-based step number (01, 02, ...)
  component: string;       // inventory / 3D id, e.g. "motherboard"
  componentName: string;   // short display name, e.g. "Motherboard"
  componentDetail: string; // model/detail line, e.g. "ATX"
  title: string;           // headline, e.g. "Install the Motherboard"
  target: string;          // where the action happens, e.g. "standoffs"
  targetName: string;      // friendly name for hints, e.g. "the mounting area"
  summary: string;         // one-sentence blurb for the component card
  description: string;     // "Current step" description
  subActions: SubAction[]; // the step's sub-actions, in order (last is verify)
  tip: string;             // shown in the right panel TIP block
  reference: string;       // "how it should look" verification text
  learnMore: string;       // link to the existing educational component page
  icon: string;            // icon name used by StepIcon
  invalidDropMessage: string; // shown when a part is dropped outside its target
};

// The 8 steps of the guided build, in the order the user must complete them.
export const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    id: 1,
    component: "chassis",
    componentName: "Chassis",
    componentDetail: "Mid-Tower",
    title: "Add the Chassis",
    target: "workbench",
    targetName: "the workbench pad",
    summary:
      "The shell that houses every component. It gives the build structure, airflow, and protection.",
    description:
      "Place the chassis onto the workbench and level it so the whole build has a stable home.",
    subActions: [
      {
        id: "chassis-place",
        title: "Position the chassis",
        detail: "Drag the chassis from the parts tray onto the workbench.",
        kind: "place",
      },
      {
        id: "chassis-level",
        title: "Level the chassis",
        detail: "Settle it flat so all four feet touch the bench.",
        kind: "align",
      },
      {
        id: "chassis-feet",
        title: "Secure the feet",
        detail: "Click all four feet to lock them in.",
        kind: "secure",
      },
      {
        id: "chassis-verify",
        title: "Verify stability",
        detail: "Confirm the chassis sits stable on the bench.",
        kind: "verify",
      },
    ],
    tip: "Lift the chassis by the frame, never the glass side panel.",
    reference: "The chassis is level, stable, and ready for components.",
    learnMore: "/components/pc-case",
    icon: "Box",
    invalidDropMessage:
      "The chassis rests on the workbench. Drag it onto the glowing pad.",
  },
  {
    id: 2,
    component: "motherboard",
    componentName: "Motherboard",
    componentDetail: "ATX",
    title: "Install the Motherboard",
    target: "standoffs",
    targetName: "the mounting area",
    summary:
      "The backbone that connects every component. Align it to the standoffs and screw it in.",
    description:
      "Mount the motherboard onto the standoffs inside the chassis and secure it with screws.",
    subActions: [
      {
        id: "mb-position",
        title: "Position the motherboard",
        detail: "Drag it into the chassis onto the standoffs.",
        kind: "place",
      },
      {
        id: "mb-align",
        title: "Align mounting holes",
        detail: "Match the board holes with the standoffs.",
        kind: "align",
      },
      {
        id: "mb-secure",
        title: "Secure with screws",
        detail: "Click each screw to tighten it snug.",
        kind: "secure",
      },
      {
        id: "mb-verify",
        title: "Verify the board",
        detail: "Make sure the board sits flat and level.",
        kind: "verify",
      },
    ],
    tip: "Don't force the motherboard. The mounting holes should naturally align with the standoffs.",
    reference: "The motherboard is level, firmly screwed down, and clear of all cables.",
    learnMore: "/components/motherboard",
    icon: "CircuitBoard",
    invalidDropMessage:
      "The motherboard mounts on the standoffs inside the chassis. Drag it onto the glowing mounting area.",
  },
  {
    id: 3,
    component: "cpu",
    componentName: "CPU",
    componentDetail: "LGA 1700",
    title: "Install the CPU",
    target: "CPU socket",
    targetName: "the CPU socket",
    summary:
      "The brain of the computer. Align the golden triangle to the socket corner and drop it in.",
    description:
      "Place the CPU into the socket on the motherboard, aligning the corner markers, then lock it down.",
    subActions: [
      {
        id: "cpu-position",
        title: "Position the CPU",
        detail: "Drag it over the CPU socket on the motherboard.",
        kind: "place",
      },
      {
        id: "cpu-align",
        title: "Align the triangle",
        detail: "Match the gold triangle to the socket corner.",
        kind: "align",
      },
      {
        id: "cpu-lock",
        title: "Lock the arm",
        detail: "Click the retention lever to lock it down.",
        kind: "secure",
      },
      {
        id: "cpu-verify",
        title: "Verify the CPU",
        detail: "Check it sits flat with the lever closed.",
        kind: "verify",
      },
    ],
    tip: "Handle the CPU by its edges and never touch the golden contact pads.",
    reference: "The CPU sits flat in the socket with the lever locked and the cover closed.",
    learnMore: "/components/cpu",
    icon: "Cpu",
    invalidDropMessage:
      "The CPU seats in the socket on the motherboard. Drag it onto the glowing socket area.",
  },
  {
    id: 4,
    component: "ram",
    componentName: "RAM",
    componentDetail: "DDR5",
    title: "Install RAM",
    target: "DIMM slot",
    targetName: "the DIMM slot",
    summary:
      "High-speed working memory. Press it into the DIMM slot until both clips lock.",
    description:
      "Install the RAM into the DIMM slot on the motherboard.",
    subActions: [
      {
        id: "ram-position",
        title: "Position the RAM",
        detail: "Drag it over the DIMM slot.",
        kind: "place",
      },
      {
        id: "ram-seat",
        title: "Press it in",
        detail: "Push the module straight down into the slot.",
        kind: "insert",
      },
      {
        id: "ram-clips",
        title: "Lock the clips",
        detail: "Click both clips into place.",
        kind: "secure",
      },
      {
        id: "ram-verify",
        title: "Verify the RAM",
        detail: "Both clips should be locked and level.",
        kind: "verify",
      },
    ],
    tip: "The notch on the stick must line up with the key in the slot.",
    reference: "Both clips are locked and the RAM is level with the slot.",
    learnMore: "/components/ram",
    icon: "MemoryStick",
    invalidDropMessage:
      "RAM goes into a DIMM slot on the motherboard. Drag it onto the glowing slot.",
  },
  {
    id: 5,
    component: "storage",
    componentName: "Storage",
    componentDetail: "NVMe 1 TB",
    title: "Install Storage",
    target: "M.2 slot",
    targetName: "the M.2 slot",
    summary:
      "Lightning-fast NVMe storage that mounts flat on the motherboard.",
    description:
      "Insert the M.2 drive into its slot on the motherboard and secure it flat.",
    subActions: [
      {
        id: "m2-position",
        title: "Position the M.2",
        detail: "Drag it over the M.2 slot on the board.",
        kind: "place",
      },
      {
        id: "m2-seat",
        title: "Seat the drive",
        detail: "Slide it in at an angle, gold contacts first.",
        kind: "insert",
      },
      {
        id: "m2-screw",
        title: "Secure the screw",
        detail: "Click the screw to hold the drive flat.",
        kind: "secure",
      },
      {
        id: "m2-verify",
        title: "Verify the drive",
        detail: "The drive lies flat against the board.",
        kind: "verify",
      },
    ],
    tip: "Gently press the drive level before tightening the screw so it doesn't bend.",
    reference: "The drive lies flat against the board and the screw holds it level.",
    learnMore: "/components/storage",
    icon: "HardDrive",
    invalidDropMessage:
      "The M.2 drive mounts flat on the motherboard. Drag it onto the glowing slot.",
  },
  {
    id: 6,
    component: "gpu",
    componentName: "GPU",
    componentDetail: "RTX 4070",
    title: "Install the GPU",
    target: "PCIe x16 slot",
    targetName: "the PCIe x16 slot",
    summary:
      "The graphics powerhouse. Seat it in the top PCIe x16 slot and lock the clip.",
    description:
      "Insert the graphics card into the top PCIe x16 slot and secure it to the case.",
    subActions: [
      {
        id: "gpu-position",
        title: "Position the GPU",
        detail: "Drag it over the top PCIe x16 slot.",
        kind: "place",
      },
      {
        id: "gpu-seat",
        title: "Seat the card",
        detail: "Press evenly until the latch clicks.",
        kind: "insert",
      },
      {
        id: "gpu-bracket",
        title: "Secure the bracket",
        detail: "Click the screws on the rear bracket.",
        kind: "secure",
      },
      {
        id: "gpu-verify",
        title: "Verify the GPU",
        detail: "The card is level, latched, and screwed down.",
        kind: "verify",
      },
    ],
    tip: "Push evenly on the card — the click tells you it is fully seated.",
    reference: "The card is level in the slot, the latch is closed, and the bracket is screwed down.",
    learnMore: "/components/gpu",
    icon: "Layers",
    invalidDropMessage:
      "The GPU seats in the top PCIe x16 slot. Drag it onto the glowing slot.",
  },
  {
    id: 7,
    component: "psu",
    componentName: "PSU",
    componentDetail: "850 W Gold",
    title: "Install the PSU",
    target: "PSU bay",
    targetName: "the PSU bay",
    summary:
      "Converts wall power into clean, regulated DC for every component.",
    description:
      "Mount the power supply in the case's PSU bay and secure it to the rear panel.",
    subActions: [
      {
        id: "psu-position",
        title: "Position the PSU",
        detail: "Drag it into the PSU bay at the rear.",
        kind: "place",
      },
      {
        id: "psu-align",
        title: "Align the mount",
        detail: "Line up the mounting holes with the rear panel.",
        kind: "align",
      },
      {
        id: "psu-screws",
        title: "Secure with screws",
        detail: "Click all four screws to mount it.",
        kind: "secure",
      },
      {
        id: "psu-verify",
        title: "Verify the PSU",
        detail: "The unit is firmly mounted, fan vent clear.",
        kind: "verify",
      },
    ],
    tip: "Orient the fan toward the outside of the case so it draws fresh air.",
    reference: "The PSU is firmly mounted and its fan vent is unobstructed.",
    learnMore: "/components/power-supply",
    icon: "Zap",
    invalidDropMessage:
      "The PSU mounts in the bay at the rear of the case. Drag it onto the glowing bay.",
  },
  {
    id: 8,
    component: "cables",
    componentName: "Cables",
    componentDetail: "ATX & EPS",
    title: "Connect the Cables",
    target: "motherboard headers",
    targetName: "the power headers",
    summary:
      "Power the whole system and connect every header, neatly routed.",
    description:
      "Connect all power cables and front-panel headers, then route them cleanly.",
    subActions: [
      {
        id: "cable-route",
        title: "Route the cables",
        detail: "Drag the cable bundle onto the board.",
        kind: "place",
      },
      {
        id: "cable-atx",
        title: "Connect 24-pin ATX",
        detail: "Click the main power header.",
        kind: "connect",
      },
      {
        id: "cable-cpu",
        title: "Connect CPU power",
        detail: "Click the 8-pin CPU header.",
        kind: "connect",
      },
      {
        id: "cable-verify",
        title: "Verify the power",
        detail: "Every connector clicks fully into place.",
        kind: "verify",
      },
    ],
    tip: "Push each connector until it clicks — loose cables are the top cause of no-post.",
    reference: "All connectors are fully seated and cables are routed cleanly.",
    learnMore: "/components/pc-case",
    icon: "Cable",
    invalidDropMessage:
      "Cables plug into the headers on the motherboard edge. Drag the bundle onto the glowing header.",
  },
];

// One item in the bottom parts tray. Availability is derived from the build
// progress (see getItemAvailability in workspace-store.ts).
export type InventoryItem = {
  id: string;          // unique id, matches step.component for build parts
  name: string;        // display name
  icon: string;        // icon name used by StepIcon
  detail?: string;     // model/detail line
  stepId?: number;     // set for parts that install during a major step
  unlockAfter?: number; // set for optional parts; step id that must be done first
  optional?: boolean;  // optional parts (Cooling, Screws) don't gate progress
};

// The 10 parts in the tray, in display order. Drag an available part into the
// 3D workspace to install it.
export const ASSEMBLY_INVENTORY: InventoryItem[] = [
  { id: "chassis", name: "Chassis", icon: "Box", stepId: 1, detail: "Mid-Tower" },
  { id: "motherboard", name: "Motherboard", icon: "CircuitBoard", stepId: 2, detail: "ATX" },
  { id: "cpu", name: "CPU", icon: "Cpu", stepId: 3, detail: "LGA 1700" },
  { id: "ram", name: "RAM", icon: "MemoryStick", stepId: 4, detail: "DDR5" },
  { id: "storage", name: "Storage", icon: "HardDrive", stepId: 5, detail: "NVMe 1 TB" },
  { id: "gpu", name: "GPU", icon: "Layers", stepId: 6, detail: "RTX 4070" },
  { id: "psu", name: "PSU", icon: "Zap", stepId: 7, detail: "850 W Gold" },
  { id: "cooling", name: "Cooling", icon: "Fan", unlockAfter: 3, optional: true, detail: "Air tower" },
  { id: "cables", name: "Cables", icon: "Cable", stepId: 8, detail: "ATX & EPS" },
  { id: "screws", name: "Screws", icon: "Wrench", unlockAfter: 1, optional: true, detail: "Mounting kit" },
];

export function getStepById(id: number): AssemblyStep {
  return ASSEMBLY_STEPS[id - 1];
}
