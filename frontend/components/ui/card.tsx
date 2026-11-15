import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[#1e2838] bg-[#0b0f19] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.55)] transition-all",
        className,
      )}
      {...props}
    />
  );
}
