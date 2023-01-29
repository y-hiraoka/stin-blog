import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "./constant";

const quadruplePx = (base: number) => `${base * 4}px` as const;

export const tokens = createGlobalTheme(":root", {
  spacing: {
    1: quadruplePx(1),
    2: quadruplePx(2),
    3: quadruplePx(3),
    4: quadruplePx(4),
    5: quadruplePx(5),
    6: quadruplePx(6),
    7: quadruplePx(7),
    8: quadruplePx(8),
    9: quadruplePx(9),
    10: quadruplePx(10),
    11: quadruplePx(11),
    12: quadruplePx(12),
    14: quadruplePx(14),
    16: quadruplePx(16),
    18: quadruplePx(18),
    20: quadruplePx(20),
    24: quadruplePx(24),
    32: quadruplePx(32),
    40: quadruplePx(40),
  },
  sizes: {
    1: quadruplePx(1),
    2: quadruplePx(2),
    3: quadruplePx(3),
    4: quadruplePx(4),
    5: quadruplePx(5),
    6: quadruplePx(6),
    7: quadruplePx(7),
    8: quadruplePx(8),
    9: quadruplePx(9),
    10: quadruplePx(10),
    11: quadruplePx(11),
    12: quadruplePx(12),
    14: quadruplePx(14),
    16: quadruplePx(16),
    18: quadruplePx(18),
    20: quadruplePx(20),
    24: quadruplePx(24),
    32: quadruplePx(32),
    36: quadruplePx(36),
    40: quadruplePx(40),
    48: quadruplePx(48),
    60: quadruplePx(60),
    64: quadruplePx(64),
    72: quadruplePx(72),
    80: quadruplePx(80),
    90: quadruplePx(90),
    100: quadruplePx(100),
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.75rem",
    "4xl": "2rem",
    "5xl": "2.5rem",
  },
  radius: {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "10px",
    max: "9999px",
  },
  borders: {
    1: "1px solid",
    2: "2px solid",
    4: "4px solid",
    8: "8px solid",
  },
  shadows: {
    xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    none: "none",
    "dark-lg":
      "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px",
  },
  focusRingShadow: {
    before: "",
    after: "",
  },
  colors: {
    whiteAlpha: {
      50: "rgba(255, 255, 255, 0.04)",
      100: "rgba(255, 255, 255, 0.06)",
      200: "rgba(255, 255, 255, 0.08)",
      300: "rgba(255, 255, 255, 0.16)",
      400: "rgba(255, 255, 255, 0.24)",
      500: "rgba(255, 255, 255, 0.36)",
      600: "rgba(255, 255, 255, 0.48)",
      700: "rgba(255, 255, 255, 0.64)",
      800: "rgba(255, 255, 255, 0.8)",
      900: "rgba(255, 255, 255, 0.92)",
    },
    blackAlpha: {
      50: "rgba(0, 0, 0, 0.04)",
      100: "rgba(0, 0, 0, 0.06)",
      200: "rgba(0, 0, 0, 0.08)",
      300: "rgba(0, 0, 0, 0.16)",
      400: "rgba(0, 0, 0, 0.24)",
      500: "rgba(0, 0, 0, 0.36)",
      600: "rgba(0, 0, 0, 0.48)",
      700: "rgba(0, 0, 0, 0.64)",
      800: "rgba(0, 0, 0, 0.8)",
      900: "rgba(0, 0, 0, 0.92)",
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
    facebook: {
      50: "#e8f4f9",
      100: "#d9dee9",
      200: "#b7c2da",
      300: "#6482c0",
      400: "#4267b2",
      500: "#385898",
      600: "#314e89",
      700: "#29487d",
      800: "#223b67",
      900: "#1e355b",
    },
    twitter: {
      50: "#e5f4fd",
      100: "#c8e9fb",
      200: "#a8dcfa",
      300: "#83cdf7",
      400: "#57bbf5",
      500: "#1da1f2",
      600: "#1a94da",
      700: "#1681bf",
      800: "#136b9e",
      900: "#0d4d71",
    },
    primary: {
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
    text: {
      primary: "",
      secondary: "",
      link: "",
      linkVisited: "",
    },
    background: "white",
  },
  containerMaxWidth: "1024px",
  fontFamilies: {
    heading: `-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
    mono: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
  },
});

createGlobalTheme(":root", tokens.colors.text, {
  primary: "#474B4B",
  secondary: tokens.colors.blackAlpha[600],
  link: "#3182ce",
  linkVisited: "#805AD5",
});

createGlobalTheme(DARK_MODE_SELECTOR, tokens.colors.text, {
  primary: "#E8EAEA",
  secondary: tokens.colors.whiteAlpha[700],
  link: "#4299e1",
  linkVisited: "#B794F4",
});

globalStyle(DARK_MODE_SELECTOR, {
  vars: {
    [tokens.colors.background]: "#1C1C1C",
  },
});

createGlobalTheme(":root", tokens.focusRingShadow, {
  before: `0 0 0 0 transparent`,
  after: `0 0 0 3px ${tokens.colors.primary[300]}`,
});