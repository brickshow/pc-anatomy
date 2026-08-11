"use client";

// step-details.tsx: The right-side panel. Shows the component info card, the
// current step's description, the sub-action timeline with live progress, and
// a highlighted "next action" card explaining exactly what to do now.
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Cable,
  CheckCircle2,
  Hand,
  Lightbulb,
  MousePointerClick,
  RotateCw,
  Wrench,
} from "lucide-react";
import { ASSEMBLY_STEPS } from "@/lib/assembly";
import type { SubActionKind } from "@/lib/assembly";
import { useWorkspace } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import { StepIcon } from "./step-icon";
import { StepTimeline } from "./step-timeline";

const EASE = [0.22, 1, 0.36, 1] as const;

const KIND_ICON: Record<SubActionKind, typeof MousePointerClick> = {
  place: Hand,
  align: RotateCw,
  insert: ArrowDownToLine,
  secure: Wrench,
  connect: Cable,
  verify: CheckCircle2,
};

const KIND_HINT: Record<SubActionKind, string> = {
  place: "Drag the part from the tray and drop it on the glowing ring.",
  align: "Click the glowing ring to confirm the alignment.",
  insert: "Click the glowing ring to seat the part fully.",
  secure: "Click each glowing marker to lock it down.",
  connect: "Click each glowing header to seat the connector.",
  verify: "Review the check then click the ring to confirm.",
};

export function StepDetails() {
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const subProgress = useWorkspace((s) => s.subProgress);

  const step = ASSEMBLY_STEPS[stepIndex];
  const done = subProgress[step.id] ?? 0;
  const current = step.subActions[done];

  const Icon = current ? KIND_ICON[current.kind] : MousePointerClick;

  return (
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
              <StepIcon name={step.icon} className="h-4 w-4 text-accent-bright" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {step.component}
                <span className="ml-1.5 font-normal text-muted">{step.componentDetail}</span>
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{step.summary}</p>
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
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{step.description}</p>
          </div>

          {/* Instructions timeline. */}
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Instructions
            </h3>
            <StepTimeline subActions={step.subActions} done={done} />
          </div>

          {/* Next action card. */}
          {current && (
            <div
              className={cn(
                "rounded-xl border p-3",
                current.kind === "verify"
                  ? "border-emerald-400/30 bg-emerald-400/5"
                  : "border-accent/30 bg-accent-soft/50",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-accent-bright" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-bright">
                  Next: {current.title}
                </p>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/85">
                {current.detail}
              </p>
              <p className="mt-1.5 text-[11.5px] text-muted">{KIND_HINT[current.kind]}</p>
            </div>
          )}

          {/* Tip. */}
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400/80" />
              Tip
            </p>
            <p className="rounded-xl border border-line bg-background/40 p-3 text-[12px] leading-relaxed text-muted">
              {step.tip}
            </p>
          </div>

          {/* Verification + learn more. */}
          <div className="rounded-xl border border-line bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Verify
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">{step.reference}</p>
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
  );
}
