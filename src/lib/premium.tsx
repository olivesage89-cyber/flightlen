"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PremiumContextValue {
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  setIsPremium: () => {},
});

const STORAGE_KEY = "flightlen_premium_demo";

/**
 * Stub premium flag so the rest of the app (ad slots, future gated
 * features) can be written against a real on/off switch today.
 * Wire this up to Supabase `profiles.is_premium` + Stripe/billing once
 * the premium tier ships — nothing else in the app needs to change.
 */
export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremiumState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setIsPremiumState(true);
  }, []);

  const setIsPremium = (value: boolean) => {
    setIsPremiumState(value);
    window.localStorage.setItem(STORAGE_KEY, String(value));
  };

  const value = useMemo(() => ({ isPremium, setIsPremium }), [isPremium]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  return useContext(PremiumContext);
}
