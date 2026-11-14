"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export function HealthBadge() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <span className="rounded border border-rose-500/50 px-2 py-1 text-xs text-rose-300">
        API offline
      </span>
    );
  }
  if (!health) {
    return (
      <span className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400">
        Checking API…
      </span>
    );
  }
  return (
    <span className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300">
      API {health.status} · sites {health.sites_source ?? "?"} · Horizons{" "}
      {health.horizons_adapter}
    </span>
  );
}
