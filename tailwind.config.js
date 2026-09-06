/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D0F12",
        panel: "#14171B",
        panel2: "#1A1E23",
        border: "#262B31",
        borderLight: "#31373F",
        text: "#E8EAED",
        muted: "#8B92A0",
        dim: "#5B6270",
        accent: "#4F9DFF",
        accentDim: "#2C4A73",
        good: "#3DD68C",
        bad: "#E5484D",
        warn: "#E5A94F",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": "0.6875rem",
      },
    },
  },
  plugins: [],
};
