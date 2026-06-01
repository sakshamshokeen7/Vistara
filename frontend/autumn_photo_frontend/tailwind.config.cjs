module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-page": "#0a0a0a",
        "dark-surface": "#111111",
        "dark-border": "rgba(255, 255, 255, 0.07)",
        "dark-border-focus": "rgba(59, 130, 246, 0.45)",
        "accent-soft-bg": "rgba(59, 130, 246, 0.10)",
      },
      fontFamily: {
        serif: ["Instrument Serif", "serif"],
        sans: ["Geist", "sans-serif"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.2" }],
        h2: ["32px", { lineHeight: "1.2" }],
        body: ["13px", { lineHeight: "1.6" }],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cardIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.45s ease",
        cardIn: "cardIn 0.45s cubic-bezier(.22,.68,0,1.2)",
      },
    },
  },
};
