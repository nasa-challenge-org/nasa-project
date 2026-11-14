export function StatusBanner({
  tone,
  title,
  message,
}: {
  tone: "info" | "warn" | "empty";
  title: string;
  message: string;
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-500/40 bg-amber-950/30 text-amber-100"
      : tone === "empty"
        ? "border-slate-700 bg-slate-900/60 text-slate-300"
        : "border-cyan-700/50 bg-slate-900/80 text-slate-200";
  return (
    <div className={`rounded-2xl border px-3 py-2 text-sm ${toneClass}`}>
      <p className="font-medium">{title}</p>
      <p>{message}</p>
    </div>
  );
}
