"use client";

import { usePremium } from "@/lib/premium";

interface AdSlotProps {
  position: "left" | "right" | "inline";
}

/**
 * Reserved ad space. Premium users (isPremium === true) get the slot
 * collapsed entirely for a clean, ad-free layout — no separate "premium
 * build" needed, just flip the flag once billing exists.
 *
 * Drop your real AdSense <script>/<ins> tags where the placeholder div is,
 * gated behind NEXT_PUBLIC_ADSENSE_CLIENT_ID.
 */
export default function AdSlot({ position }: AdSlotProps) {
  const { isPremium } = usePremium();
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (isPremium) return null;
  if (position === "inline") {
    return (
      <div className="ad-rail glass-panel my-4 flex h-24 items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {adsenseClientId ? "Ad" : "Ad space — AdSense not configured"}
      </div>
    );
  }

  return (
    <aside
      className={`ad-rail hidden xl:flex flex-col items-center justify-start gap-2 px-2 py-4 ${
        position === "left" ? "order-first" : "order-last"
      }`}
      aria-label="Advertisement"
    >
      <div className="glass-panel flex h-[600px] w-full items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {adsenseClientId ? "Ad" : "Ad space"}
      </div>
    </aside>
  );
}
