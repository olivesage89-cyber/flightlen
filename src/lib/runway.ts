import type { Airport, RunwayRecommendation } from "./types";

/**
 * Wind components relative to a runway heading.
 * headwindKt > 0 means a headwind (good); < 0 means a tailwind (bad).
 * crosswindKt is always >= 0.
 */
export function windComponents(
  runwayHeadingDeg: number,
  windDirDeg: number,
  windSpeedKt: number
) {
  const angle = ((windDirDeg - runwayHeadingDeg + 540) % 360) - 180; // -180..180
  const rad = (angle * Math.PI) / 180;
  const headwindKt = Math.round(windSpeedKt * Math.cos(rad) * 10) / 10;
  const crosswindKt = Math.round(Math.abs(windSpeedKt * Math.sin(rad)) * 10) / 10;
  return { headwindKt, crosswindKt };
}

function runwayEndLabel(pairId: string, heading: number, otherHeading: number): string {
  const [a, b] = pairId.split("/");
  return heading <= otherHeading ? a : b;
}

/**
 * Picks the runway end across the whole airport that best faces into the
 * wind (best headwind, i.e. least tailwind), and explains the choice in
 * plain English. This is a simplified estimate — real-world runway
 * assignment also depends on ATC, noise abatement, traffic flow, and
 * runway length/approach equipment.
 */
export function estimateFavoredRunway(
  airport: Airport,
  windDirDeg: number | null | undefined,
  windSpeedKt: number | null | undefined
): RunwayRecommendation | null {
  if (
    windDirDeg == null ||
    windSpeedKt == null ||
    airport.runways.length === 0
  ) {
    return null;
  }

  let best: { label: string; headwindKt: number; crosswindKt: number } | null = null;

  for (const pair of airport.runways) {
    for (const heading of [pair.headingA, pair.headingB]) {
      const other = heading === pair.headingA ? pair.headingB : pair.headingA;
      const { headwindKt, crosswindKt } = windComponents(
        heading,
        windDirDeg,
        windSpeedKt
      );
      const label = runwayEndLabel(pair.id, heading, other);
      if (!best || headwindKt > best.headwindKt) {
        best = { label, headwindKt, crosswindKt };
      }
    }
  }

  if (!best) return null;

  const windDescriptor = compassDirection(windDirDeg);
  let explanation: string;

  if (windSpeedKt < 3) {
    explanation = `Winds are light and variable, so any runway works well right now — Runway ${best.label} is the likely pick.`;
  } else if (best.headwindKt <= 0) {
    explanation = `Winds are light enough that runway choice is mostly about traffic flow today; Runway ${best.label} is the likely pick.`;
  } else {
    explanation = `${windDescriptor} winds currently favor Runway ${best.label}.`;
  }

  if (best.crosswindKt >= 15) {
    explanation += ` Crosswinds near ${Math.round(
      best.crosswindKt
    )} kt may make landings more challenging for smaller aircraft.`;
  }

  return {
    favoredRunway: best.label,
    headwindKt: best.headwindKt,
    crosswindKt: best.crosswindKt,
    explanation,
  };
}

export function compassDirection(deg: number): string {
  const dirs = [
    "North",
    "North-northeast",
    "Northeast",
    "East-northeast",
    "East",
    "East-southeast",
    "Southeast",
    "South-southeast",
    "South",
    "South-southwest",
    "Southwest",
    "West-southwest",
    "West",
    "West-northwest",
    "Northwest",
    "North-northwest",
  ];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}
