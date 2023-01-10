import { style } from "@vanilla-extract/css";
import { tokens } from "../../styles/tokens.css";

export const containerStyle = style({
  maxWidth: tokens.containerMaxWidth,
  margin: "auto",
  paddingLeft: tokens.spacing[4],
  paddingRight: tokens.spacing[4],
});
