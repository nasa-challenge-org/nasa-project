import type { ReactNode } from "react";

export function EmptyPanel({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-[12rem] place-items-center rounded-3xl border border-dashed border-white/12 bg-[#0c1324]/80 px-6 py-10 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          {icon ?? (
            <span className="text-lg" aria-hidden>
              ○
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
