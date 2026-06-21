import { NextResponse } from "next/server";
import { fetchLiveAircraft, US_BOUNDS } from "@/lib/opensky";

export const revalidate = 8;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lamin = Number(searchParams.get("lamin") ?? US_BOUNDS.lamin);
  const lomin = Number(searchParams.get("lomin") ?? US_BOUNDS.lomin);
  const lamax = Number(searchParams.get("lamax") ?? US_BOUNDS.lamax);
  const lomax = Number(searchParams.get("lomax") ?? US_BOUNDS.lomax);

  try {
    const aircraft = await fetchLiveAircraft({ lamin, lomin, lamax, lomax });
    return NextResponse.json(
      { aircraft, fetchedAt: Date.now() },
      { headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=15" } }
    );
  } catch (err) {
    console.error("OpenSky fetch failed:", err);
    return NextResponse.json(
      {
        aircraft: [],
        fetchedAt: Date.now(),
        error:
          "Live aircraft feed temporarily unavailable (OpenSky may be rate-limiting anonymous requests). Try again shortly.",
      },
      { status: 200 }
    );
  }
}
