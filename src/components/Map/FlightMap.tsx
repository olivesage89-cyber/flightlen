"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MaplibreMap, Marker } from "maplibre-gl";
import { useTheme } from "@/components/ThemeProvider";
import { getBasemapStyle } from "@/lib/mapStyle";
import type { Aircraft, Airport } from "@/lib/types";

export interface AirportPin {
  airport: Airport;
  variant?: "primary" | "muted";
}

interface FlightMapProps {
  aircraft: Aircraft[];
  selectedIcao24?: string | null;
  onSelectAircraft?: (aircraft: Aircraft) => void;
  center?: [number, number]; // [lon, lat]
  zoom?: number;
  airportPins?: AirportPin[];
  maxAircraftRendered?: number;
  className?: string;
}

function planeMarkerEl(heading: number, isSelected: boolean): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "flightline-aircraft-marker";
  el.style.width = "26px";
  el.style.height = "26px";
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";

  const size = isSelected ? 28 : 20;
  const color = isSelected ? "#f97316" : "#3366ff";
  const glow = isSelected
    ? "drop-shadow(0 0 7px rgba(249,115,22,0.75)) drop-shadow(0 1px 2px rgba(15,23,42,0.4))"
    : "drop-shadow(0 1px 2px rgba(15,23,42,0.35))";

  el.innerHTML = `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" style="transform: rotate(${heading}deg); transition: transform 0.4s linear, filter 0.2s ease, width 0.2s ease, height 0.2s ease; filter: ${glow};" fill="${color}" stroke="white" stroke-width="0.6">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 2v1.5l4-1 4 1V21l-2.5-2v-5.5l8 2.5z" />
    </svg>
  `;
  return el;
}

function airportMarkerEl(variant: "primary" | "muted" = "muted"): HTMLDivElement {
  const el = document.createElement("div");
  if (variant === "primary") {
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.background = "linear-gradient(135deg, #3366ff, #22d3ee)";
    el.style.border = "3px solid white";
    el.style.boxShadow =
      "0 0 0 4px rgba(51,102,255,0.22), 0 2px 8px rgba(15,23,42,0.35)";
  } else {
    el.style.width = "8px";
    el.style.height = "8px";
    el.style.borderRadius = "50%";
    el.style.background = "#94a3b8";
    el.style.border = "2px solid white";
    el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.25)";
  }
  return el;
}

const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283]; // center of contiguous US
const DEFAULT_ZOOM = 4;

export default function FlightMap({
  aircraft,
  selectedIcao24,
  onSelectAircraft,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  airportPins = [],
  maxAircraftRendered = 700,
  className = "",
}: FlightMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const airportMarkersRef = useRef<Marker[]>([]);
  // Always holds the latest aircraft data per icao24, so click handlers
  // (attached once, when a marker is first created) read fresh telemetry
  // instead of a stale snapshot from whenever the marker happened to be
  // created.
  const aircraftByIdRef = useRef<Map<string, Aircraft>>(new Map());
  const onSelectRef = useRef(onSelectAircraft);
  onSelectRef.current = onSelectAircraft;
  const { theme } = useTheme();

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getBasemapStyle(theme),
      center,
      zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap style when day/night theme changes.
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getBasemapStyle(theme));
  }, [theme]);

  // Recenter when `center`/`zoom` props change (e.g. navigating to a new airport page).
  useEffect(() => {
    mapRef.current?.easeTo({ center, zoom, duration: 800 });
  }, [center, zoom]);

  // Render static airport pins.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    airportMarkersRef.current.forEach((m) => m.remove());
    airportMarkersRef.current = airportPins.map(({ airport, variant }) => {
      const marker = new maplibregl.Marker({ element: airportMarkerEl(variant) })
        .setLngLat([airport.lon, airport.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, closeButton: false }).setText(
            `${airport.icao} — ${airport.name}`
          )
        )
        .addTo(map);
      return marker;
    });

    return () => {
      airportMarkersRef.current.forEach((m) => m.remove());
    };
  }, [airportPins]);

  // Sync aircraft markers efficiently: update positions in place, add/remove as needed.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const visible = aircraft
      .filter((a) => a.lat != null && a.lon != null)
      .slice(0, maxAircraftRendered);
    const visibleIds = new Set(visible.map((a) => a.icao24));

    aircraftByIdRef.current = new Map(visible.map((a) => [a.icao24, a]));

    // Remove markers for aircraft no longer in view.
    for (const [id, marker] of markersRef.current.entries()) {
      if (!visibleIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    for (const a of visible) {
      const isSelected = a.icao24 === selectedIcao24;
      const existing = markersRef.current.get(a.icao24);

      if (existing) {
        existing.setLngLat([a.lon as number, a.lat as number]);
        const el = existing.getElement();
        el.innerHTML = planeMarkerEl(a.headingDeg ?? 0, isSelected).innerHTML;
      } else {
        const el = planeMarkerEl(a.headingDeg ?? 0, isSelected);
        const id = a.icao24;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current?.(aircraftByIdRef.current.get(id) ?? a);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([a.lon as number, a.lat as number])
          .addTo(map);
        markersRef.current.set(a.icao24, marker);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraft, selectedIcao24, maxAircraftRendered]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      role="application"
      aria-label="Live aircraft map"
    />
  );
}
