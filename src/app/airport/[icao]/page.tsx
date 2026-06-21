import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAirportByIcao, getAllAirports } from "@/lib/airports";
import { fetchAirportWeather } from "@/lib/weather";
import { estimateFavoredRunway } from "@/lib/runway";
import { generateAirportSummary } from "@/lib/airportSummary";
import WeatherCard from "@/components/WeatherCard";
import RunwayCard from "@/components/RunwayCard";
import AirportActivity from "@/components/AirportActivity";

interface AirportPageProps {
  params: { icao: string };
}

export function generateStaticParams() {
  return getAllAirports().map((a) => ({ icao: a.icao }));
}

export function generateMetadata({ params }: AirportPageProps): Metadata {
  const airport = getAirportByIcao(params.icao);
  if (!airport) return { title: "Airport not found" };

  const title = `${airport.icao} (${airport.iata}) — ${airport.name} Live Arrivals, Departures & Weather`;
  const description = `Live traffic, weather, and runway conditions for ${airport.name} (${airport.icao}/${airport.iata}) in ${airport.city}, ${airport.state}. See arrivals, departures, METAR/TAF, and the currently favored runway.`;

  return {
    title,
    description,
    alternates: { canonical: `/airport/${airport.icao}` },
  };
}

export const revalidate = 60;

export default async function AirportPage({ params }: AirportPageProps) {
  const airport = getAirportByIcao(params.icao);
  if (!airport) notFound();

  const weather = await fetchAirportWeather(airport.icao);
  const runway = estimateFavoredRunway(airport, weather.windDirDeg, weather.windSpeedKt);
  const summary = generateAirportSummary(weather, runway);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <p className="font-display text-sm font-bold tracking-wide text-brand-600 dark:text-brand-300">
          {airport.icao} · {airport.iata}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{airport.name}</h1>
        <p className="text-slate-400">
          {airport.city}, {airport.state} — elevation {airport.elevationFt} ft
        </p>
      </header>

      <div className="mb-6 rounded-2xl border border-brand-200/60 bg-brand-gradient-soft p-5 dark:border-brand-500/20">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          Why this matters
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{summary}</p>
      </div>

      <AirportActivity airport={airport} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeatherCard weather={weather} />
        <RunwayCard airport={airport} recommendation={runway} />
      </div>
    </div>
  );
}
