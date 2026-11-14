import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#3d8bff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(61,139,255,0.35)] hover:bg-[#5aa0ff] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
