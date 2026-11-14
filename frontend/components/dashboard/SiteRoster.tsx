import Link from "next/link";
import { coordinateLabel } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

const COLORS = ["#3d8bff", "#fbbf24", "#a78bfa", "#34d399", "#f472b6", "#38bdf8"];

export function SiteRoster({
  sites,
  selectedId,
  onSelect,
}: {
  sites: LandingSite[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Candidate sites</h2>
        <span className="text-[11px] text-slate-500">{sites.length} curated</span>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {sites.map((site, index) => {
          const active = site.id === selectedId;
          return (
            <li key={site.id}>
              <button
                type="button"
                onClick={() => onSelect(site.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${
                  active ? "bg-white/8" : "hover:bg-white/5"
                }`}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-xl"
                  style={{ background: COLORS[index % COLORS.length] + "33" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-snug text-slate-100">
                    {site.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                    {site.gsfc_site_id ?? site.slug}
                    <span className="block">
                      {coordinateLabel(
                        site.latitude_deg,
                        site.longitude_east_deg,
                      )}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 self-start">
                  <span className="text-[11px] text-slate-500">
                    {site.verification_status}
                  </span>
                  <Link
                    href={`/sites/${site.id}`}
                    className="text-[11px] text-cyan-400 hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Brief
                  </Link>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
