import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { appContainer, hStack } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const articlesStyles = {
  page: style([
    appContainer,
    {
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[16],
    },
  ]),

  titleSection: style([
    hStack,
    {
      marginBottom: tokens.spacing[4],
    },
  ]),

  rssFeedLink: style({
    display: "inline-grid",
    placeItems: "center",
    width: tokens.sizes[10],
    height: tokens.sizes[10],
    fontSize: tokens.fontSizes["2xl"],
    borderRadius: tokens.radius.md,
    boxShadow: tokens.focusRingShadow.before,
    transition: "background-color 0.2s, box-shadow 0.2s",
    ":hover": {
      backgroundColor: tokens.colors.blackAlpha[100],
    },
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },

    selectors: {
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.whiteAlpha[200],
      },
    },
  }),

  articleList: style({ marginTop: tokens.spacing[8] }),
};
