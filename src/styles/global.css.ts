import { globalStyle } from "@vanilla-extract/css";
import { tokens } from "./tokens.css";

globalStyle("body", {
  lineHeight: 1.5,
  fontFamily: ["'Noto Sans JP'", "sans-serif"].join(","),
  color: tokens.colors.text.primary,
  backgroundColor: tokens.colors.background,
});

globalStyle("a", {
  color: "inherit",
  textDecoration: "inherit",
});

globalStyle("img", {
  maxWidth: "100%",
  height: "auto",
});
