import { style } from "@vanilla-extract/css";
import { tokens } from "../../styles/tokens.css";

export const linkToArticlesStyle = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.spacing[2],
  padding: tokens.spacing[4],
  textDecoration: "underline",
  transition: "color 0.2s, box-shadow 0.2s",
  boxShadow: tokens.focusRingShadow.before,
  ":hover": {
    color: tokens.colors.primary[300],
  },
  ":focus-visible": {
    boxShadow: tokens.focusRingShadow.after,
  },
});
