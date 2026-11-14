import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "mt-1 w-full rounded-2xl border border-white/10 bg-[#0c1324] px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-400">
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}
