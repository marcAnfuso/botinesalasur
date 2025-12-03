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
          DEFAULT: "#111111",
          lighter: "#1a1a1a",
          card: "#222222",
        },
        field: {
          DEFAULT: "#22C55E", // Verde césped
          dark: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
