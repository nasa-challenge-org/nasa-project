import type { Sample } from "@/lib/types";

function chip(
  value: boolean | null,
  trueClass: string,
): { label: string; className: string } {
  if (value === null) {
    return {
      label: "unknown",
      className: "border border-dashed border-slate-500 text-slate-400",
    };
  }
  if (value) {
    return { label: "visible", className: trueClass };
  }
  return {
    label: "not visible",
    className: "bg-slate-800 text-slate-300",
  };
}

export function VisibilityBands({ sample }: { sample: Sample | null }) {
  if (!sample) {
    return (
      <p className="text-sm text-slate-500">
        Visibility flags appear after a sample is selected.
      </p>
    );
  }
  const sunGeo = chip(sample.sun.geometric_visible, "bg-emerald-800 text-emerald-100");
  const sunTerrain = chip(sample.sun.terrain_visible, "bg-cyan-900 text-cyan-100");
  const earthGeo = chip(
    sample.earth.geometric_visible,
    "bg-emerald-800 text-emerald-100",
  );
  const earthTerrain = chip(
    sample.earth.terrain_visible,
    "bg-cyan-900 text-cyan-100",
  );

  return (
    <div className="grid gap-2 text-xs sm:grid-cols-2">
      <p>
        Sun geometric{" "}
        <span className={`rounded px-1.5 py-0.5 ${sunGeo.className}`}>
          {sunGeo.label}
        </span>
      </p>
      <p>
        Sun terrain{" "}
        <span className={`rounded px-1.5 py-0.5 ${sunTerrain.className}`}>
          {sunTerrain.label}
        </span>
      </p>
      <p>
        Earth geometric{" "}
        <span className={`rounded px-1.5 py-0.5 ${earthGeo.className}`}>
          {earthGeo.label}
        </span>
      </p>
      <p>
        Earth terrain{" "}
        <span className={`rounded px-1.5 py-0.5 ${earthTerrain.className}`}>
          {earthTerrain.label}
        </span>
      </p>
    </div>
  );
}
