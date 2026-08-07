// Frequently asked questions about computer anatomy and computer hardware.
// These are shared by the visible FAQ UI and the FAQPage JSON-LD structured
// data, so the on-page answers always match what search engines are told.
// Each answer is concise, factual, and useful — written to be extracted
// verbatim by AI and answer-based search systems.

export type FaqItem = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is computer anatomy?",
    answer:
      "Computer anatomy is the study of how a computer is put together — the parts, components, and hardware that make a system work, and how they connect and communicate. Computer Anatomy teaches this subject through interactive 3D models.",
  },
  {
    question: "What are the main parts of a computer?",
    answer:
      "The main parts of a computer are the CPU (processor), RAM (memory), motherboard, storage, GPU (graphics card), power supply, and cooling system, all housed in a system unit. Input and output devices such as the monitor, keyboard, and mouse complete the full computer system.",
  },
  {
    question: "What does a CPU do?",
    answer:
      "A CPU (Central Processing Unit) is the primary processor responsible for executing instructions and performing the calculations that allow a computer's software to run.",
    href: "/components/cpu",
    linkLabel: "Explore CPU anatomy",
  },
  {
    question: "What does a GPU do?",
    answer:
      "A GPU (Graphics Processing Unit) is a specialized processor that renders images, games, and video for your display. It also accelerates demanding workloads such as machine learning and video encoding using thousands of small parallel cores.",
    href: "/components/gpu",
    linkLabel: "Learn how graphics cards work",
  },
  {
    question: "What is RAM used for?",
    answer:
      "RAM (Random Access Memory) is temporary high-speed memory used by a computer to store data and instructions that are actively being used. More RAM lets you keep more programs and browser tabs open at once without slowing down.",
    href: "/components/ram",
    linkLabel: "Explore RAM anatomy",
  },
  {
    question: "What does a motherboard do?",
    answer:
      "A motherboard is the main circuit board that connects and allows communication between major computer components such as the CPU, RAM, storage, GPU, and other devices.",
    href: "/components/motherboard",
    linkLabel: "Explore motherboard components",
  },
  {
    question: "What is computer storage?",
    answer:
      "Computer storage is where a computer keeps data permanently, even when the power is off. Storage devices include hard disk drives (HDDs) and solid state drives (SSDs), which hold the operating system, programs, and files.",
  },
  {
    question: "How do computer components work together?",
    answer:
      "Computer components work together as one system: the power supply feeds electricity, the motherboard distributes it and routes signals, the CPU processes instructions using data held in RAM, the GPU renders visuals, and storage keeps data for later.",
  },
  {
    question: "What is the difference between RAM and storage?",
    answer:
      "RAM is fast, temporary memory that a computer uses while it is running, and it is erased when the power goes off. Storage is slower but permanent — it keeps files and programs saved between uses.",
  },
  {
    question: "What is computer networking?",
    answer:
      "Computer networking is how computers connect and exchange data. It involves hardware such as routers, switches, modems, and access points, plus technologies like Ethernet, Wi-Fi, IP addresses, and MAC addresses.",
  },
];