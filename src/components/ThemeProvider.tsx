"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isNightAt } from "@/lib/sunPosition";

export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "auto",
  theme: "light",
  setMode: () => {},
});

const STORAGE_KEY = "flightline_theme_mode";

/**
 * Resolves "auto" using, in priority order:
 *  1. The user's real location (if geolocation permission is granted) and
 *     the actual sun position there — this is what gives the Apple Maps-
 *     style "is it actually dark outside right now" feel.
 *  2. The OS-level prefers-color-scheme media query, as a fallback when
 *     location isn't available.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [locationTheme, setLocationTheme] = useState<ResolvedTheme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark" || stored === "auto") {
      setModeState(stored);
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mq.matches);
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", listener);

    let geoWatchId: number | null = null;
    if (navigator.geolocation) {
      const updateFromPosition = (pos: GeolocationPosition) => {
        const night = isNightAt(pos.coords.latitude, pos.coords.longitude);
        setLocationTheme(night ? "dark" : "light");
      };
      navigator.geolocation.getCurrentPosition(updateFromPosition, () => {
        setLocationTheme(null);
      });
      // Re-check every 15 minutes in case day turns to night during a long visit.
      geoWatchId = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(updateFromPosition, () => {});
      }, 15 * 60 * 1000);
    }

    return () => {
      mq.removeEventListener("change", listener);
      if (geoWatchId != null) window.clearInterval(geoWatchId);
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const theme: ResolvedTheme = useMemo(() => {
    if (mode !== "auto") return mode;
    if (locationTheme) return locationTheme;
    return systemPrefersDark ? "dark" : "light";
  }, [mode, locationTheme, systemPrefersDark]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo(() => ({ mode, theme, setMode }), [mode, theme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
