import { recipe } from "@vanilla-extract/recipes";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { tokens } from "../../styles/tokens.css";

export const iconButtonStyle = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s, box-shadow 0.2s",
    boxShadow: tokens.focusRingShadow.before,
    ":focus-visible": {
      boxShadow: tokens.focusRingShadow.after,
    },
  },
  variants: {
    color: {
      normal: {
        color: tokens.colors.text.primary,
      },
      primary: {
        color: tokens.colors.primary[500],
        selectors: {
          [`${DARK_MODE_SELECTOR} &`]: {
            color: tokens.colors.primary[400],
          },
        },
      },
    },
    variant: {
      ghost: {},
      outlined: {
        border: tokens.borders[1],
      },
    },
    size: {
      md: {
        width: tokens.sizes[10],
        height: tokens.sizes[10],
        fontSize: tokens.fontSizes["2xl"],
        borderRadius: tokens.radius.md,
      },
    },
  },
  compoundVariants: [
    {
      variants: { color: "normal", variant: "ghost" },
      style: {
        ":hover": {
          backgroundColor: tokens.colors.blackAlpha[100],
        },
        selectors: {
          [`${DARK_MODE_SELECTOR} &:hover`]: {
            backgroundColor: tokens.colors.whiteAlpha[200],
          },
        },
      },
    },
    {
      variants: { color: "primary", variant: "ghost" },
      style: {
        ":hover": {
          backgroundColor: tokens.colors.primary[50],
        },
        selectors: {
          [`${DARK_MODE_SELECTOR} &:hover`]: {
            backgroundColor: tokens.colors.primary[900],
          },
        },
      },
    },
    {
      variants: { color: "normal", variant: "outlined" },
      style: {
        borderColor: tokens.colors.gray[200],
        ":hover": {
          backgroundColor: tokens.colors.gray[100],
        },

        selectors: {
          [`${DARK_MODE_SELECTOR} &`]: {
            borderColor: tokens.colors.whiteAlpha[300],
          },
          [`${DARK_MODE_SELECTOR} &:hover`]: {
            backgroundColor: tokens.colors.whiteAlpha[200],
          },
        },
      },
    },
  ],
  defaultVariants: {
    color: "normal",
    size: "md",
  },
});
