import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f8fb",
        brand: "#2563eb",
        mint: "#16a085",
        coral: "#f9735b"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

