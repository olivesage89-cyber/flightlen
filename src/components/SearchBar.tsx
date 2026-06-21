"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAirports } from "@/lib/airports";
import type { SearchResult } from "@/lib/types";

/**
 * Site-wide search. Airport code/name/city/state search is instant
 * (small static dataset, no network round-trip). Flight/callsign search
 * routes to the homepage map with a `flight` query param — the map page
 * looks for a matching live aircraft and zooms to it, since flight lookup
 * depends on whichever live aircraft feed is currently loaded.
 */
export default function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results: SearchResult[] = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const airportResults: SearchResult[] = searchAirports(trimmed, 6).map((a) => ({
      type: "airport",
      label: `${a.icao} · ${a.iata}`,
      sublabel: `${a.name} — ${a.city}, ${a.state}`,
      href: `/airport/${a.icao}`,
    }));

    const flightResult: SearchResult = {
      type: "flight",
      label: `Search flight "${trimmed.toUpperCase()}"`,
      sublabel: "Look for this callsign on the live map",
      href: `/?flight=${encodeURIComponent(trimmed.toUpperCase())}`,
    };

    return [...airportResults, flightResult];
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(result: SearchResult) {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2.5 shadow-glass backdrop-blur-md transition-colors focus-within:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-brand-500/60">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 flex-none text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) go(results[0]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search airport, city, or flight number"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {open && results.length > 0 && (
        <div className="glass-panel absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto py-2 scrollbar-thin">
          {results.map((r) => (
            <button
              key={r.href}
              onClick={() => go(r)}
              className="flex w-full flex-col items-start px-4 py-2 text-left transition-colors hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <span className="text-sm font-medium">{r.label}</span>
              {r.sublabel && (
                <span className="text-xs text-slate-400">{r.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
