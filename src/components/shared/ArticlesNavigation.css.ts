import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { tokens } from "../../styles/tokens.css";

export const articlesNavigationStyles = {
  root: style({
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing[4],
    borderBottom: tokens.borders[2],
    borderColor: tokens.colors.gray[300],

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        borderColor: tokens.colors.gray[600],
      },
    },
  }),

  link: style({
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: tokens.sizes[12],
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    borderBottom: tokens.borders[2],
    borderColor: "transparent",
    marginBottom: "-2px",
    ":hover": {
      backgroundColor: tokens.colors.blackAlpha[100],
    },
    selectors: {
      "&[data-is-active='true']": {
        borderColor: tokens.colors.gray[800],
      },
      "&[data-is-active='false']": {
        color: tokens.colors.blackAlpha[500],
      },
      [`${DARK_MODE_SELECTOR} &[data-is-active='true']`]: {
        borderColor: tokens.colors.gray[300],
      },
      [`${DARK_MODE_SELECTOR} &[data-is-active='false']`]: {
        color: tokens.colors.whiteAlpha[600],
      },
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.whiteAlpha[200],
      },
    },
  }),
};
