# FlightLine

Live U.S. flight map + airport intelligence, built with Next.js. Know what's happening in the sky and at your airport in 30 seconds.

## What's included (MVP)

- **Live map** of aircraft over the continental U.S. (free OpenSky Network feed, no key required)
- **Click any aircraft** for a detail panel with altitude, speed, heading, and a plain-English explanation
- **Airport pages** (`/airport/KIND`, `/airport/KLAX`, etc.) with live nearby traffic, weather (METAR/TAF via aviationweather.gov), runway/wind analysis, and a "why this matters" summary
- **Airport directory** (`/airports`) for SEO internal linking — add more airports any time in `src/data/airports.json`
- **Day/night map theme** that follows the user's actual location + time of day (falls back to OS dark-mode preference if location isn't shared)
- **Site-wide search** for airports and flight callsigns
- **Reserved ad rail** (left/right on desktop, inline banner on mobile) that disappears completely once `isPremium` is true
- **Supabase scaffold** for optional accounts + saved favorites (schema in `supabase/schema.sql`), not required to browse the site
- SEO basics: per-airport metadata, `sitemap.xml`, `robots.txt`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything works out of the box with **zero configuration** — no API keys required for the MVP. Copy `.env.example` to `.env.local` only when you're ready to swap in real keys:

```bash
cp .env.example .env.local
```

## Swapping in real data sources later

| Feature | Free default | Upgrade path |
|---|---|---|
| Map tiles | CARTO light/dark raster basemaps (no key) | Set `NEXT_PUBLIC_MAPBOX_TOKEN` to switch to Mapbox tiles |
| Aircraft positions | OpenSky Network, anonymous (rate-limited) | Set `OPENSKY_CLIENT_ID`/`OPENSKY_CLIENT_SECRET` for higher limits, or replace `src/lib/opensky.ts` with a paid feed (FlightAware AeroAPI, ADS-B Exchange, Cirium) |
| Flight route (origin/destination/ETA) | Not available — explained honestly in the UI | Needs a flight-status provider; wire it into `src/lib/explain.ts` and the `Aircraft` type's `originAirport`/`destinationAirport` fields |
| Weather | aviationweather.gov (free, public, no key) | No change needed — this is the standard FAA-grade source |
| Accounts/favorites | Disabled until configured | Create a Supabase project, run `supabase/schema.sql`, set `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Ads | Reserved empty slot | Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and drop your AdSense `<ins>` snippet into `src/components/AdSlot.tsx` |

## Project structure

```
src/
  app/
    page.tsx                  Homepage (live map)
    airport/[icao]/page.tsx   Airport page template
    airports/page.tsx         Airport directory (SEO)
    api/aircraft/route.ts     Live aircraft proxy (OpenSky)
    api/weather/[icao]/route.ts  METAR/TAF proxy
    sitemap.ts, robots.ts     SEO
  components/
    Map/FlightMap.tsx         MapLibre map (aircraft + airport pins)
    AircraftPanel.tsx         Aircraft detail side panel
    AirportActivity.tsx       Airport mini-map + arrivals/departures/nearby
    WeatherCard.tsx, RunwayCard.tsx
    SearchBar.tsx, NavBar.tsx, ThemeToggle.tsx, AccountMenu.tsx, AdSlot.tsx
    ThemeProvider.tsx          Day/night theme (location + time based)
  lib/
    opensky.ts                Live aircraft fetch + normalization
    weather.ts                METAR/TAF fetch + flight category
    runway.ts                 Headwind/crosswind + favored runway
    explain.ts                Plain-English aircraft summaries
    airportActivity.ts        Arrivals/departures/nearby heuristic
    airportSummary.ts         "Why this matters" airport summary
    airports.ts, data/airports.json  Starter airport dataset
    supabaseClient.ts, premium.tsx
supabase/schema.sql           Optional Supabase schema
```

## Expanding the airport dataset

`src/data/airports.json` ships with ~40 major U.S. airports (ICAO/IATA, city, state, lat/lon, runway headings) to prove out the product. For real growth, replace this with a full import from the FAA's NASR data or [OurAirports](https://ourairports.com/data/) — the rest of the app only depends on the `Airport` shape in `src/lib/types.ts`, so swapping the data source doesn't require touching any UI code.

## Notes on accuracy

- **Arrivals/departures/nearby** on airport pages are estimated from live altitude + climb rate near the airport, not confirmed flight plans. This is clearly labeled in the UI.
- **Origin/destination/ETA** on the aircraft panel require a flight-status API (not included in the free OpenSky tier). The UI is honest about this rather than guessing.
- Runway headings for the starter airport set are sourced from public airport data and are approximate — verify against current charts before using for anything beyond a UI demo.

## Deploying

Built for Vercel. Push to a Git repo, import it in Vercel, add any env vars from `.env.example` you want to use, and deploy. No environment variables are required for the MVP to work.
