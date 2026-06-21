"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FlightMap from "@/components/Map/FlightMap";
import AircraftPanel from "@/components/AircraftPanel";
import AdSlot from "@/components/AdSlot";
import { useLiveAircraft } from "@/lib/useLiveAircraft";
import type { Aircraft } from "@/lib/types";

export default function HomeClient() {
  const { aircraft, loading, error, lastUpdated } = useLiveAircraft(undefined, 10000);
  const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
  const lastKnownRef = useRef<Aircraft | null>(null);
  const searchParams = useSearchParams();
  const flightQuery = searchParams.get("flight");

  // Re-derive the selected aircraft from the latest poll every render, so
  // the detail panel shows live-updating telemetry instead of a frozen
  // snapshot from the moment it was clicked.
  const selected = useMemo(() => {
    if (!selectedIcao24) return null;
    const found = aircraft.find((a) => a.icao24 === selectedIcao24) ?? null;
    if (found) lastKnownRef.current = found;
    return found ?? lastKnownRef.current;
  }, [aircraft, selectedIcao24]);

  useEffect(() => {
    if (!flightQuery) return;
    const match = aircraft.find(
      (a) => a.callsign?.toUpperCase().trim() === flightQuery.toUpperCase().trim()
    );
    if (match) setSelectedIcao24(match.icao24);
  }, [flightQuery, aircraft]);

  const flightNotFound = Boolean(
    flightQuery &&
      !loading &&
      !aircraft.some((a) => a.callsign?.toUpperCase().trim() === flightQuery.toUpperCase().trim())
  );

  const secondsAgo = useMemo(() => {
    if (!lastUpdated) return null;
    return Math.max(0, Math.round((Date.now() - lastUpdated) / 1000));
  }, [lastUpdated]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="px-4 pt-3 sm:hidden">
        <AdSlot position="inline" />
      </div>

      <div className="relative flex-1 sm:m-3 sm:overflow-hidden sm:rounded-3xl sm:shadow-glass sm:ring-1 sm:ring-white/50 dark:sm:ring-white/10">
        <FlightMap
          aircraft={aircraft}
          selectedIcao24={selectedIcao24}
          onSelectAircraft={(a) => setSelectedIcao24(a.icao24)}
        />

        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 flex-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-sm font-semibold">
              {loading ? "Loading live traffic…" : `${aircraft.length.toLocaleString()} aircraft tracked`}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {error
              ? error
              : secondsAgo != null
              ? `Updated ${secondsAgo}s ago`
              : "Connecting to live feed…"}
          </p>
          {flightNotFound && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              &quot;{flightQuery}&quot; isn&apos;t currently airborne in the live feed.
            </p>
          )}
        </div>

        <AircraftPanel aircraft={selected} onClose={() => setSelectedIcao24(null)} />
      </div>
    </div>
  );
}
