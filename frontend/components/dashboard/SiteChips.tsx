import type { LandingSite } from "@/lib/types";

const COLORS = ["#3d8bff", "#fbbf24", "#a78bfa", "#34d399", "#f472b6", "#38bdf8"];

export function SiteChips({
  sites,
  selectedId,
  onSelect,
}: {
  sites: LandingSite[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (!sites.length) {
    return (
      <p className="text-xs text-slate-500">
        Candidate sites load from the catalogue. Empty list is unknown, not
        zero sites.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sites.map((site, index) => {
        const active = site.id === selectedId;
        return (
          <button
            key={site.id}
            type="button"
            onClick={() => onSelect(site.id)}
            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              active
                ? "border-cyan-400/50 bg-cyan-400/10 text-slate-50"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{site.name}</span>
          </button>
        );
      })}
    </div>
  );
}
