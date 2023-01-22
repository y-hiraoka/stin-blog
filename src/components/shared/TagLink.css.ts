import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { tokens } from "../../styles/tokens.css";

export const tagLinkstyle = style({
  borderRadius: tokens.radius.md,
  minWidth: tokens.sizes[6],
  minHeight: tokens.sizes[6],
  display: "inline-flex",
  alignItems: "center",
  paddingInlineStart: tokens.spacing[2],
  paddingInlineEnd: tokens.spacing[2],
  fontSize: tokens.fontSizes.sm,
  fontWeight: 500,
  backgroundColor: tokens.colors.primary[100],
  color: tokens.colors.primary[800],
  lineHeight: 1.2,
  verticalAlign: "top",
  boxShadow: tokens.focusRingShadow.before,
  transition: "box-shadow 0.2s",
  ":focus-visible": {
    boxShadow: tokens.focusRingShadow.after,
  },
  ":hover": {
    textDecoration: "underline",
  },

  selectors: {
    [`${DARK_MODE_SELECTOR} &`]: {
      backgroundColor: tokens.colors.primary[700],
      color: tokens.colors.primary[200],
    },
  },
});
