"use client";

import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useMatchMedia } from "./useMatchMedia";

const COLOR_MODE_VALUE = ["system", "light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODE_VALUE)[number];
type ColorModeContextValue = {
  colorMode: ColorMode;
  setColorMode: (color: ColorMode) => void;
  actualColorMode: "light" | "dark";
};
const ColorModeContext = createContext<ColorModeContextValue>({
  colorMode: "system",
  setColorMode: () => null,
  actualColorMode: "light",
});

export function isColorModeValue(value: unknown): value is ColorMode {
  return COLOR_MODE_VALUE.includes(value as ColorMode);
}

export const ColorModeAppliedHtml: FC<{ children: ReactNode }> = ({ children }) => {
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>({
    storageKey: "stin-blog-color-mode",
    initialState: "system",
    isValidValue: isColorModeValue,
  });
  const preferColorSchemeIsDark = useMatchMedia("(prefers-color-scheme: dark)");

  const actualColorMode =
    colorMode === "system" ? (preferColorSchemeIsDark ? "dark" : "light") : colorMode;

  const value: ColorModeContextValue = useMemo(
    () => ({
      colorMode,
      setColorMode,
      actualColorMode,
    }),
    [actualColorMode, colorMode, setColorMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <html lang="ja" data-color-mode={actualColorMode}>
        {children}
      </html>
    </ColorModeContext.Provider>
  );
};

export function useColorMode() {
  return useContext(ColorModeContext);
}
