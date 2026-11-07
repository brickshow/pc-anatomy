"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Wrench } from "lucide-react";
import { ASSEMBLY_STEPS } from "@/data/assemblySteps";

const ComponentViewer = dynamic(
  () => import("@/components/viewer/ComponentViewer").then((module) => module.ComponentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Preparing the 3D view…
      </div>
    ),
  },
);

const PROGRESS_KEY = "pc-anatomy-assembly-progress-v1";

type SavedProgress = {
  currentStepId?: string;
  doneIds?: string[];
  skippedIds?: string[];
};

function validStepIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return Array.from(
    new Set(
      ids.filter(
        (id): id is string =>
          typeof id === "string" && ASSEMBLY_STEPS.some((step) => step.id === id),
      ),
    ),
  );
}

export function AssemblyGuide() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedProgress;
        const savedIndex = ASSEMBLY_STEPS.findIndex((step) => step.id === saved.currentStepId);
        if (savedIndex >= 0) setCurrentIndex(savedIndex);
        setDoneIds(validStepIds(saved.doneIds));
        setSkippedIds(validStepIds(saved.skippedIds));
      }
    } catch {
      try {
        window.localStorage.removeItem(PROGRESS_KEY);
      } catch {
        // The guide remains usable when browser storage is unavailable.
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const progress: SavedProgress = {
      currentStepId: ASSEMBLY_STEPS[currentIndex]?.id,
      doneIds,
      skippedIds,
    };
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Saving progress is optional; keep the current session usable.
    }
  }, [currentIndex, doneIds, skippedIds, ready]);

  const step = ASSEMBLY_STEPS[currentIndex];
  const completedCount = doneIds.length;
  const percent = Math.round((completedCount / ASSEMBLY_STEPS.length) * 100);
  const doneSet = useMemo(() => new Set(doneIds), [doneIds]);
  const skippedSet = useMemo(() => new Set(skippedIds), [skippedIds]);
  const isComplete = completedCount === ASSEMBLY_STEPS.length;

  function finishStep(skipped = false) {
    setDoneIds((current) => current.includes(step.id) ? current : [...current, step.id]);
    if (skipped) {
      setSkippedIds((current) => current.includes(step.id) ? current : [...current, step.id]);
    } else {
      setSkippedIds((current) => current.filter((id) => id !== step.id));
    }
    if (currentIndex < ASSEMBLY_STEPS.length - 1) setCurrentIndex(currentIndex + 1);
  }

  function restart() {
    if (!window.confirm("Restart the build guide and clear saved progress?")) return;
    setCurrentIndex(0);
    setDoneIds([]);
    setSkippedIds([]);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          PC Anatomy
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
          General desktop PC build
        </div>
        <Link href="/explore" className="text-sm text-accent transition-colors hover:text-foreground">
          Explore parts in 3D
        </Link>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-7 sm:px-8 sm:pt-10">
        <section className="mb-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Build it step by step</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Build a desktop PC</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Follow a practical build order from preparation to first boot. Parts and layouts vary, so use the manuals for your exact hardware whenever a step calls for it.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart guide
          </button>
        </section>

        <section aria-label="Build progress" className="mb-6 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-muted">{completedCount} of {ASSEMBLY_STEPS.length} steps · {percent}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-label="Build guide progress"
            aria-valuemin={0}
            aria-valuemax={ASSEMBLY_STEPS.length}
            aria-valuenow={completedCount}
          >
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-2">Your progress is saved on this device. You can go back to any step whenever you need.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
          <nav aria-label="Build steps" className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
            <p className="px-2 pb-3 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-2">Build steps</p>
            <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {ASSEMBLY_STEPS.map((item, index) => {
                const isCurrent = currentIndex === index;
                const isDone = doneSet.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`flex min-h-12 w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors sm:gap-3 sm:px-3 ${isCurrent ? "bg-accent/12 text-foreground ring-1 ring-accent/30" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${isDone ? "bg-emerald-500/15 text-emerald-300" : isCurrent ? "bg-accent text-white" : "bg-surface-2 text-muted"}`}>
                        {isDone ? <Check className="h-3.5 w-3.5" aria-label="Complete" /> : String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium sm:text-sm">{item.shortTitle}</span>
                        {item.optional && <span className="hidden text-[10px] text-muted-2 lg:block">Optional</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section aria-labelledby="active-step-title" className="min-w-0 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid min-h-[470px] lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
              <div className="flex flex-col p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>STEP {String(currentIndex + 1).padStart(2, "0")} / {String(ASSEMBLY_STEPS.length).padStart(2, "0")}</span>
                  {step.optional && <span className="rounded-full border border-line px-2 py-1">Optional</span>}
                  {doneSet.has(step.id) && (
                    <span className={`rounded-full px-2 py-1 ${skippedSet.has(step.id) ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200"}`}>
                      {skippedSet.has(step.id) ? "Not used in this build" : "Completed"}
                    </span>
                  )}
                </div>
                <h2 id="active-step-title" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{step.description}</p>

                <ol className="mt-6 space-y-3">
                  {step.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex gap-3 text-sm leading-6 text-foreground/90">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-[11px] font-medium text-muted">{index + 1}</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Before you move on</p>
                  <p className="mt-1.5 text-sm leading-5 text-foreground/90">{step.check}</p>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {step.optional && !doneSet.has(step.id) && (
                      <button type="button" onClick={() => finishStep(true)} className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground">
                        Not in my build
                      </button>
                    )}
                    {doneSet.has(step.id) ? (
                      <button
                        type="button"
                        disabled={currentIndex === ASSEMBLY_STEPS.length - 1}
                        onClick={() => setCurrentIndex((index) => Math.min(ASSEMBLY_STEPS.length - 1, index + 1))}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next step <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button type="button" onClick={() => finishStep()} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-bright">
                        {currentIndex === ASSEMBLY_STEPS.length - 1 ? "Finish build" : "Mark complete"}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative min-h-[300px] border-t border-line bg-[#0b0f17] lg:min-h-full lg:border-l lg:border-t-0">
                {step.model ? (
                  <ComponentViewer component={step.model} mode="embedded" className="h-full min-h-[300px]" initialAutoRotate={false} />
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-accent/20 bg-accent/5">
                      <div className="absolute inset-4 rounded-[1.5rem] border border-dashed border-accent/25" />
                      <Wrench className="h-12 w-12 text-accent/80" strokeWidth={1.3} aria-hidden="true" />
                    </div>
                    <p className="mt-5 text-sm font-medium">Set up first. Build safely.</p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-muted-2">Use this checklist to prepare your parts, tools, and workspace before handling components.</p>
                  </div>
                )}
                {step.model && <p className="pointer-events-none absolute bottom-3 left-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[11px] text-white/70">Drag to rotate · scroll to zoom</p>}
              </div>
            </div>
          </section>
        </div>

        {isComplete && (
          <section className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:p-6" aria-live="polite">
            <h2 className="text-lg font-semibold text-emerald-200">Build guide complete</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Your parts are assembled. You can revisit any step, or head to the component explorer to learn more about the hardware.</p>
            <Link href="/explore" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-foreground">Explore the components <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        )}

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-muted-2">
          This general guide does not replace the manuals for your exact parts. If a connector does not fit, a part does not align, or anything seems damaged, stop and check the manufacturer's instructions before continuing.
        </p>
      </div>
    </main>
  );
}
