import { Badge } from "@/components/ui/badge";

export function DemoBanner({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 rounded border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
      <Badge>DEMO / MOCK</Badge>
      <span>
        These values are illustrative fixtures, not NASA/JPL/LOLA measurements.
      </span>
    </div>
  );
}
