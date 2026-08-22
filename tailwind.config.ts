import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DC2626", // Rojo del logo
          dark: "#B91C1C",
          light: "#EF4444",
        },
        dark: {
          DEFAULT: "#0B0B0C", // Negro de showroom, más profundo que el gris
          lighter: "#141416",
          card: "#1A1A1D",
          line: "#26262B", // Reglas y separadores
        },
        field: {
          DEFAULT: "#22C55E", // Verde césped
          dark: "#16A34A",
        },
        chalk: "#E8E6E1", // Blanco tiza de la línea de cal
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        lift: "0 18px 40px -18px rgba(0, 0, 0, 0.85)",
        "lift-red": "0 18px 40px -20px rgba(220, 38, 38, 0.55)",
      },
      backgroundImage: {
        // Trama sutil de cancha para las bandas oscuras
        pitch:
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 7px)",
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
