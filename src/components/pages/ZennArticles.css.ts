import { style } from "@vanilla-extract/css";
import { appContainer } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const zennArticlesStyles = {
  container: style([
    appContainer,
    {
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[16],
    },
  ]),

  title: style({
    marginBottom: tokens.spacing[4],
  }),

  articleList: style({
    marginTop: tokens.spacing[8],
  }),
};
