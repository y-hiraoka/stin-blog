import { createContext, FC, ReactNode, useCallback, useContext, useMemo } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import { useColorMode as useChakraColorMode } from "@chakra-ui/react";

const COLOR_MODE_VALUE = ["light", "dark"] as const;
export type ColorMode = typeof COLOR_MODE_VALUE[number];
type ColorModeContextValue = {
  colorMode: ColorMode;
  setColorMode: (color: ColorMode) => void;
  toggleColorMode: () => void;
};
const ColorModeContext = createContext<ColorModeContextValue>({
  colorMode: "light",
  setColorMode: () => null,
  toggleColorMode: () => null,
});

export const ColorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    colorMode: chakraColorMode,
    setColorMode: setChakraColorMode,
    toggleColorMode: toggleChakraColorMode,
  } = useChakraColorMode(); // 移行期間のみ chakra の colorMode を参照する

  // const [appColorMode, setColorMode] = useLocalStorage<ColorMode>({
  //   storageKey: "stin-blog-color-mode",
  //   initialState: "light",
  //   isValidValue: (value: unknown): value is ColorMode =>
  //     COLOR_MODE_VALUE.includes(value as any),
  // });
  // const preferColorSchemeIsDark = useMatchMedia("(prefers-color-scheme: dark)");
  // const toggleColorMode = useCallback(
  //   () => (appColorMode === "dark" ? setColorMode("light") : setColorMode("dark")),
  //   [appColorMode, setColorMode],
  // );

  // const colorMode = preferColorSchemeIsDark ? "dark" : appColorMode;

  const value: ColorModeContextValue = useMemo(
    () => ({
      colorMode: chakraColorMode,
      setColorMode: setChakraColorMode,
      toggleColorMode: toggleChakraColorMode,
    }),
    [chakraColorMode, setChakraColorMode, toggleChakraColorMode],
  );

  useIsomorphicLayoutEffect(() => {
    document.querySelector("html")?.setAttribute("data-color-mode", chakraColorMode);
  }, [chakraColorMode]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function useColorModeValue<T>(valueOnLight: T, valueOnDark: T): T {
  const { colorMode } = useColorMode();

  switch (colorMode) {
    case "light":
      return valueOnLight;
    case "dark":
      return valueOnDark;
  }
}
