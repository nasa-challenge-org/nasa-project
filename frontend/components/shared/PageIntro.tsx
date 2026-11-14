import type { ReactNode } from "react";

export function PageIntro({
  steps,
  children,
}: {
  steps?: Array<{ n: string; label: string }>;
  children?: ReactNode;
}) {
  if (!steps?.length && !children) return null;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {children ? (
        <p className="max-w-xl text-sm text-slate-400">{children}</p>
      ) : (
        <span />
      )}
      {steps?.length ? (
        <ol className="flex flex-wrap items-center gap-2">
          {steps.map((step, i) => (
            <li key={step.n} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400/20 text-[11px] font-bold text-cyan-200">
                  {step.n}
                </span>
                {step.label}
              </span>
              {i < steps.length - 1 ? (
                <span className="hidden text-slate-600 sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
