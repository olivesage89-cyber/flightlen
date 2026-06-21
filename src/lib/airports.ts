import airportsData from "@/data/airports.json";
import type { Airport } from "./types";

// Starter dataset of major US airports. Swap this for a full FAA/OurAirports
// import later — the rest of the app only depends on the `Airport` shape.
const AIRPORTS = airportsData as Airport[];

export function getAllAirports(): Airport[] {
  return AIRPORTS;
}

export function getAirportByIcao(icao: string): Airport | undefined {
  const normalized = icao.trim().toUpperCase();
  return AIRPORTS.find(
    (a) => a.icao === normalized || a.iata === normalized
  );
}

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return AIRPORTS.filter(
    (a) =>
      a.icao.toLowerCase().includes(q) ||
      a.iata.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q)
  ).slice(0, limit);
}

// Great-circle distance in nautical miles, used to find "nearby" aircraft.
export function distanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R_NM = 3440.065;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_NM * c;
}

export function getNearbyAirports(
  lat: number,
  lon: number,
  withinNm = 50
): Airport[] {
  return AIRPORTS.filter((a) => distanceNm(lat, lon, a.lat, a.lon) <= withinNm);
}
