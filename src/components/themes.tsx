import React from "react";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "__initial_theme_state";
const getTheme = (): Theme =>
  (localStorage.getItem(THEME_STORAGE_KEY) ?? "light") as Theme;
const saveTheme = (theme: Theme) => localStorage.setItem(THEME_STORAGE_KEY, theme);

const useTheme = () => {
  const [theme, setTheme] = React.useState<Theme>("light");

  useIsomorphicLayoutEffect(() => {
    setTheme(getTheme());
  }, []);

  useIsomorphicLayoutEffect(() => {
    saveTheme(theme);

    switch (theme) {
      case "light": {
        document.documentElement.style.setProperty("--theme-color1", "#D39BF0");
        document.documentElement.style.setProperty("--theme-color2", "#D7F084");
        document.documentElement.style.setProperty("--theme-color3", "#F0CCB4");
        document.documentElement.style.setProperty("--theme-color4", "#90EAF0");
        document.documentElement.style.setProperty("--theme-color5", "#CC84F0");
        document.documentElement.style.setProperty("--theme-background", "#fefefe");
        document.documentElement.style.setProperty("--theme-font", "#121212");
        break;
      }
      case "dark": {
        document.documentElement.style.setProperty("--theme-color1", "#D39BF0");
        document.documentElement.style.setProperty("--theme-color2", "#D7F084");
        document.documentElement.style.setProperty("--theme-color3", "#F0CCB4");
        document.documentElement.style.setProperty("--theme-color4", "#90EAF0");
        document.documentElement.style.setProperty("--theme-color5", "#CC84F0");
        document.documentElement.style.setProperty("--theme-background", "#fefefe");
        document.documentElement.style.setProperty("--theme-font", "#fefefe");
        break;
      }
    }
  }, [theme]);

  return [theme, setTheme] as const;
};

const themeContext = React.createContext<ReturnType<typeof useTheme>>([
  "light",
  () => {},
]);

export const ThemeProvider: React.FC = props => {
  const setTheme = useTheme();

  return <themeContext.Provider value={setTheme}>{props.children}</themeContext.Provider>;
};

export const useThemeState = () => React.useContext(themeContext);
