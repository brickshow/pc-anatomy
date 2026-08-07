"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COMPONENTS } from "@/lib/components";
import { ComponentIcon } from "@/components/icons";
import { Reveal } from "@/components/landing/ui/primitives";

// HardwareLibrary: a compact, crawlable grid of every computer component you
// can explore. Each entry is a real link to that component's dedicated page,
// using descriptive anchor text for strong internal linking.
export function HardwareLibrary() {
  return (
    <section
      id="hardware"
      className="relative scroll-mt-24 px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-accent-bright">
            The Hardware Library
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Explore the parts of a computer
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Dive into the anatomy of a full computer system — from the processor
            and memory to storage, cooling, power, and peripherals.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COMPONENTS.map((component, i) => (
            <li key={component.id}>
              <Reveal delay={i * 0.03}>
                <Link
                  href={`/components/${component.id}`}
                  className="group flex h-full items-center gap-3 rounded-xl border border-line bg-surface/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-surface/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent">
                    <ComponentIcon name={component.icon} className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[13.5px] font-medium tracking-tight text-foreground group-hover:text-accent-bright">
                      {component.name}
                    </span>
                    <span className="truncate text-[11px] text-muted-2">
                      {component.short}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-10 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-bright"
          >
            Open the interactive 3D explorer
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}