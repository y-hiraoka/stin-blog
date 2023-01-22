import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { mediaQueries } from "../../styles/mediaQueries";
import { tokens } from "../../styles/tokens.css";

export const articleCardStyles = {
  card: style({
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colors.gray[100],
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadows.md,
    padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        backgroundColor: tokens.colors.gray[700],
      },
    },
  }),

  publishedAt: style({
    color: tokens.colors.text.secondary,
    fontSize: tokens.fontSizes.sm,
  }),

  title: style({
    flex: 1,
    marginTop: tokens.spacing[4],
  }),

  titleLink: style({
    display: "block",
    lineHeight: 1.6,
    fontSize: tokens.fontSizes.lg,
    fontWeight: "bold",
    color: tokens.colors.text.primary,
    boxShadow: tokens.focusRingShadow.before,
    transition: "box-shadow 0.2s",

    ":hover": {
      textDecoration: "underline",
    },
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
    "@media": {
      [mediaQueries.largerThan("md")]: {
        fontSize: tokens.fontSizes.xl,
      },
    },
  }),

  tags: style({
    display: "flex",
    flexWrap: "wrap",
    listStyle: "none",
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[8],
  }),

  zennLink: style({
    display: "inline-flex",
    width: "fit-content",
    marginTop: tokens.spacing[8],
    alignItems: "center",
    gap: tokens.spacing[2],
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
