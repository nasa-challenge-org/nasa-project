import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]",
        className,
      )}
      {...props}
    />
  );
}
