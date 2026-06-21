"use client";

import { useMemo, useRef, useState } from "react";
import FlightMap from "@/components/Map/FlightMap";
import AircraftPanel from "@/components/AircraftPanel";
import { useLiveAircraft } from "@/lib/useLiveAircraft";
import { approachBoundsAround, classifyAllForAirport, type ActivityBucket } from "@/lib/airportActivity";
import type { Aircraft, Airport } from "@/lib/types";

const BUCKET_LABEL: Record<ActivityBucket, string> = {
  arriving: "On approach / arriving",
  departing: "Departing",
  nearby: "Nearby",
  on_ground: "On the ground",
};

function ActivityColumn({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { aircraft: Aircraft; distanceNm: number }[];
  onSelect: (a: Aircraft) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing right now.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 8).map(({ aircraft, distanceNm }) => (
            <li key={aircraft.icao24}>
              <button
                onClick={() => onSelect(aircraft)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-brand-50 dark:hover:bg-white/5"
              >
                <span className="font-medium">
                  {aircraft.callsign?.trim() || aircraft.icao24.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {aircraft.altitudeFt != null ? `${aircraft.altitudeFt.toLocaleString()} ft` : ""} ·{" "}
                  {distanceNm} nm
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AirportActivity({ airport }: { airport: Airport }) {
  const bounds = useMemo(() => approachBoundsAround(airport), [airport]);
  const { aircraft, loading } = useLiveAircraft(bounds, 10000);
  const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
  const lastKnownRef = useRef<Aircraft | null>(null);

  const selected = useMemo(() => {
    if (!selectedIcao24) return null;
    const found = aircraft.find((a) => a.icao24 === selectedIcao24) ?? null;
    if (found) lastKnownRef.current = found;
    return found ?? lastKnownRef.current;
  }, [aircraft, selectedIcao24]);

  const classified = useMemo(() => classifyAllForAirport(aircraft, airport), [aircraft, airport]);
  const arriving = classified.filter((c) => c.bucket === "arriving");
  const departing = classified.filter((c) => c.bucket === "departing");
  const nearby = classified.filter((c) => c.bucket === "nearby" || c.bucket === "on_ground");

  return (
    <section>
      <div className="relative mb-6 h-80 overflow-hidden rounded-3xl shadow-glass ring-1 ring-white/50 dark:ring-white/10">
        <FlightMap
          aircraft={aircraft}
          selectedIcao24={selectedIcao24}
          onSelectAircraft={(a) => setSelectedIcao24(a.icao24)}
          center={[airport.lon, airport.lat]}
          zoom={9}
          airportPins={[{ airport, variant: "primary" }]}
        />
        <AircraftPanel aircraft={selected} onClose={() => setSelectedIcao24(null)} />
        {loading && (
          <div className="absolute left-3 top-3 rounded-xl border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-medium shadow-glass backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
            Loading nearby traffic…
          </div>
        )}
      </div>

      <div className="glass-panel grid grid-cols-1 gap-6 p-5 sm:grid-cols-3">
        <ActivityColumn title={BUCKET_LABEL.arriving} items={arriving} onSelect={(a) => setSelectedIcao24(a.icao24)} />
        <ActivityColumn title={BUCKET_LABEL.departing} items={departing} onSelect={(a) => setSelectedIcao24(a.icao24)} />
        <ActivityColumn title="Nearby" items={nearby} onSelect={(a) => setSelectedIcao24(a.icao24)} />
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Arriving/departing status is estimated from live altitude and climb
        rate near the airport, not confirmed flight plans — it&apos;s a good
        at-a-glance signal, not a guarantee.
      </p>
    </section>
  );
}
