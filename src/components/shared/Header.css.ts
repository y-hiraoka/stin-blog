import { keyframes, style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { mediaQueries } from "../../styles/mediaQueries";
import { tokens } from "../../styles/tokens.css";
import { appContainer } from "../../styles/system.css";

const uncollapse = keyframes({
  from: {
    opacity: 0,
    transform: `translateY(-4px)`,
    scale: 0.8,
  },
  to: {
    opacity: 1,
    transform: `translateY(${tokens.sizes[2]})`,
    scale: 1,
  },
});

export const headerStyles = {
  root: style({
    position: "sticky",
    top: 0,
    backdropFilter: "blur(8px)",
  }),

  header: style([
    appContainer,
    {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: tokens.spacing[4],
      paddingBottom: tokens.spacing[4],
    },
  ]),

  logoLink: style({
    lineHeight: 0,
    boxShadow: tokens.focusRingShadow.before,
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
  }),

  logoLinkImage: style({
    width: "auto",
    height: tokens.sizes[12],
    "@media": {
      [mediaQueries.largerThan("sm")]: {
        height: tokens.sizes[14],
      },
      [mediaQueries.largerThan("md")]: {
        height: tokens.sizes[16],
      },
    },
  }),

  navigations: style({
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing[3],
  }),

  navigationLink: style({
    display: "none",
    fontWeight: "bold",
    textDecoration: "none",
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
        display: "inline",
      },
    },
  }),

  collapsedNavigationTrigger: style({
    "@media": {
      [mediaQueries.largerThan("md")]: {
        display: "none",
      },
    },
  }),

  collapsedNavigationContent: style({
    boxShadow: tokens.shadows.md,
    background: tokens.colors.background,
    borderRadius: tokens.radius.md,
    border: tokens.borders[1],
    borderColor: tokens.colors.gray[200],
    paddingTop: tokens.spacing[2],
    paddingBottom: tokens.spacing[2],
    minWidth: tokens.sizes[48],
    transformOrigin: "top right",
    animation: `${uncollapse} 0.2s forwards`,

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        background: tokens.colors.gray[700],
        borderColor: tokens.colors.whiteAlpha[300],
        boxShadow: tokens.shadows["dark-lg"],
      },
    },
  }),

  collapsedNavigationLink: style({
    display: "block",
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    transition: "background-color 0.2s",

    ":focus": {
      backgroundColor: tokens.colors.gray[100],
    },
    ":hover": {
      backgroundColor: tokens.colors.gray[100],
    },

    selectors: {
      [`${DARK_MODE_SELECTOR} &:focus`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
    },
  }),
};
