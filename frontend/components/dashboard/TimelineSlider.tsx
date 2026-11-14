"use client";

import { useEffect, useRef, useState } from "react";
import { formatUtc } from "@/lib/time";
import type { Sample } from "@/lib/types";

export function TimelineSlider({
  samples,
  index,
  onIndex,
}: {
  samples: Sample[];
  index: number;
  onIndex: (value: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!playing || samples.length === 0) return undefined;
    const id = window.setInterval(() => {
      onIndex((indexRef.current + 1) % samples.length);
    }, 400);
    return () => window.clearInterval(id);
  }, [playing, samples.length, onIndex]);

  if (samples.length === 0) {
    return (
      <p className="text-sm text-slate-500">No time samples to scrub yet.</p>
    );
  }
  const sample = samples[index] ?? samples[0];
  const max = Math.max(samples.length - 1, 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="timeline-slider" className="text-sm text-slate-200">
          Timeline (UTC)
        </label>
        <button
          type="button"
          className="rounded-full bg-white/10 px-3 py-1 text-xs"
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? "Pause" : "Play window"}
        </button>
      </div>
      <input
        id="timeline-slider"
        type="range"
        min={0}
        max={max}
        step={1}
        value={Math.min(index, max)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={index}
        aria-valuetext={formatUtc(sample.time_utc)}
        className="mt-2 w-full accent-cyan-400"
        onChange={(event) => onIndex(Number(event.target.value))}
      />
      <p className="mt-1 text-xs text-slate-400">
        Sample {index + 1} of {samples.length} · {formatUtc(sample.time_utc)}
      </p>
    </div>
  );
}
