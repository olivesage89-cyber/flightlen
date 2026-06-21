import type { AirportWeather, RunwayRecommendation } from "./types";

/**
 * The "why this matters" plain-English summary for an airport page —
 * combines weather category and runway wind analysis into a couple of
 * beginner-friendly sentences.
 */
export function generateAirportSummary(
  weather: AirportWeather,
  runway: RunwayRecommendation | null
): string {
  const sentences: string[] = [];

  switch (weather.flightCategory) {
    case "VFR":
      sentences.push(
        "Current conditions are VFR, meaning visibility and cloud cover are good — favorable for local and visual flying."
      );
      break;
    case "MVFR":
      sentences.push(
        "Conditions are marginal VFR right now — visibility or clouds are a bit lower than ideal, so some pilots may rely more on instruments."
      );
      break;
    case "IFR":
      sentences.push(
        "Conditions are IFR — low visibility or cloud ceilings mean aircraft are flying primarily by instruments today."
      );
      break;
    case "LIFR":
      sentences.push(
        "Conditions are low IFR, the most restrictive category — very low visibility or ceilings. Only aircraft and crews equipped for it are operating normally."
      );
      break;
    default:
      sentences.push("Current weather conditions aren't available right now.");
  }

  if (runway) {
    sentences.push(runway.explanation);
    if (runway.crosswindKt >= 15) {
      sentences.push(
        "Crosswinds may make conditions more challenging for smaller aircraft."
      );
    }
  }

  return sentences.join(" ");
}
