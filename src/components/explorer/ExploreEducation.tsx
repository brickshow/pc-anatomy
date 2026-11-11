import Link from "next/link";
import { COMPONENTS } from "@/lib/components";

export function ExploreEducation() {
  return (
    <section className="border-t border-line bg-background px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-bright">
          Computer hardware, explained visually
        </p>
        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Explore Computer Components in 3D
        </h1>
        <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          A computer is a system of connected parts. Explore the 3D model above
          to see where each component sits, then use these guides to learn what
          it does, how it works, and how it connects to the rest of a PC.
        </p>

        <div className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            PC component guides
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
            Each guide pairs a plain-language explanation with specifications,
            common issues, related parts, and an interactive 3D view.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPONENTS.map((component) => (
              <li key={component.id}>
                <Link
                  href={`/components/${component.id}`}
                  className="group block h-full rounded-xl border border-line bg-surface/60 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
                >
                  <span className="font-semibold text-foreground group-hover:text-accent-bright">
                    {component.name}: {component.tagline}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">
                    {component.short}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/components/storage"
            className="mt-6 inline-flex rounded-xl border border-line bg-surface/60 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent-bright"
          >
            Read the overview of computer storage, SSDs, HDDs, SATA, and NVMe
          </Link>
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-surface/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            See how the parts fit together
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
            Component compatibility matters when building a computer. The CPU
            must match the motherboard socket, memory must match the board, and
            the case and power supply must support the parts you choose.
          </p>
          <Link
            href="/assembly"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-bright underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Follow the desktop PC assembly guide
          </Link>
        </div>
      </div>
    </section>
  );
}
