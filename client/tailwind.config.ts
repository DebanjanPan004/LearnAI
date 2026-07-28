import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Vellum Palette ---
        ink:        "#10231c",
        "ink-deep": "#0a1712",
        leather:    "#1f4536",
        "leather-dark": "#163327",
        brass:      "#c9a227",
        "brass-light": "#e7c766",
        oxblood:    "#6b1f2a",
        "oxblood-dark": "#4a151d",
        parchment:  "#f2e8d5",
        "parchment-dim": "#e6d9bd",
        "parchment-shadow": "#d9c8a0",
        "ink-text": "#241a10",
        // legacy aliases (keep for any non-updated components)
        paper:    "#f2e8d5",
        brand:    "#6b1f2a",
        mint:     "#1f4536",
        coral:    "#c9a227",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body:    ["Source Serif 4", "Georgia", "serif"],
        mono:    ["IBM Plex Mono", "Courier New", "monospace"],
        sans:    ["Source Serif 4", "Georgia", "serif"],
      },
      boxShadow: {
        soft:      "0 12px 30px rgba(10,23,18,0.25)",
        parchment: "0 50px 90px -25px rgba(0,0,0,.6), 0 0 0 1px rgba(201,162,39,.3)",
        brass:     "0 0 0 1px rgba(201,162,39,.45)",
      },
      backgroundImage: {
        stage:   "radial-gradient(ellipse 120% 90% at 50% 15%, #1a3d2e 0%, #10231c 55%, #0a1712 100%)",
        leather: "linear-gradient(160deg, #1f4536 0%, #163327 100%)",
        parchment: "linear-gradient(160deg, #f2e8d5 0%, #e6d9bd 100%)",
        oxblood:  "linear-gradient(160deg, #6b1f2a 0%, #4a151d 100%)",
      }
    }
  },
  plugins: []
} satisfies Config;

