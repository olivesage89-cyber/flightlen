"use client";

import { generateAircraftExplanation } from "@/lib/explain";
import type { Aircraft } from "@/lib/types";

interface AircraftPanelProps {
  aircraft: Aircraft | null;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/50 p-3 dark:border-white/5 dark:bg-white/5">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export default function AircraftPanel({ aircraft, onClose }: AircraftPanelProps) {
  if (!aircraft) return null;

  const explanation = generateAircraftExplanation(aircraft);
  const title = aircraft.callsign?.trim() || aircraft.icao24.toUpperCase();

  return (
    <div className="glass-panel absolute right-0 top-0 z-20 h-full w-full max-w-sm overflow-y-auto p-5 scrollbar-thin sm:rounded-l-3xl sm:rounded-r-none">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 2v1.5l4-1 4 1V21l-2.5-2v-5.5l8 2.5z" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-slate-400">
              {aircraft.airline ?? "Operator unknown"}
              {aircraft.aircraftType ? ` · ${aircraft.aircraftType}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="mb-5 rounded-2xl border border-brand-200/60 bg-brand-gradient-soft p-4 text-sm leading-relaxed text-slate-700 dark:border-brand-500/20 dark:text-slate-200">
        {explanation}
      </p>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Origin" value={aircraft.originAirport ?? "Unknown"} />
        <Stat label="Destination" value={aircraft.destinationAirport ?? "Unknown"} />
        <Stat
          label="Altitude"
          value={aircraft.altitudeFt != null ? `${aircraft.altitudeFt.toLocaleString()} ft` : "—"}
        />
        <Stat
          label="Ground speed"
          value={aircraft.groundSpeedKt != null ? `${aircraft.groundSpeedKt} kt` : "—"}
        />
        <Stat
          label="Heading"
          value={aircraft.headingDeg != null ? `${aircraft.headingDeg}°` : "—"}
        />
        <Stat
          label="Vertical rate"
          value={
            aircraft.verticalRateFtMin != null
              ? `${aircraft.verticalRateFtMin > 0 ? "+" : ""}${aircraft.verticalRateFtMin} ft/min`
              : "—"
          }
        />
        <Stat label="Registration" value={aircraft.registration ?? "Unknown"} />
        <Stat label="ICAO24" value={aircraft.icao24.toUpperCase()} />
      </dl>

      <p className="mt-6 text-xs text-slate-400">
        Position data updates automatically from the live feed. Some fields
        require a flight-status data subscription and will show as
        &quot;Unknown&quot; until one is configured.
      </p>
    </div>
  );
}
