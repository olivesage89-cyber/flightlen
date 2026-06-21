// Lightweight sunrise/sunset estimate (NOAA simplified algorithm) so the
// map and UI can switch to a night theme based on the user's actual location
// and time of day, not just system dark mode. Good to within a few minutes,
// which is plenty for a visual day/night switch.

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/**
 * Returns true if it is currently night time (sun below horizon) at the
 * given latitude/longitude.
 */
export function isNightAt(lat: number, lon: number, date: Date = new Date()): boolean {
  const n = dayOfYear(date);

  // Solar declination (approx).
  const decl = 23.44 * Math.sin(toRad((360 / 365) * (n - 81)));

  // Equation of time (minutes, approx).
  const b = toRad((360 / 365) * (n - 81));
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarTime = utcHours + lon / 15 + eot / 60;
  const hourAngle = (solarTime - 12) * 15; // degrees

  const latRad = toRad(lat);
  const declRad = toRad(decl);

  const sinAltitude =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(toRad(hourAngle));

  const altitude = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAltitude))));

  // Civil twilight threshold: treat dusk/dawn (-6deg) as "night" for the map.
  return altitude < -6;
}
