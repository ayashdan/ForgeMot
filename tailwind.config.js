/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Teko", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // BayRan's accent: a construction-amber, used for buttons, links,
        // active states, and highlights throughout the app.
        brand: {
          DEFAULT: "#d97706",
          soft: "#f59e0b",
        },
        // Semantic surface tokens, driven by CSS variables so light/dark mode
        // is a class toggle rather than sprinkling dark: everywhere.
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
