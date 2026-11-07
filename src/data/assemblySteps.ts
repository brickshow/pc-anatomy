export type AssemblyStep = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  instructions: string[];
  check: string;
  optional?: boolean;
  model?: string;
};

// A common desktop build order. Exact socket, cooler, case, and
// connector details vary, so each step points learners to the hardware manuals.
export const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    id: "prepare",
    title: "Prepare your workspace",
    shortTitle: "Get ready",
    description:
      "Check that the CPU, motherboard, memory, storage, cooler, graphics card, and case are compatible before you start. Work on a stable, clear surface with good light.",
    instructions: [
      "Confirm the CPU is supported by the motherboard and BIOS, the memory type matches, and the motherboard form factor fits the case.",
      "Check that the PSU can support the planned parts and has the required power connectors; also check cooler and graphics-card clearance in the case.",
      "Gather a Phillips screwdriver, the component manuals, and all of the parts for your build.",
      "Keep components in their antistatic packaging until you need them. Handle circuit boards by their edges.",
      "Disconnect the power supply from the wall. Never open a power supply unit.",
      "Read the motherboard and cooler manuals before fitting parts; socket and mounting details differ by model.",
    ],
    check:
      "All parts are compatible, the manuals are nearby, and the work area is clear and unpowered.",
  },
  {
    id: "case-psu",
    title: "Prepare the case and power supply",
    shortTitle: "Case & PSU",
    description:
      "Open the case and make it ready for the motherboard. Installing the power supply now can make cable routing easier, though the order can vary by case.",
    instructions: [
      "Remove the side panels and set aside the case screws and accessories.",
      "Check that the motherboard standoffs match the board's size and screw holes. Remove any extra standoffs that would sit under the board without a mounting hole.",
      "Fit the separate I/O shield now if your motherboard has one; some boards have it attached already.",
      "Mount the power supply in the case with its fan facing a ventilated intake, when the case layout allows.",
      "If the PSU is modular, connect only the cables this build needs. Keep its cables with that PSU; modular cables are not universally interchangeable.",
    ],
    check:
      "The case has the right standoffs, the I/O shield is oriented correctly, and the PSU is mounted securely.",
    model: "/models/psu.glb",
  },
  {
    id: "cpu",
    title: "Install the CPU",
    shortTitle: "CPU",
    description:
      "Install the processor while the motherboard is outside the case, where the socket is easier to reach and support.",
    instructions: [
      "Place the motherboard on its box or another clean, non-conductive surface.",
      "Open the socket using the mechanism shown in the motherboard manual.",
      "Hold the CPU by its edges. Align its corner marker with the marker on the socket, then lower it gently into place.",
      "Secure the socket retainer as instructed. Never press down on the CPU to make it fit.",
    ],
    check:
      "The CPU sits flat in the socket and the retention mechanism is secured without forcing it.",
    model: "/models/cpu.glb",
  },
  {
    id: "memory",
    title: "Install the memory",
    shortTitle: "Memory",
    description:
      "Install the memory modules before the motherboard goes into the case. The preferred slots depend on the motherboard and number of modules.",
    instructions: [
      "Use the motherboard manual to find which slots to populate first; two-module kits often use a specific pair.",
      "Open the slot latches that move and line up the notch in each module with the slot.",
      "Press evenly on both ends until the module is fully seated and the latches close.",
    ],
    check:
      "Each module is seated evenly in the slots recommended by the motherboard manual.",
    model: "/models/ram.glb",
  },
  {
    id: "m2",
    title: "Install M.2 storage",
    shortTitle: "M.2 storage",
    description:
      "If your build uses an M.2 drive, fit it now while the motherboard is easy to reach. This step is optional when you do not have an M.2 drive.",
    instructions: [
      "Check the motherboard manual for a compatible M.2 slot and supported drive length.",
      "Remove the slot's heatsink or retaining screw, if present. Peel off any protective film from the heatsink pad.",
      "Slide the drive into the connector at a slight angle, press it down, and secure it with the correct latch or screw.",
      "Reinstall the heatsink without overtightening it.",
    ],
    check:
      "The drive is fully inserted, secured, and its heatsink film has been removed if applicable.",
    optional: true,
    model: "/models/m.2.glb",
  },
  {
    id: "cooler",
    title: "Fit the CPU cooler",
    shortTitle: "CPU cooler",
    description:
      "The cooler must make even contact with the CPU. Air coolers and liquid coolers use different brackets and connections, so follow the cooler's manual.",
    instructions: [
      "Install the correct mounting hardware for the CPU socket.",
      "Apply thermal paste only if the cooler does not already have paste applied; use the amount and method recommended by its manual.",
      "Lower the cooler straight onto the CPU and tighten its fasteners gradually in the order shown by the manufacturer.",
      "Keep the cooler's fan or pump lead accessible so you can connect it to the correct header after the motherboard is mounted.",
    ],
    check:
      "The cooler is firmly and evenly mounted, with its fan or pump lead accessible for connection.",
    model: "/models/cpu_fan.glb",
  },
  {
    id: "motherboard",
    title: "Mount the motherboard",
    shortTitle: "Motherboard",
    description:
      "Lower the prepared motherboard into the case and line it up with the rear I/O opening and the standoffs.",
    instructions: [
      "Hold the board by its edges and align its rear ports with the I/O shield.",
      "Make sure every mounting hole sits over a standoff; do not drag the board across the standoffs.",
      "Start the screws loosely, then tighten them until snug. Do not overtighten.",
    ],
    check:
      "The board is aligned with the rear I/O and secured to every matching standoff.",
    model: "/models/motherboard.glb",
  },
  {
    id: "drives-fans",
    title: "Add other drives and case fans",
    shortTitle: "Drives & fans",
    description:
      "Install any 2.5-inch or 3.5-inch drives and additional case fans your build uses. Skip anything your system does not have.",
    instructions: [
      "Secure each drive in a compatible tray or mount using the case's instructions.",
      "Mount extra case fans in the intended airflow direction; the frame arrows usually show airflow and blade rotation.",
      "If using a radiator, check its position and tube orientation in the cooler and case manuals before fastening it.",
      "Route fan leads toward the motherboard or powered fan hub and keep them clear of the blades; connect them during the wiring step. SATA drives need data and PSU power connections later.",
    ],
    check:
      "Every drive and fan used in this build is mounted securely with cables accessible.",
    optional: true,
    model: "/models/case_fans.glb",
  },
  {
    id: "gpu",
    title: "Install the graphics card",
    shortTitle: "Graphics card",
    description:
      "If your build has a separate graphics card, install it in the motherboard's recommended full-length PCIe slot. Some systems use integrated graphics instead.",
    instructions: [
      "Remove the case slot covers that line up with the selected PCIe slot.",
      "Open the slot latch, align the card, and press it straight down until fully seated.",
      "Secure the card bracket to the case. Support a heavy card as the case manual recommends.",
    ],
    check:
      "The card is seated in the correct slot and secured to the case. Connect its power leads in the wiring step if required.",
    optional: true,
    model: "/models/gpu.glb",
  },
  {
    id: "cables",
    title: "Connect the power and case cables",
    shortTitle: "Cables",
    description:
      "Connect power, front-panel, and data cables using the labels and diagrams in the motherboard and PSU manuals. Connector layouts vary.",
    instructions: [
      "Connect the motherboard's 24-pin power cable and the CPU/EPS power cable near the processor.",
      "Connect GPU power and SATA power leads where needed. Connect SATA data cables between SATA drives and the motherboard.",
      "Connect the CPU cooler and case fans to their correct headers, then connect the case power switch, LEDs, USB, and audio leads to the labeled headers.",
      "Route cables away from fans and sharp edges. Never force a connector or use a modular cable from a different PSU.",
    ],
    check:
      "All required power, storage, cooling, and case connections match the diagrams in the relevant manuals.",
  },
  {
    id: "inspect",
    title: "Inspect before power",
    shortTitle: "Final check",
    description:
      "Take a moment to inspect the build before connecting it to mains power. This catches loose connections and misplaced screws while everything is visible.",
    instructions: [
      "Check that the CPU cooler is mounted and its fan or pump is connected.",
      "Check that memory, graphics card, and power connectors are fully seated.",
      "Look for loose screws, tools, or cables that could touch a fan. Confirm the motherboard is not touching the case outside its standoffs.",
      "Reinstall the case panels only after confirming no cables are trapped.",
    ],
    check:
      "The inside is clear of tools and loose screws, and no cable can obstruct a fan.",
  },
  {
    id: "first-boot",
    title: "Power on and check the system",
    shortTitle: "First boot",
    description:
      "Connect the monitor and peripherals, then try the first start. A new build may take longer than usual on its first memory training or hardware check.",
    instructions: [
      "Connect the monitor to the graphics card when one is installed; otherwise use a motherboard display output supported by your CPU.",
      "Connect the power cable, switch the PSU on, and press the case power button.",
      "Open firmware setup and check that the CPU, memory, storage, and cooler are detected and temperatures look reasonable.",
      "If the system does not start, turn it off and unplug it before checking connections. Use the motherboard's status lights and manual to troubleshoot.",
      "Once the system is stable, install an operating system and its drivers.",
    ],
    check:
      "The system reaches firmware setup, detects its core components, and shows no CPU-fan or hardware warning.",
    model: "/models/system_unit_update.glb",
  },
];
