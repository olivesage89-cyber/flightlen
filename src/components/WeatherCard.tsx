import type { AirportWeather } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  VFR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  MVFR: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  IFR: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  LIFR: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  UNKNOWN: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/40 p-3 dark:border-white/5 dark:bg-white/5">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export default function WeatherCard({ weather }: { weather: AirportWeather }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-tight">Weather</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[weather.flightCategory]}`}
        >
          {weather.flightCategory}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Temperature"
          value={weather.temperatureC != null ? `${weather.temperatureC}°C` : "—"}
        />
        <Stat
          label="Dew point"
          value={weather.dewpointC != null ? `${weather.dewpointC}°C` : "—"}
        />
        <Stat
          label="Visibility"
          value={weather.visibilitySm != null ? `${weather.visibilitySm} sm` : "—"}
        />
        <Stat
          label="Wind"
          value={
            weather.windDirDeg != null && weather.windSpeedKt != null
              ? `${weather.windDirDeg}° at ${weather.windSpeedKt} kt${
                  weather.windGustKt ? ` (gust ${weather.windGustKt})` : ""
                }`
              : "—"
          }
        />
        <Stat
          label="Ceiling"
          value={weather.ceilingFt != null ? `${weather.ceilingFt.toLocaleString()} ft` : "Clear"}
        />
        <Stat
          label="Observed"
          value={
            weather.observedAt
              ? new Date(weather.observedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
        />
      </dl>

      {weather.rawMetar && (
        <details className="mt-4 text-xs text-slate-400">
          <summary className="cursor-pointer">Raw METAR / TAF</summary>
          <p className="mt-2 font-mono">{weather.rawMetar}</p>
          {weather.rawTaf && <p className="mt-1 font-mono">{weather.rawTaf}</p>}
        </details>
      )}
    </section>
  );
}
