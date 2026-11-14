export function ToggleTile({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`rounded-2xl border p-3 text-left transition ${
        checked
          ? "border-cyan-400/40 bg-cyan-500/15"
          : "border-white/10 bg-[#0c1324]"
      }`}
    >
      <span className="block text-sm font-medium text-slate-100">{label}</span>
      <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>
      <span className="mt-2 inline-block text-[11px] uppercase tracking-wide text-slate-400">
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
