/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #399746, #A6CD3D)",
      },
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
      },
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
        "green-brand": "#3aaa49",
        "green-deep": "#399746",
        "lime-brand": "#a8d63e",
        "dark-base": "#060806",
        "dark-surface": "#0a0c0a",
        "dark-elevated": {
          50:  "#f2f5f2",
          100: "#d6ddd6",
          200: "#b3bfb3",
          300: "#8f9f8f",
          400: "#6b7f6b",
          500: "#4a5f4a",
          600: "#344734",
          700: "#223122",
          800: "#141f14",
          850: "#0f170f",
          900: "#0a0e0a", // your base
          950: "#050705",
        },
        "light-base": "#fafaf8",
        "light-surface": "#f0ede7",
        "light-muted": "#f3f1ec",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "orb-float": {
          "from": { transform: "translate(0, 0) scale(1)" },
          "to": { transform: "translate(40px, -30px) scale(1.15)" },
        },
        "hero-zoom": {
          "from": { transform: "scale(1.08)" },
          "to": { transform: "scale(1)" },
        },
        "hero-rise": {
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "ticker": {
          "from": { transform: "translateX(0)" },
          "to": { transform: "translateX(-50%)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(8px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
        "spin": {
          "to": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "orb-float-slow": "orb-float 18s ease-in-out infinite alternate",
        "orb-float-slower": "orb-float 22s ease-in-out infinite alternate-reverse",
        "hero-zoom": "hero-zoom 20s ease-out forwards",
        "hero-rise-1": "hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s forwards",
        "hero-rise-2": "hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.30s forwards",
        "hero-rise-3": "hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.45s forwards",
        "hero-rise-4": "hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.60s forwards",
        "hero-rise-5": "hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.75s forwards",
        "ticker": "ticker 30s linear infinite",
        "gradient-shift": "gradient-shift 4s ease-in-out infinite",
        "scroll-bounce": "scroll-bounce 2.5s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
