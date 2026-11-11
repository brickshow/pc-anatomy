import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPONENTS } from "@/lib/components";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const canonical = absoluteUrl("/components");

export const metadata: Metadata = {
  title: "3D Computer Components & PC Parts Explained",
  description:
    "Explore computer components in 3D and learn what each PC part does. See how CPUs, GPUs, RAM, motherboards, storage, power, and cooling work together.",
  alternates: { canonical },
  openGraph: {
    title: "3D Computer Components & PC Parts Explained",
    description:
      "A clear guide to the parts inside and around a computer, with plain-language explanations and interactive 3D component guides.",
    url: canonical,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "PC Anatomy — Explore Computer Hardware in 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Computer Components & PC Parts Explained",
    description:
      "Learn what computer parts do, how they work together, and explore each one in 3D.",
    images: [absoluteUrl("/og-image.png")],
  },
};

const groups: {
  title: string;
  description: string;
  ids: string[];
  hub?: { href: string; label: string };
}[] = [
  {
    title: "The core processing and memory parts",
    description:
      "The CPU runs program instructions, the GPU processes graphics and parallel workloads, and RAM holds the data they are using right now. The motherboard connects these parts and lets them exchange data.",
    ids: ["cpu", "gpu", "ram", "motherboard"],
  },
  {
    title: "Computer storage",
    description:
      "Storage keeps your operating system, applications, and files when the computer is turned off. SSDs and hard drives use different technologies and interfaces, so the best choice depends on speed, capacity, and compatibility.",
    ids: ["ssd", "m2-ssd", "hdd"],
    hub: { href: "/components/storage", label: "Compare computer storage types" },
  },
  {
    title: "Power, cooling, and the case",
    description:
      "The power supply delivers regulated power, coolers and fans move heat away, and the case holds and protects the build. These parts affect safe operation, noise, temperatures, and which components physically fit.",
    ids: ["power-supply", "ups", "avr", "cpu-cooler", "case-fans", "pc-case"],
  },
  {
    title: "Input and display devices",
    description:
      "Keyboards and mice send user input to the computer. A monitor turns the GPU's video signal into the image you see, with resolution and refresh rate shaping the display experience.",
    ids: ["keyboard", "mouse", "monitor"],
  },
];

const allItems = COMPONENTS.map((component, index) => ({
  "@type": "ListItem",
  position: index + 1,
  name: component.name,
  url: absoluteUrl(`/components/${component.id}`),
}));

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Breadcrumbs
        crumbs={[{ name: "Components" }]}
        className="mx-auto w-full max-w-4xl px-6 pt-6"
      />

      <article className="mx-auto w-full max-w-4xl px-6 pb-16 pt-4">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          3D Computer Components: Parts of a PC and What They Do
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          A computer is a system of parts that process instructions, store data,
          move heat, and connect to the person using it. Explore this 3D computer
          anatomy guide to learn what each PC component does, how the parts work
          together, and inspect them in interactive 3D.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            How the parts of a computer work together
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            The motherboard provides the connections between the CPU, RAM,
            graphics card, and storage. Programs are kept on a drive, loaded
            into RAM, and processed by the CPU; the GPU renders images for the
            monitor. The power supply feeds the system, while the case and
            cooling parts help keep everything mounted and within safe
            temperatures.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            For a practical walkthrough of installing parts and checking a new
            build, follow the{" "}
            <Link
              href="/assembly"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-bright"
            >
              step-by-step desktop PC assembly guide
            </Link>
            .
          </p>
        </section>

        {groups.map((group) => {
          const components = group.ids
            .map((id) => COMPONENTS.find((component) => component.id === id))
            .filter((component): component is (typeof COMPONENTS)[number] => Boolean(component));

          return (
            <section key={group.title} className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {group.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {group.description}
              </p>
              {group.hub && (
                <p className="mt-3 text-[15px]">
                  <Link
                    href={group.hub.href}
                    className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-bright"
                  >
                    {group.hub.label}
                  </Link>
                </p>
              )}
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {components.map((component) => (
                  <li key={component.id}>
                    <Link
                      href={`/components/${component.id}`}
                      className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-2"
                    >
                      <span className="text-[15px] font-medium text-foreground">
                        {component.name} — {component.tagline}
                      </span>
                      <span className="text-[13px] leading-relaxed text-muted">
                        {component.short}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Explore the computer in 3D
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Open the interactive explorer to rotate the computer, select a
            component, and inspect how it fits into the whole system.
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
          >
            Open the 3D computer explorer
          </Link>
        </section>
      </article>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "3D Computer Components: Parts of a PC and What They Do",
          description:
            "A guide to computer components and how the parts of a PC work together.",
          url: canonical,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
          mainEntity: {
            "@type": "ItemList",
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            numberOfItems: allItems.length,
            itemListElement: allItems,
          },
        }}
      />
    </main>
  );
}
