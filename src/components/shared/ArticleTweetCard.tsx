"use client";

import { useColorMode } from "../../lib/colorMode";
import { EmbeddedTweet } from "./EmbeddedTweet";

export const ArticleTweetCard: React.FC<{ url: string }> = ({ url }) => {
  const { colorMode } = useColorMode();
  return <EmbeddedTweet url={url} theme={colorMode} lang="ja" />;
};
