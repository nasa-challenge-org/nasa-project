import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-2xl bg-white/[0.07] ring-1 ring-white/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export function ChipSkeletonRow() {
  return (
    <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Loading candidates">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-28 rounded-full" />
      ))}
    </div>
  );
}

export function PolarPanelSkeleton({ label }: { label: string }) {
  return (
    <div
      className="flex h-full min-h-[28rem] flex-col rounded-3xl border border-white/8 bg-[#0a1222] p-4 sm:p-5"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-full max-w-md" />
      <div className="mx-auto mt-6 grid h-64 w-64 place-items-center sm:h-80 sm:w-80">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export function CandidateCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-4 h-16 w-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RosterSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading candidate list">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-1 py-1">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4"
        >
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-24" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4"
      aria-busy="true"
      aria-label="Loading elevation chart"
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-48 w-full" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div
      className="space-y-3 rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4"
      aria-busy="true"
      aria-label="Loading timeline"
    >
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-full rounded-full" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}

export function SiteBriefSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading site brief">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-16 w-full max-w-3xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/8 bg-[#0c1324] p-3"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareTableSkeleton() {
  return (
    <div
      className="space-y-3 rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4"
      aria-busy="true"
      aria-label="Comparing sites"
    >
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function MissionPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading mission">
      <ChipSkeletonRow />
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <PolarPanelSkeleton label="local sky" />
        <PolarPanelSkeleton label="south pole sketch" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-2/3" />
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#121a2e]/90 p-4">
          <RosterSkeleton />
        </div>
      </div>
      <TimelineSkeleton />
      <MetricGridSkeleton />
    </div>
  );
}

export function CandidatesPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading candidates">
      <PolarPanelSkeleton label="south pole sketch" />
      <CandidateCardsSkeleton />
    </div>
  );
}
