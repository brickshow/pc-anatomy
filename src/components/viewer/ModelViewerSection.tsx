"use client";

// Lazy-loaded interactive 3D model embed used by SEO content pages
// (/components/storage, /assembly). The model and WebGL code only load on
// the client, after the crawlable article has rendered.

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const ComponentViewer = dynamic(
  () =>
    import("@/components/viewer/ComponentViewer").then((m) => m.ComponentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
          <p className="text-[12px] text-muted-2">Loading interactive 3D model…</p>
        </div>
      </div>
    ),
  }
);

export function ModelViewerSection({
  model,
  label,
  heightClass = "h-[420px] sm:h-[520px]",
}: {
  model: string;
  label: string;
  heightClass?: string;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px",
  });

  return (
    <section ref={ref} aria-label={label}>
      <div
        className={`w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(2,6,16,0.45)] ${heightClass}`}
      >
        {inView ? (
          <ComponentViewer component={model} mode="fullscreen" />
        ) : (
          <div
            className="flex h-full items-center justify-center text-sm text-muted"
            aria-label="3D model will load when it is near the viewport"
          >
            Interactive 3D model loads as you scroll here.
          </div>
        )}
      </div>
    </section>
  );
}
