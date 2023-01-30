const breakpoints = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
  "2xl": "96em",
} as const;

type Breakpoint = keyof typeof breakpoints;

export const mediaQueries = {
  largerThan: (point: Breakpoint) => `(min-width: ${breakpoints[point]})`,
  smallerThan: (point: Breakpoint) => `(max-width: ${breakpoints[point]})`,
  isDark: "(prefers-color-scheme: dark)",
} as const;
