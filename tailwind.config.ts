import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1628",
          900: "#0A1628",
          800: "#13213A",
          700: "#1C2E4C",
        },
        brand: {
          blue: "#2563EB",
          accent: "#2563EB",
        },
        surface: "#F8F9FA",
      },
      fontFamily: {
        sans: ["Tajawal", "Cairo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(10, 22, 40, 0.06), 0 4px 12px rgba(10, 22, 40, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
