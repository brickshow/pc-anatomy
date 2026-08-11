// assembly.ts: The data layer for the PC Assembly workspace.
//
// Everything the workspace UI needs to know about a build step lives in one
// reusable structure (AssemblyStep). The UI is driven entirely by this data,
// so adding a new step later means adding one entry here — no new components.
//
// NOTE: The actual assembly mechanics (physics, snapping, validation) will be
// connected later. For now these steps power the UI/UX, instructions,
// progress list, hints, mistakes, and the success/error states.

// The current interaction state of a step in the workspace.
// - idle:       waiting for the user to interact with the 3D hotspot
// - installing: a placeholder "installation in progress" animation
// - installed:  successfully installed (step complete)
// - error:      the user triggered a common-mistake feedback demo
export type InstallStatus = "idle" | "installing" | "installed" | "error";

// One numbered instruction inside a step (used for the vertical timeline).
export type StepInstruction = {
  title: string;
  detail: string;
};

// One common-mistake card. Clicking one previews the error feedback state.
export type StepMistake = {
  id: string;
  title: string;
  detail: string;
};

// The complete definition of a single assembly step.
export type AssemblyStep = {
  id: number;              // 1-based step number (01, 02, ...)
  component: string;       // short name shown in the UI, e.g. "RAM"
  componentDetail: string; // model/detail line, e.g. "DDR5"
  title: string;           // the headline, e.g. "Install RAM"
  target: string;          // where the action happens, e.g. "DIMM slot"
  summary: string;         // one-sentence educational blurb (component info card)
  description: string;     // the "Current Step" description
  instructions: StepInstruction[]; // numbered timeline, exactly 3
  hint: string;            // hidden hint text (collapsible hint panel)
  mistakes: StepMistake[]; // common mistakes (3 small cards)
  reference: string;       // "how it should look" verification text
  learnMore: string;       // link to the existing educational component page
  icon: string;            // icon name used by StepIcon
};

// The 8 steps of the guided build. Step 3 (RAM) is the fully-detailed example
// the workspace opens on; the rest share the same structure so the same UI
// drives every step.
export const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    id: 1,
    component: "CPU",
    componentDetail: "LGA 1700",
    title: "Install the CPU",
    target: "CPU socket",
    summary:
      "The brain of the computer. Align the golden triangle to the socket corner and drop it in.",
    description:
      "Place the CPU into the socket on the motherboard, aligning the corner markers, then lock it down.",
    instructions: [
      {
        title: "Open the socket",
        detail: "Lift the retention arm and open the socket cover.",
      },
      {
        title: "Align the CPU",
        detail: "Match the gold triangle on the corner with the triangle on the socket.",
      },
      {
        title: "Lock it down",
        detail: "Close the cover and push the retention arm back into place.",
      },
    ],
    hint: "Handle the CPU by its edges and never touch the golden contact pads.",
    mistakes: [
      {
        id: "cpu-orientation",
        title: "Wrong Orientation",
        detail: "The triangle markers must line up before you close the lever.",
      },
      {
        id: "cpu-bent-pins",
        title: "Bent Pins",
        detail: "Never slide the CPU across the socket — set it down straight.",
      },
      {
        id: "cpu-forced-lever",
        title: "Forced Lever",
        detail: "If the lever won't close, the CPU is misaligned. Stop and re-seat it.",
      },
    ],
    reference: "The CPU sits flat in the socket with the lever locked and the cover closed.",
    learnMore: "/components/cpu",
    icon: "Cpu",
  },
  {
    id: 2,
    component: "Motherboard",
    componentDetail: "ATX",
    title: "Install the Motherboard",
    target: "Case standoffs",
    summary:
      "The backbone that connects every component. Align it to the standoffs and screw it in.",
    description:
      "Mount the motherboard onto the standoffs inside the case and secure it with screws.",
    instructions: [
      {
        title: "Check the standoffs",
        detail: "Confirm standoffs are installed in the right positions for your board size.",
      },
      {
        title: "Align the board",
        detail: "Line up the I/O shield with the rear panel and the screw holes with the standoffs.",
      },
      {
        title: "Secure it",
        detail: "Screw in all mounting points, starting from the center and working outward.",
      },
    ],
    hint: "Never overtighten the screws — snug is enough to hold the board firmly.",
    mistakes: [
      {
        id: "mb-standoffs",
        title: "Missing Standoffs",
        detail: "A board mounted without standoffs can short against the case.",
      },
      {
        id: "mb-pinched",
        title: "Pinched Cables",
        detail: "Keep cables clear of the board so they aren't crushed under it.",
      },
      {
        id: "mb-screws",
        title: "Wrong Screws",
        detail: "Use the included motherboard screws — smaller or larger threads can strip.",
      },
    ],
    reference: "The motherboard is level, firmly screwed down, and clear of all cables.",
    learnMore: "/components/motherboard",
    icon: "CircuitBoard",
  },
  {
    id: 3,
    component: "RAM",
    componentDetail: "DDR5",
    title: "Install RAM",
    target: "DIMM slot",
    summary:
      "High-speed working memory. Press it into the DIMM slot until both clips lock.",
    description:
      "Install the RAM into the DIMM slot on the motherboard.",
    instructions: [
      {
        title: "Open the DIMM slot",
        detail: "Push the clips on both sides outward.",
      },
      {
        title: "Align the RAM",
        detail: "Match the notch on the RAM with the key in the slot.",
      },
      {
        title: "Press down firmly",
        detail: "Press the RAM straight down until both clips lock into place.",
      },
    ],
    hint: "Make sure the RAM is fully seated and both clips are locked.",
    mistakes: [
      {
        id: "ram-wrong-slot",
        title: "Wrong Slot",
        detail: "Make sure to use the recommended slot.",
      },
      {
        id: "ram-direction",
        title: "Wrong Direction",
        detail: "The notch must align with the key.",
      },
      {
        id: "ram-seating",
        title: "Not Fully Seated",
        detail: "Press down until the clips lock.",
      },
    ],
    reference: "Both clips are locked and the RAM is level with the slot.",
    learnMore: "/components/ram",
    icon: "MemoryStick",
  },
  {
    id: 4,
    component: "Storage",
    componentDetail: "NVMe 1 TB",
    title: "Install Storage",
    target: "M.2 slot",
    summary:
      "Lightning-fast NVMe storage that mounts flat on the motherboard.",
    description:
      "Insert the M.2 drive into its slot on the motherboard and secure it flat.",
    instructions: [
      {
        title: "Remove the heatsink",
        detail: "Unscrew and lift off the M.2 heatsink (if your board has one).",
      },
      {
        title: "Insert the drive",
        detail: "Slide the M.2 drive in at an angle, gold contacts first, until it clicks.",
      },
      {
        title: "Secure the drive",
        detail: "Press the drive flat and fix it with the standoff screw.",
      },
    ],
    hint: "Gently press the drive level before tightening the screw so it doesn't bend.",
    mistakes: [
      {
        id: "m2-key",
        title: "Wrong Key",
        detail: "An M-keyed drive won't fit a B-keyed slot — check the notch.",
      },
      {
        id: "m2-lifted",
        title: "Drive Lifted",
        detail: "The screw must hold the drive flat — a raised end can break.",
      },
      {
        id: "m2-overtight",
        title: "Overtightened",
        detail: "The tiny M.2 screw only needs a quarter turn past snug.",
      },
    ],
    reference: "The drive lies flat against the board and the screw holds it level.",
    learnMore: "/components/storage",
    icon: "HardDrive",
  },
  {
    id: 5,
    component: "GPU",
    componentDetail: "RTX 4070",
    title: "Install the GPU",
    target: "PCIe x16 slot",
    summary:
      "The graphics powerhouse. Seat it in the top PCIe x16 slot and lock the clip.",
    description:
      "Insert the graphics card into the top PCIe x16 slot and secure it to the case.",
    instructions: [
      {
        title: "Remove the slot covers",
        detail: "Pop out the rear expansion covers where the GPU will exit the case.",
      },
      {
        title: "Seat the GPU",
        detail: "Align the card with the PCIe x16 slot and press in until the latch clicks.",
      },
      {
        title: "Secure it",
        detail: "Screw the GPU bracket to the case at the rear panel.",
      },
    ],
    hint: "Push evenly on the card — the click tells you it is fully seated.",
    mistakes: [
      {
        id: "gpu-slot",
        title: "Wrong Slot",
        detail: "Use the top PCIe x16 slot for full bandwidth.",
      },
      {
        id: "gpu-latch",
        title: "Unlocked Latch",
        detail: "Make sure the retention clip is open before inserting.",
      },
      {
        id: "gpu-sag",
        title: "Sagging Card",
        detail: "A heavy card may need a support bracket to stay level.",
      },
    ],
    reference: "The card is level in the slot, the latch is closed, and the bracket is screwed down.",
    learnMore: "/components/gpu",
    icon: "Layers",
  },
  {
    id: 6,
    component: "PSU",
    componentDetail: "850 W Gold",
    title: "Install the PSU",
    target: "PSU bay",
    summary:
      "Converts wall power into clean, regulated DC for every component.",
    description:
      "Mount the power supply in the case's PSU bay and secure it to the rear panel.",
    instructions: [
      {
        title: "Position the PSU",
        detail: "Slide the unit into the bay with the fan facing down or out, as the case allows.",
      },
      {
        title: "Align the screws",
        detail: "Line up the mounting holes on the rear panel.",
      },
      {
        title: "Secure it",
        detail: "Tighten the four screws at the rear of the case.",
      },
    ],
    hint: "Orient the fan toward the outside of the case so it draws fresh air.",
    mistakes: [
      {
        id: "psu-fan",
        title: "Fan Up",
        detail: "A top-facing fan can starve the PSU of air and trap heat.",
      },
      {
        id: "psu-screws",
        title: "Missing Screws",
        detail: "Use all four screws so the heavy PSU can't sag.",
      },
      {
        id: "psu-cable",
        title: "Pulling Cable",
        detail: "Leave slack in the cables before tightening the PSU.",
      },
    ],
    reference: "The PSU is firmly mounted and its fan vent is unobstructed.",
    learnMore: "/components/power-supply",
    icon: "Zap",
  },
  {
    id: 7,
    component: "Cooling",
    componentDetail: "Air tower",
    title: "Install Cooling",
    target: "CPU socket",
    summary:
      "Keeps the CPU in its safe operating window under any load.",
    description:
      "Mount the CPU cooler on the processor and connect its fan to the motherboard.",
    instructions: [
      {
        title: "Apply thermal paste",
        detail: "Add a pea-sized dot of paste to the CPU lid (if not pre-applied).",
      },
      {
        title: "Mount the cooler",
        detail: "Place the cooler over the CPU and fix it to the mounting brackets.",
      },
      {
        title: "Connect the fan",
        detail: "Plug the fan header into the CPU_FAN connector on the motherboard.",
      },
    ],
    hint: "Tighten screws in a cross pattern and stop when resistance builds.",
    mistakes: [
      {
        id: "cooler-paste",
        title: "Too Much Paste",
        detail: "A pea-sized dot is enough — more just spreads messily.",
      },
      {
        id: "cooler-header",
        title: "Wrong Header",
        detail: "The fan must use the CPU_FAN header for automatic control.",
      },
      {
        id: "cooler-pressure",
        title: "Uneven Pressure",
        detail: "Tighten diagonally so the cooler sits flat and level.",
      },
    ],
    reference: "The cooler sits flush on the CPU and the fan cable is connected.",
    learnMore: "/components/cpu-cooler",
    icon: "Fan",
  },
  {
    id: 8,
    component: "Cables",
    componentDetail: "ATX & EPS",
    title: "Connect the Cables",
    target: "Motherboard headers",
    summary:
      "Power the whole system and connect every header, neatly routed.",
    description:
      "Connect all power cables and front-panel headers, then route them cleanly.",
    instructions: [
      {
        title: "Connect main power",
        detail: "Plug the 24-pin ATX cable and the 8-pin CPU cable into the motherboard.",
      },
      {
        title: "Connect the rest",
        detail: "Plug in GPU power, SATA power, front-panel headers, and fans.",
      },
      {
        title: "Route and tidy",
        detail: "Run cables behind the tray and secure them with ties.",
      },
    ],
    hint: "Push each connector until it clicks — loose cables are the top cause of no-post.",
    mistakes: [
      {
        id: "cable-loose",
        title: "Loose Connectors",
        detail: "Every cable should click fully into place.",
      },
      {
        id: "cable-daisy",
        title: "GPU Daisy-Chains",
        detail: "Prefer separate cables for each GPU power connector.",
      },
      {
        id: "cable-pinched",
        title: "Pinched Wires",
        detail: "Keep cables out of fan blades and sharp case edges.",
      },
    ],
    reference: "All connectors are fully seated and cables are routed cleanly.",
    learnMore: "/components/pc-case",
    icon: "Cable",
  },
];
