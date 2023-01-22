import { style } from "@vanilla-extract/css";
import { DARK_MODE_SELECTOR } from "../../styles/constant";
import { mediaQueries } from "../../styles/mediaQueries";
import { tokens } from "../../styles/tokens.css";
import { lineClamp, skeletonBase, skeletonText } from "../../styles/utils.css";

export const richLinkCardStyles = {
  cardRoot: style({
    display: "flex",
    gap: tokens.spacing[2],
    height: tokens.sizes[36],
    width: "100%",
    borderRadius: tokens.radius.lg,
    border: tokens.borders[1],
    borderColor: tokens.colors.gray[200],
    overflow: "hidden",
    transition: "background-color 0.3s",

    ":hover": {
      backgroundColor: tokens.colors.blackAlpha[50],
    },
    ":focus-visible": {
      backgroundColor: tokens.colors.blackAlpha[50],
    },

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        borderColor: tokens.colors.gray[700],
      },
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
      [`${DARK_MODE_SELECTOR} &:focus-visible`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
    },
  }),

  loadedMetadata: style({
    display: "flex",
    flexDirection: "column",
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    flex: 1,
    height: "100%",
  }),

  loadedMetadataTitle: style([
    lineClamp.style,
    {
      fontWeight: "bold",
      wordBreak: "break-all",
      vars: {
        [lineClamp.vars.noOfLines]: "2",
      },
    },
  ]),

  loadedMetadataDescriptionContainer: style({
    flex: 1,
    marginTop: tokens.spacing[2],
  }),

  loadedMetadataDescription: style([
    lineClamp.style,
    {
      fontSize: tokens.fontSizes.xs,
      color: tokens.colors.text.secondary,
      wordBreak: "break-all",
      vars: {
        [lineClamp.vars.noOfLines]: "2",
      },

      "@media": {
        [mediaQueries.largerThan("md")]: {
          fontSize: tokens.fontSizes.sm,
        },
      },
    },
  ]),

  loadedMetadataSite: style({
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing[2],
  }),

  loadedMetadataSiteName: style([
    lineClamp.style,
    {
      fontSize: tokens.fontSizes.sm,
      vars: {
        [lineClamp.vars.noOfLines]: "1",
      },
    },
  ]),

  loadedMetadataImageContainer: style({
    maxWidth: "40%",
    height: tokens.sizes[36],
  }),

  loadedMetadataImage: style({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),

  error: style({
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[2],
    padding: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    border: tokens.borders[1],
    borderColor: tokens.colors.gray[200],
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: tokens.colors.blackAlpha[50],
    },
    ":focus-visible": {
      backgroundColor: tokens.colors.blackAlpha[50],
    },

    selectors: {
      [`${DARK_MODE_SELECTOR} &`]: {
        borderColor: tokens.colors.gray[700],
      },
      [`${DARK_MODE_SELECTOR} &:hover`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
      [`${DARK_MODE_SELECTOR} &:focus-visible`]: {
        backgroundColor: tokens.colors.whiteAlpha[100],
      },
    },
  }),

  errorTitle: style({
    fontWeight: "bold",
  }),

  errorDescription: style({
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.text.secondary,
  }),

  skeletonTextContainer: style({
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[2],

    selectors: {
      "&:not(:first-of-type)": {
        marginTop: tokens.spacing[6],
        flex: 1,
      },
    },
  }),

  skeletonText: skeletonText,

  skeletonMetadata: style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
  }),

  skeletonTextShorter: style([
    skeletonText,
    {
      width: "80%",
    },
  ]),

  skeletonSiteIcon: style([
    skeletonBase,
    {
      width: tokens.sizes[4],
      height: tokens.sizes[4],
      borderRadius: tokens.radius.xs,
    },
  ]),

  skeletonImage: style([
    skeletonBase,
    {
      maxWidth: "40%",
      width: tokens.sizes[64],
      height: "100%",
    },
  ]),
};
