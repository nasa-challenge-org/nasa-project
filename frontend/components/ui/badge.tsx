import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-amber-400/60 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-200",
        className,
      )}
      {...props}
    />
  );
}
