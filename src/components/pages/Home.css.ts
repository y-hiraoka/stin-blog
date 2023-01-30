import { style } from "@vanilla-extract/css";
import { appContainer, center } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const homeStyles = {
  container: style([
    appContainer,
    {
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[16],
    },
  ]),

  title: style({
    marginBottom: tokens.spacing[8],
  }),

  linkToArticles: style([
    center,
    {
      marginTop: tokens.spacing[12],
    },
  ]),
};
