import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PremiumProvider } from "@/lib/premium";
import NavBar from "@/components/NavBar";
import AdSlot from "@/components/AdSlot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlightLen — Know what's happening in the sky",
    template: "%s | FlightLen",
  },
  description:
    "FlightLen is a live U.S. flight tracker and airport intelligence platform. See real-time aircraft, airport weather, runway conditions, and plain-English explanations in seconds.",
  metadataBase: new URL("https://flightlen.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeProvider>
          <PremiumProvider>
            <NavBar />
            <div className="flex min-h-0 flex-1 w-full mx-auto max-w-[1600px]">
              <AdSlot position="left" />
              <main className="flex-1 min-w-0 min-h-0">{children}</main>
              <AdSlot position="right" />
            </div>
          </PremiumProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
