"use client";

// assembly-workspace.tsx: The full interactive workspace. Composes the build
// progress rail, the 3D viewport placeholder, the step details panel, and the
// navigation bar. State (active step, install status, active mistake, hint)
// lives here and is driven by the data in lib/assembly.ts.
//
// The install interaction is a demo right now: clicking the hotspot in the
// viewer plays a short "installing" animation, then marks the step installed.
// The real three.js mechanics will connect to the same state later.
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Check, Lightbulb, ListChecks } from "lucide-react";
import { ASSEMBLY_STEPS } from "@/lib/assembly";
import type { InstallStatus, StepMistake } from "@/lib/assembly";
import { cn } from "@/lib/utils";
import { StepIcon } from "./step-icon";
import { StatusBadge } from "./status-badge";
import { StepTimeline } from "./step-timeline";
import { MistakeCard } from "./mistake-card";
import { AssemblyViewer } from "./assembly-viewer";
import { StepNavigation } from "./step-navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

const TOTAL = ASSEMBLY_STEPS.length;

export function AssemblyWorkspace() {
  const [currentId, setCurrentId] = useState(3);
  const [status, setStatus] = useState<InstallStatus>("idle");
  const [mistakeId, setMistakeId] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const installTimer = useRef<number | null>(null);

  const step = ASSEMBLY_STEPS[currentId - 1];

  // Clear any pending install timer when the component unmounts.
  useEffect(
    () => () => {
      if (installTimer.current) window.clearTimeout(installTimer.current);
    },
    [],
  );

  // Clicking the hotspot: play a short "installing" animation, then mark done.
  const runInstall = useCallback(() => {
    setMistakeId(null);
    setStatus("installing");
    if (installTimer.current) window.clearTimeout(installTimer.current);
    installTimer.current = window.setTimeout(
      () => setStatus("installed"),
      1400,
    );
  }, []);

  // Clicking a mistake card: stop the install flow and show the error state.
  const selectMistake = useCallback((mistake: StepMistake) => {
    setMistakeId(mistake.id);
    setStatus("error");
    if (installTimer.current) window.clearTimeout(installTimer.current);
  }, []);

  // Navigating resets the step interaction state.
  const goTo = useCallback((id: number) => {
    setCurrentId(id);
    setStatus("idle");
    setMistakeId(null);
    setHintOpen(false);
    if (installTimer.current) window.clearTimeout(installTimer.current);
  }, []);

  const prev = () => currentId > 1 && goTo(currentId - 1);
  const next = () => currentId < TOTAL && goTo(currentId + 1);

  const mistakeTitle =
    step.mistakes.find((m) => m.id === mistakeId)?.title ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
      {/* Workspace header: current step + live status. */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent-soft">
            <StepIcon name={step.icon} className="h-4.5 w-4.5 text-accent-bright" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-foreground">
              {step.title}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
              Step 0{step.id} · {step.component}
            </p>
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Mobile step strip (horizontal, below lg). */}
      <div className="thin-scroll -mx-3 shrink-0 overflow-x-auto px-3 sm:-mx-4 sm:px-4 lg:hidden">
        <div className="flex w-max gap-2">
          {ASSEMBLY_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                s.id === currentId
                  ? "border-accent/60 bg-accent-soft text-accent-bright"
                  : "border-line bg-surface/70 text-muted",
              )}
            >
              <StepIcon name={s.icon} className="h-3.5 w-3.5" />
              {s.component}
            </button>
          ))}
        </div>
      </div>

      {/* Main three-column area. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Left rail: build progress (desktop). */}
        <aside className="hidden w-60 shrink-0 flex-col rounded-2xl border border-line bg-surface/60 lg:flex">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <ListChecks className="h-3.5 w-3.5 text-accent-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Build Progress
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-2">
              {currentId}/{TOTAL}
            </span>
          </div>
          <div className="thin-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5">
            {ASSEMBLY_STEPS.map((s) => {
              const active = s.id === currentId;
              const done = s.id < currentId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors",
                    active
                      ? "border-accent/50 bg-accent-soft"
                      : "border-transparent hover:border-line hover:bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10.5px] font-bold",
                      active
                        ? "border-accent/50 bg-accent/15 text-accent-bright"
                        : done
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          : "border-line-strong bg-surface-2 text-muted-2 group-hover:text-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      String(s.id).padStart(2, "0")
                    )}
                  </span>
                  <StepIcon
                    name={s.icon}
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active
                        ? "text-accent-bright"
                        : "text-muted-2 group-hover:text-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "truncate text-[12.5px] font-medium",
                      active ? "text-foreground" : "text-muted",
                    )}
                  >
                    {s.component}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-line px-4 py-3">
            <p className="text-[10.5px] leading-relaxed text-muted-2">
              Complete each step to build the full system. Mistakes preview
              the error feedback in the viewer.
            </p>
          </div>
        </aside>

        {/* Center: 3D viewport. */}
        <div className="min-h-0 flex-1">
          <AssemblyViewer
            step={step}
            status={status}
            mistakeTitle={mistakeTitle}
            onInstall={runInstall}
          />
        </div>

        {/* Right: step details panel. */}
        <aside className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface/60 backdrop-blur-xl lg:w-[360px] lg:flex-none">
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="space-y-5 p-4 sm:p-5"
              >
                {/* Component info card. */}
                <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/70 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent-soft">
                    <StepIcon
                      name={step.icon}
                      className="h-4 w-4 text-accent-bright"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">
                      {step.component}
                      <span className="ml-1.5 font-normal text-muted">
                        {step.componentDetail}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                      {step.summary}
                    </p>
                  </div>
                </div>

                {/* Current step. */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-bright">
                    Current Step
                  </p>
                  <h2 className="mt-1 text-[19px] font-bold leading-tight text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>

                {/* Instructions timeline. */}
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Instructions
                  </h3>
                  <StepTimeline instructions={step.instructions} />
                </div>

                {/* Common mistakes. */}
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Common Mistakes
                  </h3>
                  <div className="space-y-2">
                    {step.mistakes.map((mistake) => (
                      <MistakeCard
                        key={mistake.id}
                        mistake={mistake}
                        active={mistakeId === mistake.id}
                        onSelect={() => selectMistake(mistake)}
                      />
                    ))}
                  </div>
                </div>

                {/* Hidden hint. */}
                <div>
                  <button
                    type="button"
                    onClick={() => setHintOpen((open) => !open)}
                    className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent-bright"
                  >
                    <Lightbulb className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                    {hintOpen ? "Hide hint" : "Show hint"}
                  </button>
                  <AnimatePresence>
                    {hintOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <span className="mt-2 block rounded-xl border border-accent/25 bg-accent-soft/60 p-3 text-[12px] leading-relaxed text-foreground/90">
                          {step.hint}
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Verification + learn more. */}
                <div className="rounded-xl border border-line bg-background/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Verify
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {step.reference}
                  </p>
                  <Link
                    href={step.learnMore}
                    className="group mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-bright"
                  >
                    Learn more about {step.component}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* Bottom navigation. */}
      <StepNavigation
        stepId={currentId}
        total={TOTAL}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}
