import { style } from "@vanilla-extract/css";
import { tokens } from "../../styles/tokens.css";

export const footerStyles = {
  footer: style({
    maxWidth: tokens.containerMaxWidth,
    margin: "auto",
    paddingLeft: tokens.spacing[4],
    paddingRight: tokens.spacing[4],
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: tokens.spacing[8],
    paddingBottom: tokens.spacing[8],
    gap: tokens.spacing[4],
    color: tokens.colors.text.secondary,
  }),

  description: style({
    fontSize: tokens.fontSizes.sm,
  }),

  textLink: style({
    ":hover": {
      textDecoration: "underline",
    },
  }),
};
