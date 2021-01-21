import Head from "next/head";
import React from "react";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

type Theme = "main" | "light";

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  linkText: string;
  inlineCodeBg: string;
  tableBg: string;
  tableBg2n: string;
  tableBorder: string;
};

const THEME_STORAGE_KEY = "__initial_theme_state";
const getTheme = (): Theme =>
  (localStorage.getItem(THEME_STORAGE_KEY) ?? "main") as Theme;
const saveTheme = (theme: Theme) => localStorage.setItem(THEME_STORAGE_KEY, theme);

const useTheme = () => {
  const [theme, setTheme] = React.useState<Theme>("main");
  const [themeColors, setThemeColors] = React.useState(mainThemeColors);

  useIsomorphicLayoutEffect(() => {
    setTheme(getTheme());
  }, []);

  useIsomorphicLayoutEffect(() => {
    saveTheme(theme);

    switch (theme) {
      case "main": {
        setThemeColors(mainThemeColors);
        break;
      }
      case "light": {
        setThemeColors(lightThemeColors);
        break;
      }
    }
  }, [theme]);

  useIsomorphicLayoutEffect(() => {
    document.documentElement.style.setProperty("--theme-primary", themeColors.primary);
    document.documentElement.style.setProperty(
      "--theme-secondary",
      themeColors.secondary,
    );
    document.documentElement.style.setProperty(
      "--theme-background",
      themeColors.background,
    );
    document.documentElement.style.setProperty("--theme-accent", themeColors.accent);
    document.documentElement.style.setProperty("--theme-link-text", themeColors.linkText);
    document.documentElement.style.setProperty(
      "--theme-inline-code-bg",
      themeColors.inlineCodeBg,
    );
    document.documentElement.style.setProperty("--theme-table-bg", themeColors.tableBg);
    document.documentElement.style.setProperty(
      "--theme-table-bg-2n",
      themeColors.tableBg2n,
    );
    document.documentElement.style.setProperty(
      "--theme-table-border",
      themeColors.tableBorder,
    );
  }, [themeColors]);

  return { theme, setTheme, themeColors } as const;
};

const themeContext = React.createContext<ReturnType<typeof useTheme> | null>(null);

export const ThemeProvider: React.FC = props => {
  const themeValue = useTheme();

  return (
    <>
      <Head>
        <meta name="theme-color" content={themeValue.themeColors.background} />
      </Head>
      <themeContext.Provider value={themeValue}>{props.children}</themeContext.Provider>
    </>
  );
};

export const useThemeState = () => {
  const context = React.useContext(themeContext);

  if (context === null) {
    throw new Error(`useThemeState must be wrapped with ThemeProvider.`);
  }

  return context;
};

const mainThemeColors: ThemeColors = {
  primary: "#F2F2F2",
  secondary: "#777777",
  background: "#1C1C1C",
  accent: "#A47ED8",
  linkText: "#03A9F4",
  inlineCodeBg: "#444444",
  tableBg: "#393939",
  tableBg2n: "#606060",
  tableBorder: "#777777",
};

const lightThemeColors: ThemeColors = {
  primary: "#1C1C1C",
  secondary: "#777777",
  background: "#F2F2F2",
  accent: "#A47ED8",
  linkText: "#0366d6",
  inlineCodeBg: "rgba(27, 31, 35, 0.05)",
  tableBg: "#ffffff",
  tableBg2n: "#f6f8fa",
  tableBorder: "#c6cbd1",
};
