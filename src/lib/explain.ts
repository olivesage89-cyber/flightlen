import type { Aircraft } from "./types";
import { compassDirection } from "./runway";

function describePhase(aircraft: Aircraft): string {
  if (aircraft.onGround) return "on the ground";
  const vr = aircraft.verticalRateFtMin ?? 0;
  if (vr > 300) return "climbing";
  if (vr < -300) return "descending";
  return "cruising";
}

/**
 * Builds a beginner-friendly sentence describing what an aircraft is doing
 * right now, using only the telemetry we have from the free position feed.
 *
 * Origin/destination/ETA require a flight-status provider (FlightAware
 * AeroAPI, AeroDataBox, Cirium, etc.). Until one is configured, this
 * explains current motion honestly instead of guessing a route.
 */
export function generateAircraftExplanation(aircraft: Aircraft): string {
  const name =
    aircraft.callsign?.trim() || `Aircraft ${aircraft.icao24.toUpperCase()}`;

  if (aircraft.onGround) {
    return `${name} is currently on the ground, likely taxiing, parked, or just after landing/before takeoff.`;
  }

  const phase = describePhase(aircraft);
  const parts: string[] = [];

  if (aircraft.altitudeFt != null) {
    parts.push(`${phase} at about ${aircraft.altitudeFt.toLocaleString()} ft`);
  } else {
    parts.push(phase);
  }

  if (aircraft.groundSpeedKt != null) {
    parts.push(`at roughly ${aircraft.groundSpeedKt} kt ground speed`);
  }

  let directionPhrase = "";
  if (aircraft.headingDeg != null) {
    directionPhrase = `, heading ${compassDirection(aircraft.headingDeg).toLowerCase()}`;
  }

  let sentence = `${name} is ${parts.join(" ")}${directionPhrase}.`;

  if (aircraft.originAirport && aircraft.destinationAirport) {
    sentence += ` It departed ${aircraft.originAirport} and is heading toward ${aircraft.destinationAirport}.`;
  } else {
    sentence +=
      " Origin, destination, and landing time need a flight-status data subscription — wire one up in lib/opensky.ts / a new provider to unlock this.";
  }

  return sentence;
}

export function estimateMinutesToLanding(
  distanceRemainingNm: number | null,
  groundSpeedKt: number | null
): number | null {
  if (!distanceRemainingNm || !groundSpeedKt || groundSpeedKt <= 0) return null;
  return Math.round((distanceRemainingNm / groundSpeedKt) * 60);
}
