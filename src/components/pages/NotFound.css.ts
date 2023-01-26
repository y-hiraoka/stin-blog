import { style } from "@vanilla-extract/css";
import { tokens } from "../../styles/tokens.css";

export const notFoundStyles = {
  container: style({
    maxWidth: tokens.containerMaxWidth,
    textAlign: "center",
    margin: "auto",
  }),

  heading: style({
    margin: tokens.spacing[16],
    fontSize: tokens.fontSizes["4xl"],
    fontWeight: "bold",
  }),

  homeLink: style({
    display: "block",
    marginTop: tokens.spacing[12],
    padding: tokens.spacing[4],
    textDecoration: "underline",
    transition: "color 0.2s",
    ":hover": {
      color: tokens.colors.primary[300],
    },
  }),
};
