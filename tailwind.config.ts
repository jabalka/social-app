import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        google: {
          "text-gray": "#3c4043",
          "button-blue": "#1a73e8",
          "button-blue-hover": "#5195ee",
          "button-dark": "#202124",
          "button-dark-hover": "#555658",
          "button-border-light": "#dadce0",
          "logo-blue": "#4285f4",
          "logo-green": "#34a853",
          "logo-yellow": "#fbbc05",
          "logo-red": "#ea4335",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        rippleEffect: {
          "0%": { transform: "scale(0)", opacity: "0.75" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        tiltZoom: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "10%": { transform: "scale(1.2) rotate(-3deg)" },
          "20%": { transform: "scale(1.2) rotate(3deg)" },
          "30%": { transform: "scale(1.2) rotate(-3deg)" },
          "40%": { transform: "scale(1.2) rotate(3deg)" },
          "50%": { transform: "scale(1.2) rotate(-3deg)" },
          "60%": { transform: "scale(1.2) rotate(3deg)" },
          "70%": { transform: "scale(1.2) rotate(-3deg)" },
          "80%": { transform: "scale(1.2) rotate(3deg)" },
          "90%": { transform: "scale(1.2) rotate(-3deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "left-to-right": {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(400px)" }, // how much to move to right
          "100%": { transform: "translateX(0)" },
        },
        "up-and-down": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-250px)" }, // how much to move up
          "100%": { transform: "translateY(0)" },
        },

        "image-up-and-down-lg": {
          // for larger window screens
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(250px)" },
          "100%": { transform: "translateY(0)" },
        },
        "image-up-and-down-sm": {
          // when windows screen is smaller
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(100px)" },
          "100%": { transform: "translateY(0)" },
        },
        wave: {
          "0%": {
            transform: "scale(1)",
            opacity: "0.35",
          },
          "50%": {
            opacity: "0.15",
          },
          "100%": {
            transform: "scale(2.5)",
            opacity: "0",
          },
        },
      },
      animation: {
        rippleEffect: "rippleEffect 600ms linear",
        tiltZoom: "tiltZoom 1.2s ease-in-out infinite",
        "left-to-right": "left-to-right 15s ease-in-out infinite",
        "up-and-down": "up-and-down 15s ease-in-out infinite",
        "image-up-and-down-lg": "image-up-and-down-lg 15s ease-in-out infinite",
        "image-up-and-down-sm": "image-up-and-down-sm 5s ease-in-out infinite",
        wave: "wave 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
