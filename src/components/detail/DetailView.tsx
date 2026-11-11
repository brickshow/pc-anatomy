"use client";

// DetailView.tsx: The detail page for a single component. It shows a 3D viewer
// for that component on one side (choosing the right viewer based on which
// component it is) and an information panel on the other side with tabs
// (overview/details/etc.), the component's description, and model credits.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { FALLBACK_MODEL, type ComponentInfo } from "@/lib/components";
import type { TabId } from "@/lib/store";
import { TabBar, TabContent } from "@/components/explorer/ComponentTabs";
import { ComponentIcon } from "@/components/icons";
import { ModelCredits } from "@/components/viewer/ModelCredits";

// Lazy-load the simple component viewer (only on the client, since it needs WebGL).
const ComponentViewer = dynamic(
  () =>
    import("@/components/viewer/ComponentViewer").then((m) => m.ComponentViewer),
  {
    ssr: false,
    // Show a spinner while the viewer code is loading.
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    ),
  }
);

// Lazy-load the interactive mouse viewer (client-side only for WebGL).
const MouseViewer = dynamic(
  () => import("@/components/mouse/MouseViewer").then((m) => m.MouseViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    ),
  }
);

// Lazy-load the interactive monitor viewer (client-side only for WebGL).
const MonitorViewer = dynamic(
  () => import("@/components/monitor/MonitorViewer").then((m) => m.MonitorViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    ),
  }
);

// Keep the motherboard viewer in its own client chunk, like the other WebGL
// viewers, so opening a detail route does not eagerly load unused 3D code.
const MotherboardViewer = dynamic(
  () =>
    import("@/components/motherboard/MotherboardViewer").then(
      (m) => m.MotherboardViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    ),
  }
);

export function DetailView({ component }: { component: ComponentInfo }) {
  // Which tab is currently shown in the info panel.
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Page header with a "Back to Explorer" link and the site logo. */}
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <Link
          href="/explore"
          className="group flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Explorer
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Computer Anatomy logo"
            width={512}
            height={512}
            priority
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-[14px] font-semibold tracking-tight">Computer Anatomy</span>
        </div>
      </header>

      <section
        aria-label="Interactive 3D component explorer"
        className="flex flex-1 flex-col gap-5 p-6 xl:flex-row"
      >
        {/* Pick the right 3D viewer for the component type.
            Motherboard, mouse, and monitor get their own interactive viewers;
            everything else uses the generic model viewer. */}
        {component.id === "motherboard" ? (
          <section className="min-h-[560px] flex-[3] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(2,6,16,0.45)]">
            <MotherboardViewer mode="fullscreen" />
          </section>
        ) : component.id === "mouse" ? (
          <section className="min-h-[560px] flex-[3] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(2,6,16,0.45)]">
            <MouseViewer mode="fullscreen" />
          </section>
        ) : component.id === "monitor" ? (
          <section className="min-h-[560px] flex-[3] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(2,6,16,0.45)]">
            <MonitorViewer mode="fullscreen" />
          </section>
        ) : (
          <section className="min-h-[440px] flex-[3] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(2,6,16,0.45)]">
            <ComponentViewer component={component.model ?? FALLBACK_MODEL} mode="fullscreen" />
          </section>
        )}

        {/* The info panel beside the viewer. */}
        <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface xl:max-w-[520px]">
          {/* Header: icon, name, tagline, and index number. */}
          <div className="border-b border-line px-6 py-5">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2">
                <ComponentIcon name={component.icon} className="h-5 w-5 text-accent" />
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                  {component.name}
                </div>
                <p className="text-[12.5px] text-muted">{component.tagline}</p>
              </div>
              <span className="ml-auto font-mono text-[13px] font-medium text-accent">
                {component.index}
              </span>
            </div>
          </div>

          {/* Tab switcher (overview / details, etc.). */}
          <TabBar tab={tab} onChange={setTab} />

          {/* Scrollable tab content plus model credits at the bottom. */}
          <div className="thin-scroll max-h-[520px] flex-1 overflow-y-auto px-6 py-5">
            <TabContent tab={tab} component={component} />
            <ModelCredits
              key={component.id}
              credit={component.credits}
            />
          </div>
        </section>
      </section>
    </div>
  );
}
