"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "lunaredge.onboarded.v1";

const STEPS = [
  {
    kicker: "Welcome",
    title: "A south-pole sky clock",
    body: "You pick a NASA site and a UTC window. We show where the Sun and Earth sit. We do not pick a landing.",
  },
  {
    kicker: "Four screens",
    title: "Same story, four doors",
    body: "Tap a door so you know where to go. You can always come back here.",
  },
  {
    kicker: "Colours",
    title: "Gold is Sun. Blue is Earth.",
    body: "If a plot looks busy, follow those two colours. Everything else is labels.",
  },
  {
    kicker: "Honesty",
    title: "N/A is not zero",
    body: "Tap the tiles. Missing data stays blank. We never fill it with 0.",
  },
  {
    kicker: "Try it",
    title: "Start with one site",
    body: "Open Candidates, tap a numbered place, then Mission → Run.",
  },
] as const;

const DOORS = [
  { n: "1", title: "Candidates", line: "Pick a GSFC site" },
  { n: "2", title: "Mission", line: "Sun & Earth in that sky" },
  { n: "3", title: "Compare", line: "Same clock, two sites" },
  { n: "4", title: "Sources", line: "Where numbers come from" },
];

export function OnboardingTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [door, setDoor] = useState(0);
  const [naChoice, setNaChoice] = useState<"na" | "zero" | null>(null);

  useEffect(() => {
    let show = true;
    try {
      show = window.localStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      show = true;
    }
    // First paint is closed so SSR matches; then open for new visitors.
    const id = window.setTimeout(() => {
      if (show) setOpen(true);
    }, 400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") finish(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") setStep((n) => Math.max(0, n - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // finish/next close over step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function finish(goCandidates: boolean) {
    persist();
    setOpen(false);
    setStep(0);
    if (goCandidates) router.push("/sites");
  }

  function next() {
    if (step >= STEPS.length - 1) {
      finish(true);
      return;
    }
    setStep((n) => n + 1);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setDoor(0);
          setNaChoice(null);
          setOpen(true);
        }}
        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
      >
        Tour
      </button>
    );
  }

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#10182c] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
            {current.kicker}
          </p>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-200"
            onClick={() => finish(false)}
          >
            Skip
          </button>
        </div>
        <div className="px-5 pb-2 pt-2">
          <h2 id="onboard-title" className="text-xl font-semibold text-white">
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {current.body}
          </p>
        </div>

        <div className="px-5 py-4">
          {step === 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-amber-400/12 p-3">
                <p className="text-[10px] uppercase text-amber-300">Sun</p>
                <p className="mt-1 text-lg font-semibold">Gold</p>
              </div>
              <div className="rounded-2xl bg-sky-400/12 p-3">
                <p className="text-[10px] uppercase text-sky-300">Earth</p>
                <p className="mt-1 text-lg font-semibold">Blue</p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-2">
              {DOORS.map((item, i) => (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => setDoor(i)}
                  className={`rounded-2xl border p-3 text-left ${
                    door === i
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-white/8 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs font-bold">
                    {item.n}
                  </span>
                  <p className="mt-2 text-sm font-medium text-slate-50">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500">{item.line}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="relative mx-auto h-40 w-40">
              <div className="absolute inset-0 rounded-full border border-cyan-400/40" />
              <div className="absolute inset-6 rounded-full border border-white/10" />
              <span className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] text-slate-500">
                N
              </span>
              <span className="absolute right-[18%] top-[28%] h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_16px_#fbbf24]" />
              <span className="absolute bottom-[30%] left-[22%] h-4 w-4 rounded-full bg-sky-400 shadow-[0_0_16px_#38bdf8]" />
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-300">
                Unknown sunlight hours — which should LunarEdge show?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNaChoice("na")}
                  className={`min-h-[8.5rem] rounded-2xl border-2 p-4 text-left ${
                    naChoice === "na"
                      ? "border-emerald-400 bg-emerald-400/15"
                      : "border-white/20 bg-[#0c1324]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    Honest
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-white">
                    N/A
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    We do not know yet
                  </p>
                  {naChoice === "na" ? (
                    <p className="mt-2 text-xs font-medium text-emerald-300">
                      Yes. Keep it blank.
                    </p>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setNaChoice("zero")}
                  className={`min-h-[8.5rem] rounded-2xl border-2 p-4 text-left ${
                    naChoice === "zero"
                      ? "border-rose-400 bg-rose-400/15"
                      : "border-white/20 bg-[#0c1324]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-300">
                    Wrong
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold text-white">
                    0 h
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Pretends the Sun is down
                  </p>
                  {naChoice === "zero" ? (
                    <p className="mt-2 text-xs font-medium text-rose-300">
                      No — 0 would mean night.
                    </p>
                  ) : null}
                </button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2 rounded-2xl bg-white/5 px-3 py-2">
                <span className="font-mono text-cyan-300">1</span> Candidates — tap a number
              </li>
              <li className="flex gap-2 rounded-2xl bg-white/5 px-3 py-2">
                <span className="font-mono text-cyan-300">2</span> Mission — set UTC, press Run
              </li>
              <li className="flex gap-2 rounded-2xl bg-white/5 px-3 py-2">
                <span className="font-mono text-cyan-300">3</span> Compare — same clock, two sites
              </li>
            </ol>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-4">
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i === step ? "bg-cyan-400" : "bg-white/15"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                className="rounded-full px-3 py-2 text-sm text-slate-400 hover:text-white"
                onClick={() => setStep((n) => n - 1)}
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              onClick={next}
            >
              {last ? "Open Candidates" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function resetOnboarding() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
