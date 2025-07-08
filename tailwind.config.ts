import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border, 210, 16%, 82%))",
        input: "hsl(var(--input, 210, 16%, 82%))",
        ring: "hsl(var(--ring, 210, 16%, 82%))",
        background: "hsl(var(--background, 210, 20%, 98%))",
        foreground: "hsl(var(--foreground, 222, 47%, 11%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 172, 67%, 50%))",
          foreground: "hsl(var(--primary-foreground, 0, 0%, 100%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210, 40%, 96%))",
          foreground: "hsl(var(--secondary-foreground, 222, 47%, 11%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0, 84%, 60%))",
          foreground: "hsl(var(--destructive-foreground, 0, 0%, 100%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210, 16%, 92%))",
          foreground: "hsl(var(--muted-foreground, 215, 20%, 50%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 204, 94%, 94%))",
          foreground: "hsl(var(--accent-foreground, 201, 96%, 32%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0, 0%, 100%))",
          foreground: "hsl(var(--popover-foreground, 222, 47%, 11%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0, 0%, 100%))",
          foreground: "hsl(var(--card-foreground, 222, 47%, 11%))",
        },
        upload: {
          border: "hsl(var(--upload-border, 210, 16%, 82%))",
          bg: "hsl(var(--upload-bg, 210, 40%, 96%))",
          hover: "hsl(var(--upload-hover, 172, 67%, 90%))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
