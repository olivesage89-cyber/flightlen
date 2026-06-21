import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Live U.S. Flight Map",
  description:
    "Watch live aircraft over the United States in real time. Click any plane to see where it came from, where it's going, and when it lands — explained in plain English.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-64px)] w-full animate-pulse-glow bg-brand-gradient-soft" />}>
      <HomeClient />
    </Suspense>
  );
}
