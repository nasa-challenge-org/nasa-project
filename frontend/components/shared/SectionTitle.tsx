import type { ReactNode } from "react";

export function SectionTitle({
  kicker,
  children,
  trailing,
}: {
  kicker?: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        {kicker ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
            {kicker}
          </p>
        ) : null}
        <h2 className="text-base font-semibold text-slate-50">{children}</h2>
      </div>
      {trailing}
    </div>
  );
}
