export function StatusPill({
  status,
}: {
  status: string | null | undefined;
}) {
  const verified = status === "verified";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        verified
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-amber-500/15 text-amber-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          verified ? "bg-emerald-400" : "bg-amber-300"
        }`}
      />
      {verified ? "Verified" : status === "unverified" ? "Unverified" : status ?? "N/A"}
    </span>
  );
}

export function NaPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-slate-400">
      N/A
    </span>
  );
}
