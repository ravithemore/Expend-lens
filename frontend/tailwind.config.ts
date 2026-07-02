import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fc",
        surface: "#ffffff",
        "surface-container-low": "#f1f3f9",
        "surface-container": "#eef1f6",
        "surface-container-high": "#e4e8f1",
        "surface-container-highest": "#dbe0ea",
        primary: "#6d5ef9",
        "primary-container": "#ece9ff",
        secondary: "#4b6a4f",
        "secondary-container": "#c6e9c7",
        error: "#ba1a1a",
        outline: "#79747e",
        "outline-variant": "#e1e3e9",
        "on-surface": "#1a1a1a",
        "on-surface-variant": "#5a5a5a",
        "on-primary": "#ffffff",
        "on-primary-container": "#6d5ef9",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#4b6a4f",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
      },
      spacing: {
        base: "8px",
        "stack-sm": "12px",
        gutter: "16px",
        "stack-md": "24px",
        "stack-lg": "48px",
        "container-padding-mobile": "20px",
        "container-padding-desktop": "40px",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        display: ["Geist", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
