import { style } from "@vanilla-extract/css";
import { appContainer, center, hStack } from "../../styles/system.css";
import { tokens } from "../../styles/tokens.css";

export const taggedArticlesStyles = {
  container: style([
    appContainer,
    {
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[16],
    },
  ]),

  titleSection: style([
    hStack,
    {
      marginBottom: tokens.spacing[8],
      alignItems: "center",
    },
  ]),
};
