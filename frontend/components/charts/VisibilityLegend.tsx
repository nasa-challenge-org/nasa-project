export function VisibilityLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-slate-400">
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
        Sun elevation (°)
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />
        Earth elevation (°)
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
        Geometric visible
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-700/80" />
        Terrain-aware visible
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-slate-500" />
        Unknown
      </li>
    </ul>
  );
}
