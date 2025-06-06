import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        progressBarGlow: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "25%": { opacity: "0.7" }, // how intense to appear - higher value more intense
          "50%": { transform: "translateX(100%)", opacity: "0" },
          "75%": { opacity: "0.7" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        snakeBorderGreen: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #0ccd08, 0 0 10px 2px #0ccd08",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        snakeBorderGreen1s: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #0ccd08, 0 0 10px 2px #0ccd08",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        snakeBorderPink: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #d82206, 0 0 10px 2px #d82206",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        snakeBorderPink1s: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #d82206, 0 0 10px 2px #d82206",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        snakeBorderViolet: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #c74cd4, 0 0 10px 2px #c74cd4",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        snakeBorderHover: {
          "0%": {
            // boxShadow: "[inset] x-offset y-offset blur-radius spread-radius color"
            boxShadow: "inset 0 0 0 2px transparent",
            //             Top-left: `0 0`
            //             Top-right: `100% 0`
            //             Bottom-right: `100% 100%`
            //             Bottom-left: `0 100%`
            clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
          },
          "10%": {
            boxShadow: "inset 0 0 0 2px #ffffff, 0 0 10px 2px #ffffff",
            clipPath: "polygon(0 0, 30% 0, 0 0, 0 0)",
          },
          "20%": {
            clipPath: "polygon(0 0, 100% 0, 0 0, 0 0)",
          },
          "30%": {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          },
          "40%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
          },
          "50%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "60%": {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          },
          "70%": {
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
          },
          "80%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 0 100%)",
          },
          "90%": {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
          "100%": {
            boxShadow: "inset 0 0 0 2px transparent",
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
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
          "50%": { transform: "translateX(400px)" },
          "100%": { transform: "translateX(0)" },
        },
        "up-and-down": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-250px)" },
          "100%": { transform: "translateY(0)" },
        },
        "image-up-and-down-lg": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(250px)" },
          "100%": { transform: "translateY(0)" },
        },
        "image-up-and-down-sm": {
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
        progressBarGlow: "progressBarGlow 3s ease-in-out infinite",
        snakeBorderGreen: "snakeBorderGreen 3s ease-in-out forwards",
        snakeBorderPink: "snakeBorderPink 3s ease-in-out forwards",
        snakeBorderGreen1s: "snakeBorderGreen1s 1s ease-in-out infinite",
        snakeBorderPink1s: "snakeBorderPink1s 1s ease-in-out infinite",
        snakeBorderViolet: "snakeBorderViolet 1s ease-in-out infinite",
        snakeBorderHover: "snakeBorderHover 1.5s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
