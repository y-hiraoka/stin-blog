import React from "react";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

type Theme = "main" | "light";

const THEME_STORAGE_KEY = "__initial_theme_state";
const getTheme = (): Theme =>
  (localStorage.getItem(THEME_STORAGE_KEY) ?? "main") as Theme;
const saveTheme = (theme: Theme) => localStorage.setItem(THEME_STORAGE_KEY, theme);

const useTheme = () => {
  const [theme, setTheme] = React.useState<Theme>("main");

  useIsomorphicLayoutEffect(() => {
    setTheme(getTheme());
  }, []);

  useIsomorphicLayoutEffect(() => {
    saveTheme(theme);

    switch (theme) {
      case "main": {
        document.documentElement.style.setProperty("--theme-primary", "#F2F2F2");
        document.documentElement.style.setProperty("--theme-secondary", "#777777");
        document.documentElement.style.setProperty("--theme-background", "#1C1C1C");
        document.documentElement.style.setProperty("--theme-accent", "#A47ED8");
        break;
      }
      case "light": {
        document.documentElement.style.setProperty("--theme-primary", "#1C1C1C");
        document.documentElement.style.setProperty("--theme-secondary", "#777777");
        document.documentElement.style.setProperty("--theme-background", "#F2F2F2");
        document.documentElement.style.setProperty("--theme-accent", "#A47ED8");
        break;
      }
    }
  }, [theme]);

  return [theme, setTheme] as const;
};

const themeContext = React.createContext<ReturnType<typeof useTheme>>(["main", () => {}]);

export const ThemeProvider: React.FC = props => {
  const setTheme = useTheme();

  return <themeContext.Provider value={setTheme}>{props.children}</themeContext.Provider>;
};

export const useThemeState = () => React.useContext(themeContext);
