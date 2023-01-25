import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { tokens } from "../../styles/tokens.css";

export const markdownRendererStyles = {
  root: style({
    ":first-child": {
      marginTop: 0,
    },
  }),

  textLink: style({
    color: tokens.colors.text.link,
    ":visited": {
      color: tokens.colors.text.linkVisited,
    },
  }),

  h1: style({
    marginTop: tokens.spacing[24],
    marginBottom: tokens.spacing[8],
    fontSize: tokens.fontSizes["2xl"],
    fontWeight: "bold",
    "::before": {
      content: "'# '",
      color: tokens.colors.primary[300],
    },
  }),

  h2: style({
    marginTop: tokens.spacing[16],
    marginBottom: tokens.spacing[6],
    fontSize: tokens.fontSizes.xl,
    fontWeight: "bold",
    "::before": {
      content: "'## '",
      color: tokens.colors.primary[300],
    },
  }),

  h3: style({
    marginTop: tokens.spacing[12],
    marginBottom: tokens.spacing[4],
    fontSize: tokens.fontSizes.lg,
    fontWeight: "bold",
    "::before": {
      content: "'### '",
      color: tokens.colors.primary[300],
    },
  }),

  h4: style({
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[3],
    fontSize: tokens.fontSizes.md,
    fontWeight: "bold",
    "::before": {
      content: "'#### '",
      color: tokens.colors.primary[300],
    },
  }),

  h5: style({
    marginTop: tokens.spacing[6],
    marginBottom: tokens.spacing[3],
    fontSize: tokens.fontSizes.sm,
    fontWeight: "bold",
    "::before": {
      content: "'##### '",
      color: tokens.colors.primary[300],
    },
  }),

  h6: style({
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    fontSize: tokens.fontSizes.xs,
    fontWeight: "bold",
    "::before": {
      content: "'###### '",
      color: tokens.colors.primary[300],
    },
  }),

  codeBlock: style({
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  }),

  inlineCode: style({
    paddingLeft: tokens.spacing[1],
    paddingRight: tokens.spacing[1],
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.gray[100],
    color: tokens.colors.gray[800],
    fontFamily: tokens.fontFamilies.mono,
    fontSize: tokens.fontSizes.sm,
    display: "inline-block",
  }),

  list: style({
    paddingLeft: tokens.spacing[7],
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  }),

  listItem: style({
    lineHeight: 1.8,
    marginTop: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  }),

  embeded: style({
    marginTop: tokens.spacing[6],
    marginBottom: tokens.spacing[6],
  }),

  paragraph: style({
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  }),

  blockquote: style({
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    paddingLeft: tokens.spacing[4],
    paddingTop: tokens.spacing[1],
    paddingBottom: tokens.spacing[1],
    borderLeft: tokens.borders[4],
    borderColor: tokens.colors.gray[300],
    color: tokens.colors.text.secondary,

    ":first-child": {
      marginTop: 0,
    },
    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        borderColor: tokens.colors.gray[600],
      },
    },
  }),

  hr: style({
    height: "auto",
    border: "none",
    "::before": {
      content: "'＊＊＊'",
      display: "block",
      color: tokens.colors.text.secondary,
      marginTop: tokens.spacing[6],
      marginBottom: tokens.spacing[6],
      textAlign: "center",
    },
  }),

  table: style({
    marginTop: tokens.spacing[6],
    marginBottom: tokens.spacing[6],
    fontVariantNumeric: "lining-nums tabular-nums",
    borderCollapse: "collapse",
    width: "100%",
  }),

  th: style({
    fontFamily: tokens.fontFamilies.heading,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    paddingInlineStart: tokens.spacing[6],
    paddingInlineEnd: tokens.spacing[6],
    paddingTop: tokens.spacing[3],
    paddingBottom: tokens.spacing[3],
    lineHeight: "1rem",
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.gray[600],
    borderBottom: tokens.borders[1],
    borderColor: tokens.colors.gray[100],
  }),

  td: style({
    paddingInlineStart: tokens.spacing[6],
    paddingInlineEnd: tokens.spacing[6],
    paddingTop: tokens.spacing[4],
    paddingBottom: tokens.spacing[4],
    lineHeight: 1.25,
    borderBottom: tokens.borders[1],
    borderColor: tokens.colors.gray[100],
  }),
};
