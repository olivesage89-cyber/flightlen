import type { AirportWeather, FlightCategory } from "./types";

const AVIATION_WEATHER_BASE =
  process.env.AVIATION_WEATHER_BASE_URL ??
  "https://aviationweather.gov/api/data";

interface RawMetarRecord {
  rawOb?: string;
  obsTime?: number;
  temp?: number;
  dewp?: number;
  wdir?: number | string;
  wspd?: number;
  wgst?: number;
  visib?: number | string;
  clouds?: { cover?: string; base?: number }[];
}

interface RawTafRecord {
  rawTAF?: string;
}

/**
 * Determines FAA flight category from ceiling (ft AGL) and visibility (sm).
 * VFR: ceiling > 3000 and vis > 5
 * MVFR: ceiling 1000-3000 or vis 3-5
 * IFR: ceiling 500-999 or vis 1-2.99
 * LIFR: ceiling < 500 or vis < 1
 */
export function determineFlightCategory(
  ceilingFt: number | null | undefined,
  visibilitySm: number | null | undefined
): FlightCategory {
  if (ceilingFt == null && visibilitySm == null) return "UNKNOWN";
  const ceiling = ceilingFt ?? 99999;
  const vis = visibilitySm ?? 99;

  if (ceiling < 500 || vis < 1) return "LIFR";
  if (ceiling < 1000 || vis < 3) return "IFR";
  if (ceiling < 3000 || vis < 5) return "MVFR";
  return "VFR";
}

function lowestCeiling(clouds?: { cover?: string; base?: number }[]): number | null {
  if (!clouds || clouds.length === 0) return null;
  const ceilingLayers = clouds.filter((c) => c.cover === "BKN" || c.cover === "OVC");
  if (ceilingLayers.length === 0) return null;
  return Math.min(...ceilingLayers.map((c) => c.base ?? 99999));
}

export async function fetchAirportWeather(icao: string): Promise<AirportWeather> {
  const fallback: AirportWeather = {
    icao,
    flightCategory: "UNKNOWN",
  };

  try {
    const [metarRes, tafRes] = await Promise.all([
      fetch(
        `${AVIATION_WEATHER_BASE}/metar?ids=${icao}&format=json&hours=1`,
        { next: { revalidate: 60 } }
      ),
      fetch(`${AVIATION_WEATHER_BASE}/taf?ids=${icao}&format=json`, {
        next: { revalidate: 300 },
      }),
    ]);

    const metarJson: RawMetarRecord[] = metarRes.ok ? await metarRes.json() : [];
    const tafJson: RawTafRecord[] = tafRes.ok ? await tafRes.json() : [];

    const metar = metarJson?.[0];
    const taf = tafJson?.[0];

    if (!metar) return fallback;

    const ceilingFt = lowestCeiling(metar.clouds);
    const visibilitySm =
      typeof metar.visib === "string" ? parseFloat(metar.visib) : metar.visib ?? null;
    const windDirDeg =
      typeof metar.wdir === "string" ? null : metar.wdir ?? null;

    return {
      icao,
      rawMetar: metar.rawOb ?? null,
      rawTaf: taf?.rawTAF ?? null,
      observedAt: metar.obsTime
        ? new Date(metar.obsTime * 1000).toISOString()
        : null,
      temperatureC: metar.temp ?? null,
      dewpointC: metar.dewp ?? null,
      visibilitySm: visibilitySm ?? null,
      windDirDeg,
      windSpeedKt: metar.wspd ?? null,
      windGustKt: metar.wgst ?? null,
      ceilingFt,
      flightCategory: determineFlightCategory(ceilingFt, visibilitySm),
    };
  } catch {
    return fallback;
  }
}
