// Central site-wide constants shared by metadata, sitemap, robots, JSON-LD,
// and social image generation. Keeping everything here avoids drift between
// pages and gives search engines / AI systems one source of truth.

export const SITE_URL = "https://pc-anatomy.brickshow.site";
export const SITE_NAME = "Computer Anatomy";
export const SITE_TAGLINE = "Interactive 3D Computer Hardware Learning";
export const SITE_DESCRIPTION =
  "Explore computer anatomy through interactive 3D models. Learn about computer parts, components, CPU, GPU, RAM, motherboard, storage, cooling systems, and how computer hardware works together.";
export const SITE_KEYWORDS = [
  "computer anatomy",
  "computer parts",
  "computer components",
  "computer hardware",
  "parts of a computer",
  "computer hardware components",
  "how computers work",
  "CPU",
  "GPU",
  "RAM",
  "motherboard",
  "computer storage",
  "computer cooling",
  "computer ports",
  "computer networking",
];
export const GITHUB_URL = "https://github.com/brickshow/pc-anatomy";
export const OG_IMAGE_ALT =
  "Computer Anatomy — Interactive 3D Computer Hardware Learning";

// A typed descriptor for the SEO metadata of a single component page.
export type ComponentSeo = {
  title: string;
  description: string;
};

// Natural, unique title + description for every component page. Written for
// humans first: it states what each page teaches without keyword stuffing.
const COMPONENT_SEO: Record<string, ComponentSeo> = {
  case: {
    title: "System Unit Anatomy — Explore the Computer Case | Computer Anatomy",
    description:
      "Explore the anatomy of a system unit (computer case). Learn how the chassis mounts, cools, and protects a computer's internal components.",
  },
  cpu: {
    title: "CPU Anatomy — Learn How a Processor Works | Computer Anatomy",
    description:
      "Explore CPU anatomy and learn how processor components work together through an interactive 3D hardware visualization.",
  },
  motherboard: {
    title: "Motherboard Anatomy — Explore Computer Components | Computer Anatomy",
    description:
      "Explore motherboard anatomy and learn how the main circuit board connects the CPU, RAM, storage, GPU, and other computer components.",
  },
  ram: {
    title: "RAM Anatomy — Learn How Computer Memory Works | Computer Anatomy",
    description:
      "Explore RAM anatomy and learn how random access memory stores the data a computer is actively using, in interactive 3D.",
  },
  gpu: {
    title: "GPU Anatomy — Learn How Graphics Cards Work | Computer Anatomy",
    description:
      "Explore GPU anatomy and learn how a graphics card renders visuals and accelerates workloads. See it in an interactive 3D hardware model.",
  },
  ssd: {
    title: "SSD Anatomy — Learn How Solid State Storage Works | Computer Anatomy",
    description:
      "Explore solid state drive (SSD) anatomy and see how flash-based storage stores files with no moving parts, in interactive 3D.",
  },
  "m2-ssd": {
    title: "M.2 NVMe SSD Anatomy — Learn How Modern Storage Works | Computer Anatomy",
    description:
      "Explore M.2 NVMe solid state drive anatomy and learn how a board-mounted SSD delivers fast computer storage through PCIe lanes.",
  },
  hdd: {
    title: "Hard Disk Anatomy — How Magnetic Storage Works | Computer Anatomy",
    description:
      "Explore hard disk drive anatomy and learn how spinning magnetic platters provide high-capacity computer storage.",
  },
  psu: {
    title: "PSU Anatomy — Learn How a Power Supply Works | Computer Anatomy",
    description:
      "Explore power supply unit anatomy and learn how the PSU converts wall power into clean DC power for every computer component.",
  },
  "cpu-cooler": {
    title: "CPU Cooler Anatomy — Learn How Computer Cooling Works | Computer Anatomy",
    description:
      "Explore CPU cooler anatomy and learn how heatsinks, heat pipes, and fans manage heat to keep a computer processor running safely.",
  },
  "case-fans": {
    title: "Case Fans Anatomy — Learn How Computer Airflow Works | Computer Anatomy",
    description:
      "Explore case fan anatomy and learn how a computer's airflow system pulls cool air in and exhausts heat to cool the internal components.",
  },
  keyboard: {
    title: "Keyboard Anatomy — Learn How Computer Input Works | Computer Anatomy",
    description:
      "Explore keyboard anatomy and learn how the primary computer input device turns each key press into a command the system understands.",
  },
  mouse: {
    title: "Mouse Anatomy — Learn How Computer Pointing Works | Computer Anatomy",
    description:
      "Explore mouse anatomy and learn how an optical sensor tracks motion to move the cursor and drive computer interactions.",
  },
  monitor: {
    title: "Monitor Anatomy — Learn How Computer Displays Work | Computer Anatomy",
    description:
      "Explore monitor anatomy and learn how a display panel turns the frames rendered by a GPU into the images you see.",
  },
  ups: {
    title: "UPS Anatomy — Learn How Battery Backup Works | Computer Anatomy",
    description:
      "Explore uninterruptible power supply anatomy and learn how the battery backup protects a computer through outages and power dips.",
  },
  avr: {
    title: "AVR Anatomy — Learn How Voltage Regulation Works | Computer Anatomy",
    description:
      "Explore automatic voltage regulator anatomy and learn how clean, stable power protects computer hardware from voltage dips and spikes.",
  },
};

// Look up SEO metadata for a component page by its id/slug.
export function componentSeo(id: string): ComponentSeo {
  return (
    COMPONENT_SEO[id] ?? {
      title: "Computer Components | Computer Anatomy",
      description:
        "Explore the anatomy of a computer component through an interactive 3D hardware visualization on Computer Anatomy.",
    }
  );
}

// WebSite + Organization facts reused by the JSON-LD structured data.
export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description:
    "An interactive 3D learning platform for understanding computer hardware, computer components, systems, and networking.",
  inLanguage: "en",
};

export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [GITHUB_URL],
  description: "An open-source, interactive 3D platform for learning computer anatomy.",
};