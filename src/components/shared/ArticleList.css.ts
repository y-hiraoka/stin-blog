import { style } from "@vanilla-extract/css";
import { mediaQueries } from "../../styles/mediaQueries";
import { tokens } from "../../styles/tokens.css";

export const articleListStyle = style({
  display: "grid",
  gap: tokens.spacing[6],
  gridTemplateColumns: `1fr`,

  "@media": {
    [mediaQueries.largerThan("md")]: {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});
