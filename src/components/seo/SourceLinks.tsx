import type { SeoSource } from "@/data/seoSources";

export function SourceLinks({ sources }: { sources: SeoSource[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-6" aria-label="References">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        References and further reading
      </h2>
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm leading-relaxed text-accent-bright underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              {source.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
