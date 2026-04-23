import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, eyebrow, children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.45)] backdrop-blur ${className}`}
    >
      {(eyebrow || title) && (
        <header className="mb-4 space-y-1">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
              {eyebrow}
            </p>
          ) : null}
          {title ? <h3 className="text-lg font-semibold text-slate-50">{title}</h3> : null}
        </header>
      )}
      {children}
    </section>
  );
}
