import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sky: {
          950: "#050b18",
        },
        flight: {
          blue: "#1e3a8a",
          accent: "#2563eb",
          night: "#0b1220",
        },
        brand: {
          50: "#eef3ff",
          100: "#dce7ff",
          200: "#b9d0ff",
          300: "#8ab0ff",
          400: "#5b8aff",
          500: "#3366ff",
          600: "#234fe0",
          700: "#1c3fb4",
          800: "#16338f",
          900: "#142b70",
          950: "#0b1a4a",
        },
        glow: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #3366ff 0%, #6366f1 55%, #22d3ee 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(51,102,255,0.15) 0%, rgba(99,102,241,0.12) 55%, rgba(34,211,238,0.12) 100%)",
        "glass-sheen":
          "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)",
      },
      boxShadow: {
        panel: "0 8px 30px rgba(0,0,0,0.12)",
        glass: "0 8px 32px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.4)",
        "glass-dark": "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        glow: "0 0 0 1px rgba(51,102,255,0.15), 0 8px 24px rgba(51,102,255,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
