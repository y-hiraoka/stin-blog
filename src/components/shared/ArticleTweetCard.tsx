"use client";

import { useColorMode } from "../../lib/colorMode";
import { EmbeddedTweet } from "./EmbeddedTweet";

export const ArticleTweetCard: React.FC<{ url: string }> = ({ url }) => {
  const { actualColorMode } = useColorMode();
  return <EmbeddedTweet url={url} theme={actualColorMode} lang="ja" />;
};
