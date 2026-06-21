// Shared types used across the app.

export interface Airport {
  icao: string; // e.g. "KIND"
  iata: string; // e.g. "IND"
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  elevationFt: number;
  // Runway pairs, e.g. "05L/23R". Headings are magnetic, in degrees.
  runways: RunwayPair[];
}

export interface RunwayPair {
  id: string; // "05L/23R"
  headingA: number; // degrees, e.g. 050
  headingB: number; // degrees, e.g. 230
  lengthFt?: number;
}

export interface Aircraft {
  icao24: string; // unique transponder id, lowercase hex
  callsign: string | null;
  lat: number | null;
  lon: number | null;
  altitudeFt: number | null;
  groundSpeedKt: number | null;
  headingDeg: number | null;
  verticalRateFtMin: number | null;
  onGround: boolean;
  originAirport?: string | null;
  destinationAirport?: string | null;
  airline?: string | null;
  aircraftType?: string | null;
  registration?: string | null;
  lastUpdated: number; // unix seconds
}

export interface AircraftDetail extends Aircraft {
  etaIso?: string | null;
  minutesToLanding?: number | null;
  explanation: string;
}

export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR" | "UNKNOWN";

export interface AirportWeather {
  icao: string;
  rawMetar?: string | null;
  rawTaf?: string | null;
  observedAt?: string | null;
  temperatureC?: number | null;
  dewpointC?: number | null;
  visibilitySm?: number | null;
  windDirDeg?: number | null;
  windSpeedKt?: number | null;
  windGustKt?: number | null;
  ceilingFt?: number | null;
  flightCategory: FlightCategory;
}

export interface RunwayRecommendation {
  favoredRunway: string; // e.g. "23R"
  headwindKt: number;
  crosswindKt: number;
  explanation: string;
}

export interface SearchResult {
  type: "airport" | "flight";
  label: string;
  sublabel?: string;
  href: string;
}
