"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FAQ_ITEMS } from "@/data/faq";
import { Reveal } from "@/components/landing/ui/primitives";

// FAQ: a search-engine-friendly, genuinely useful list of questions and
// answers about computer anatomy and computer hardware. Each answer links to
// the relevant component page where it makes sense.
export function Faq() {
  return (
    <section
      id="faq"
      className="relative scroll-mt-24 border-t border-line px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-accent-bright">
            Frequently Asked Questions
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Questions about how computers work
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Short, factual answers to the questions people ask most when learning
            about computer parts and computer hardware.
          </p>
        </Reveal>

        <div className="mt-14 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/30 backdrop-blur-md">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group px-6 py-5 open:bg-surface/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium tracking-tight text-foreground transition-colors hover:text-accent-bright">
                <span>{item.question}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-2 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <div className="pt-3 text-[14px] leading-relaxed text-muted">
                <p>{item.answer}</p>
                {item.href && item.linkLabel && (
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-accent-bright"
                  >
                    {item.linkLabel}
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}