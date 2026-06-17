/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf8ec",
          100: "#faefc9",
          200: "#f4de8f",
          300: "#edc955",
          400: "#e9b44c",
          500: "#d99c1f",
          600: "#bb7b16",
          700: "#965a15",
          800: "#7c4919",
          900: "#693d18",
        },
        dark: {
          50: "#f5f5f7",
          100: "#e5e5ea",
          200: "#c8c8d1",
          300: "#a1a1b0",
          400: "#757589",
          500: "#55556b",
          600: "#3d3d52",
          700: "#2d2d40",
          800: "#1f1f30",
          900: "#1a1a2e",
          950: "#0f0f1a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Noto Serif SC'", "serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
