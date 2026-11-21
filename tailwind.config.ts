import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "20px", md: "32px", lg: "40px" },
      screens: { lg: "1200px" },
    },
    extend: {
      colors: {
        paper: "#080f1c",
        surface: "#101b2d",
        sunken: "#0c1524",
        mist: "#29354a",
        silver: "#8394ac",
        slate: "#b0bdd1",
        navy: "#edf3fc",
        signal: "#6496ff",
        "signal-tint": "#172b50",
        danger: "#ff9c9c",
        success: "#80d8b3",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
} satisfies Config;
