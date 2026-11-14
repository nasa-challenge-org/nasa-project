"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function HealthBadge() {
  const [label, setLabel] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "warn" | "bad">("ok");

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((health) => {
        if (cancelled) return;
        if (health.horizons_adapter === "stub") {
          setTone("warn");
          setLabel("Sun/Earth ephemeris not live");
        } else {
          setTone("ok");
          setLabel("JPL Horizons live");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setTone("bad");
        setLabel("Navigator API unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) {
    return (
      <Skeleton
        className="h-7 w-36 rounded-full"
        aria-label="Checking navigator API"
      />
    );
  }

  const classes =
    tone === "bad"
      ? "bg-rose-500/15 text-rose-300"
      : tone === "ok"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-amber-500/15 text-amber-200";

  return (
    <span
      className={`max-w-[52vw] truncate rounded-full px-3 py-1 text-xs sm:max-w-none ${classes}`}
    >
      {label}
    </span>
  );
}
