import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        surface: "#FAFAFA",
        orange: "#F97316",
        success: "#4CAF81",
        danger: "#E05252"
      },
      boxShadow: {
        subtle: "0 1px 2px rgb(10 10 10 / 0.06), 0 10px 24px rgb(10 10 10 / 0.04)"
      }
    }
  },
  plugins: [forms]
};

export default config;
