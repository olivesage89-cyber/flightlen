import type { MetadataRoute } from "next";
import { getAllAirports } from "@/lib/airports";

const BASE_URL = "https://flightline.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const airportEntries = getAllAirports().map((a) => ({
    url: `${BASE_URL}/airport/${a.icao}`,
    changeFrequency: "always" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, changeFrequency: "always", priority: 1 },
    { url: `${BASE_URL}/airports`, changeFrequency: "daily", priority: 0.6 },
    ...airportEntries,
  ];
}
