"use client";

import { useEffect, useState } from "react";
import { getSites } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarMeta() {
  const [sitesCount, setSitesCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSites()
      .then((sites) => {
        if (!cancelled) {
          setSitesCount(sites.length);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSitesCount(null);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-[#0c1324] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Catalogue
      </p>
      <div className="mt-2 flex items-baseline gap-2 text-slate-200">
        {!loaded ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <>
            <span className="text-2xl font-semibold tabular-nums">
              {sitesCount ?? "N/A"}
            </span>
            <span className="text-xs text-slate-500">GSFC sites</span>
          </>
        )}
      </div>
    </div>
  );
}
