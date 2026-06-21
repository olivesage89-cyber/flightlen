import { NextResponse } from "next/server";
import { fetchAirportWeather } from "@/lib/weather";

export async function GET(
  _request: Request,
  { params }: { params: { icao: string } }
) {
  const weather = await fetchAirportWeather(params.icao.toUpperCase());
  return NextResponse.json(weather, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}
