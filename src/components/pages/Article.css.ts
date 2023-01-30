import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { appContainer, center, vStack, wrapItems } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const articleStyles = {
  container: style([
    appContainer,
    {
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[16],
    },
  ]),

  articleHeader: style([
    vStack,
    {
      gap: tokens.spacing[8],
    },
  ]),

  articleTitle: style({
    fontWeight: "bold",
    fontSize: tokens.fontSizes["2xl"],
    lineHeight: 1.6,
  }),

  contentDivider: style({
    opacity: 0.6,
    border: 0,
    borderBottom: tokens.borders[1],
    borderBottomColor: tokens.colors.gray[200],
    width: "100%",
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[8],

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        borderBottomColor: tokens.colors.whiteAlpha[300],
      },
    },
  }),

  datetimes: style([
    vStack,
    {
      gap: tokens.spacing[1],
    },
  ]),

  datetime: style({
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.text.secondary,
  }),

  tags: style([
    wrapItems,
    {
      listStyle: "none",
    },
  ]),

  articleContent: style({
    marginBottom: tokens.spacing[16],
  }),

  adsense: style({
    marginBottom: tokens.spacing[16],
  }),

  externalLinks: style({
    marginBottom: tokens.spacing[16],
  }),

  shareButtons: wrapItems,

  twitterButton: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[2],
    borderRadius: tokens.radius.md,
    fontWeight: "bold",
    color: "white",
    backgroundColor: tokens.colors.twitter[500],
    paddingLeft: tokens.spacing[4],
    paddingRight: tokens.spacing[4],
    height: tokens.sizes[10],
    transition: "background-color 0.3s, box-shadow 0.2s",
    boxShadow: tokens.focusRingShadow.before,
    ":hover": {
      backgroundColor: tokens.colors.twitter[600],
    },
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        color: tokens.colors.gray[800],
        backgroundColor: tokens.colors.twitter[200],
      },
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.twitter[300],
      },
    },
  }),

  githubLink: style({
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacing[2],
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing[6],
    boxShadow: tokens.focusRingShadow.before,
    transition: "box-shadow 0.2s",
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
  }),

  githubIcon: style({
    fontSize: tokens.fontSizes["2xl"],
  }),

  linkToArticles: center,
};
