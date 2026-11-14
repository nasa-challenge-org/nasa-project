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
        South pole
      </p>
      <div className="mt-1 text-sm text-slate-200">
        {!loaded ? (
          <Skeleton className="mt-1 h-4 w-36" />
        ) : sitesCount === null ? (
          "Candidate count N/A"
        ) : (
          `${sitesCount} GSFC LOLA sites`
        )}
      </div>
      <p className="text-[11px] text-slate-500">
        Navigator only · not a landing ranking
      </p>
    </div>
  );
}
