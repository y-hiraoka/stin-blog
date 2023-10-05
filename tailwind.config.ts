import { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const tailwindconfig: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", 'html[data-color-mode="dark"]'],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      main: {
        50: "#faf5ff",
        100: "#e9d8fd",
        200: "#d6bcfa",
        300: "#b794f4",
        400: "#9f7aea",
        500: "#805ad5",
        600: "#6b46c1",
        700: "#553c9a",
        800: "#44337a",
        900: "#322659",
      },
      gray: {
        50: "#f7fafc",
        100: "#edf2f7",
        200: "#e2e8f0",
        300: "#cbd5e0",
        400: "#a0aec0",
        500: "#718096",
        600: "#4a5568",
        700: "#2d3748",
        800: "#1a202c",
        900: "#171923",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Noto Sans JP'", "var(--font-noto)", ...defaultTheme.fontFamily.sans],
      },
      textColor: ({ theme }) => ({
        DEFAULT: theme("colors.gray.800"),
        dark: theme("colors.gray.100"),
        sub: theme("colors.gray.500"),
        "sub-dark": theme("colors.gray.400"),
        link: "#3182ce",
        "link-visited": "#805ad5",
      }),
      backgroundColor: {
        DEFAULT: "#ffffff",
        dark: "#1c1c1c",
      },
    },
  },
  plugins: [],
};

export default tailwindconfig;
