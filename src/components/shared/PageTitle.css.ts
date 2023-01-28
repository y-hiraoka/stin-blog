import { style } from "@vanilla-extract/css";
import { tokens } from "../../styles/tokens.css";

export const pageTitleStyle = style({
  lineHeight: 1.6,
  fontFamily: tokens.fontFamilies.heading,
  fontWeight: "bold",
  fontSize: tokens.fontSizes["2xl"],
});
