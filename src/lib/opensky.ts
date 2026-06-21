import type { Aircraft } from "./types";

// Continental US bounding box.
export const US_BOUNDS = {
  lamin: 24.396308,
  lomin: -125.0,
  lamax: 49.384358,
  lomax: -66.93457,
};

const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const STATES_URL = "https://opensky-network.org/api/states/all";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getOpenSkyToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    cachedToken = {
      value: json.access_token,
      expiresAt: Date.now() + (json.expires_in - 30) * 1000,
    };
    return cachedToken.value;
  } catch {
    return null;
  }
}

type RawState = [
  string, // icao24
  string | null, // callsign
  string, // origin_country
  number | null, // time_position
  number, // last_contact
  number | null, // longitude
  number | null, // latitude
  number | null, // baro_altitude (m)
  boolean, // on_ground
  number | null, // velocity (m/s)
  number | null, // true_track (deg)
  number | null, // vertical_rate (m/s)
  unknown,
  number | null, // geo_altitude (m)
  string | null, // squawk
  boolean,
  number
];

const MS_TO_KT = 1.94384;
const M_TO_FT = 3.28084;
const MS_TO_FTMIN = 196.85;

function normalize(state: RawState): Aircraft {
  const [
    icao24,
    callsignRaw,
    ,
    ,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
  ] = state;

  return {
    icao24,
    callsign: callsignRaw?.trim() || null,
    lat: latitude,
    lon: longitude,
    altitudeFt: baro_altitude != null ? Math.round(baro_altitude * M_TO_FT) : null,
    groundSpeedKt: velocity != null ? Math.round(velocity * MS_TO_KT) : null,
    headingDeg: true_track != null ? Math.round(true_track) : null,
    verticalRateFtMin:
      vertical_rate != null ? Math.round(vertical_rate * MS_TO_FTMIN) : null,
    onGround: Boolean(on_ground),
    lastUpdated: last_contact,
  };
}

/**
 * Fetches live aircraft states from the free OpenSky Network API for a
 * bounding box (defaults to the continental US). Works anonymously
 * (rate-limited, ~1 request every 10s recommended); set
 * OPENSKY_CLIENT_ID / OPENSKY_CLIENT_SECRET for higher limits.
 */
export async function fetchLiveAircraft(
  bounds: { lamin: number; lomin: number; lamax: number; lomax: number } = US_BOUNDS
): Promise<Aircraft[]> {
  const token = await getOpenSkyToken();
  const url = `${STATES_URL}?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 8 },
  });

  if (!res.ok) {
    throw new Error(`OpenSky request failed: ${res.status}`);
  }

  const json: { time: number; states: RawState[] | null } = await res.json();
  if (!json.states) return [];

  return json.states
    .filter((s) => s[5] != null && s[6] != null)
    .map(normalize);
}
