"use client";

import { useEffect, useRef, useState } from "react";
import type { Aircraft } from "./types";

interface Bounds {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

interface UseLiveAircraftResult {
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Polls /api/aircraft on an interval. The route itself caches/revalidates
 * server-side, so this is safe to call from multiple components without
 * hammering the upstream OpenSky API.
 */
export function useLiveAircraft(
  bounds?: Bounds,
  intervalMs = 10000
): UseLiveAircraftResult {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const boundsKey = bounds
    ? `${bounds.lamin},${bounds.lomin},${bounds.lamax},${bounds.lomax}`
    : "us";
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const qs = bounds
          ? `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`
          : "";
        const res = await fetch(`/api/aircraft${qs}`);
        const json = await res.json();
        if (cancelled) return;
        setAircraft(json.aircraft ?? []);
        setLastUpdated(json.fetchedAt ?? Date.now());
        setError(json.error ?? null);
      } catch {
        if (!cancelled) setError("Couldn't reach the live aircraft feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    timerRef.current = window.setInterval(load, intervalMs);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, intervalMs]);

  return { aircraft, loading, error, lastUpdated };
}
