import { createVar, keyframes, style } from "@vanilla-extract/css";
import { tokens } from "./tokens.css";

const noOfLines = createVar();

export const lineClamp = {
  vars: {
    noOfLines,
  },
  style: style({
    display: "-webkit-box",
    WebkitLineClamp: noOfLines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }),
};

const skeletonAnimation = keyframes({
  "0%": {
    borderColor: tokens.colors.gray[100],
    background: tokens.colors.gray[100],
  },
  "100%": {
    borderColor: tokens.colors.gray[400],
    background: tokens.colors.gray[400],
  },
});

export const skeletonBase = style({
  animation: `0.8s linear infinite alternate ${skeletonAnimation}`,
  opacity: 0.7,
});

export const skeletonText = style([
  skeletonBase,
  {
    height: tokens.sizes[2],
    borderRadius: tokens.radius.xs,
  },
]);
