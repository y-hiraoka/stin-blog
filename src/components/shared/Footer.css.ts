import { style } from "@vanilla-extract/css";
import { appContainer } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const footerStyles = {
  footer: style([
    appContainer,
    {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[8],
      gap: tokens.spacing[4],
      color: tokens.colors.text.secondary,
    },
  ]),

  description: style({
    fontSize: tokens.fontSizes.sm,
  }),

  textLink: style({
    boxShadow: tokens.focusRingShadow.before,
    transition: "box-shadow 0.2s",
    ":hover": {
      textDecoration: "underline",
    },
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
  }),
};
