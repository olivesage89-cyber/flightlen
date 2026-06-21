import type { StyleSpecification } from "maplibre-gl";
import type { ResolvedTheme } from "@/components/ThemeProvider";

const CARTO_SUBDOMAINS = ["a", "b", "c", "d"];

function cartoTiles(variant: "light_all" | "dark_all") {
  return CARTO_SUBDOMAINS.map(
    (s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`
  );
}

function mapboxTiles(styleId: "streets-v12" | "dark-v11", token: string) {
  return [
    `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`,
  ];
}

/**
 * Builds a MapLibre raster style for the current theme. Uses free CARTO
 * basemaps (no key) by default; switches to Mapbox raster tiles
 * automatically if NEXT_PUBLIC_MAPBOX_TOKEN is set.
 */
export function getBasemapStyle(theme: ResolvedTheme): StyleSpecification {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const tiles = mapboxToken
    ? mapboxTiles(theme === "dark" ? "dark-v11" : "streets-v12", mapboxToken)
    : cartoTiles(theme === "dark" ? "dark_all" : "light_all");

  const attribution = mapboxToken
    ? "© Mapbox © OpenStreetMap"
    : "© OpenStreetMap contributors © CARTO";

  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution,
      },
    },
    layers: [
      {
        id: "basemap",
        type: "raster",
        source: "basemap",
      },
    ],
  };
}
