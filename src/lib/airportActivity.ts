import type { Aircraft, Airport } from "./types";
import { distanceNm } from "./airports";

export type ActivityBucket = "arriving" | "departing" | "nearby" | "on_ground";

export interface ClassifiedAircraft {
  aircraft: Aircraft;
  distanceNm: number;
  bucket: ActivityBucket;
}

const NEARBY_RADIUS_NM = 40;
const LOW_ALTITUDE_FT = 10000;

/**
 * Rough, explainable heuristic for "is this plane arriving at / departing
 * from this airport" using only live position telemetry (no flight plan
 * data). Good enough for an at-a-glance MVP view; swap in real flight-plan
 * matching (origin/destination from a flight-status API) when available
 * for higher accuracy.
 */
export function classifyForAirport(
  aircraft: Aircraft,
  airport: Airport
): ClassifiedAircraft | null {
  if (aircraft.lat == null || aircraft.lon == null) return null;
  const dist = distanceNm(airport.lat, airport.lon, aircraft.lat, aircraft.lon);
  if (dist > NEARBY_RADIUS_NM) return null;

  let bucket: ActivityBucket = "nearby";
  if (aircraft.onGround) {
    bucket = "on_ground";
  } else if (
    (aircraft.altitudeFt ?? 99999) < LOW_ALTITUDE_FT &&
    (aircraft.verticalRateFtMin ?? 0) < -200
  ) {
    bucket = "arriving";
  } else if (
    (aircraft.altitudeFt ?? 99999) < LOW_ALTITUDE_FT &&
    (aircraft.verticalRateFtMin ?? 0) > 200
  ) {
    bucket = "departing";
  }

  return { aircraft, distanceNm: Math.round(dist), bucket };
}

export function classifyAllForAirport(
  aircraft: Aircraft[],
  airport: Airport
): ClassifiedAircraft[] {
  return aircraft
    .map((a) => classifyForAirport(a, airport))
    .filter((c): c is ClassifiedAircraft => c !== null)
    .sort((a, b) => a.distanceNm - b.distanceNm);
}

export function approachBoundsAround(airport: Airport, degrees = 1.2) {
  return {
    lamin: airport.lat - degrees,
    lomin: airport.lon - degrees,
    lamax: airport.lat + degrees,
    lomax: airport.lon + degrees,
  };
}
