import type { Airport, RunwayRecommendation } from "@/lib/types";

export default function RunwayCard({
  airport,
  recommendation,
}: {
  airport: Airport;
  recommendation: RunwayRecommendation | null;
}) {
  return (
    <section className="glass-panel p-5">
      <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Runways</h2>

      {recommendation ? (
        <p className="mb-4 rounded-2xl border border-brand-200/60 bg-brand-gradient-soft p-4 text-sm leading-relaxed text-slate-700 dark:border-brand-500/20 dark:text-slate-200">
          {recommendation.explanation}
        </p>
      ) : (
        <p className="mb-4 text-sm text-slate-400">
          Current wind data isn&apos;t available, so we can&apos;t estimate the
          favored runway right now.
        </p>
      )}

      <ul className="space-y-2">
        {airport.runways.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-white/50 bg-white/40 px-3 py-2 text-sm dark:border-white/5 dark:bg-white/5"
          >
            <span className="font-semibold">{r.id}</span>
            <span className="text-slate-400">
              {r.headingA.toString().padStart(3, "0")}° /{" "}
              {r.headingB.toString().padStart(3, "0")}°
            </span>
            {recommendation && r.id.includes(recommendation.favoredRunway) && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                Favored
              </span>
            )}
          </li>
        ))}
      </ul>

      {recommendation && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/50 bg-white/40 p-3 dark:border-white/5 dark:bg-white/5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Headwind</dt>
            <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{recommendation.headwindKt} kt</dd>
          </div>
          <div className="rounded-xl border border-white/50 bg-white/40 p-3 dark:border-white/5 dark:bg-white/5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Crosswind</dt>
            <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{recommendation.crosswindKt} kt</dd>
          </div>
        </div>
      )}
    </section>
  );
}
