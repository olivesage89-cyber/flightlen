import type { Metadata } from "next";
import Link from "next/link";
import { getAllAirports } from "@/lib/airports";

export const metadata: Metadata = {
  title: "U.S. Airports — Live Arrivals, Departures & Weather",
  description:
    "Browse live arrivals, departures, weather, and runway conditions for major U.S. airports on FlightLine.",
};

export default function AirportsDirectoryPage() {
  const airports = getAllAirports();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">Airports</h1>
      <p className="mb-6 text-slate-400">
        Live activity, weather, and runway conditions for major U.S. airports.
        More airports are added regularly — search any airport from the bar above.
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {airports.map((a) => (
          <li key={a.icao}>
            <Link
              href={`/airport/${a.icao}`}
              className="glass-panel block p-4 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <p className="font-display text-sm font-bold tracking-tight text-brand-600 dark:text-brand-300">
                {a.icao} · {a.iata}
              </p>
              <p className="mt-0.5 text-sm font-medium">{a.name}</p>
              <p className="text-xs text-slate-400">
                {a.city}, {a.state}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
