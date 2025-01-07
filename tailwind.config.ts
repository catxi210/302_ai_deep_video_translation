import containerQueries from "@tailwindcss/container-queries";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
// @ts-expect-error tw motion
import motion from "tailwindcss-motion";
import type { PluginAPI } from "tailwindcss/types/config";

// Enhanced scrollbar style with theme integration and cross-browser support
const scrollbar = ({ addBase, theme }: PluginAPI) => {
  addBase({
    "*": {
      // Firefox scrollbar styles
      scrollbarWidth: "thin",
      scrollbarColor: `${theme("colors.muted.DEFAULT", "#e5e7eb")} ${theme("colors.background", "#ffffff")}`,
    },
    // Webkit scrollbar styles
    "::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      backgroundColor: theme("colors.muted.DEFAULT", "#e5e7eb"),
      borderRadius: "9999px",
      transition: "background-color 150ms ease",
      "&:hover": {
        backgroundColor: theme("colors.muted.foreground", "#6b7280"),
      },
    },
    // Dark mode styles
    ".dark *": {
      scrollbarColor: `${theme("colors.muted.DEFAULT", "#374151")} transparent`,
    },
    ".dark ::-webkit-scrollbar-thumb": {
      backgroundColor: theme("colors.muted.DEFAULT", "#374151"),
      "&:hover": {
        backgroundColor: theme("colors.muted.foreground", "#9ca3af"),
      },
    },
  });
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pageBackground: "hsl(var(--page-background))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate, typography, scrollbar, motion, containerQueries],
};
export default config;
