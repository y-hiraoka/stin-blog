"use client";

import { EmbeddedTweet } from "./EmbeddedTweet";
import { useColorMode } from "@/lib/colorMode";

export const ArticleTweetCard: React.FC<{ url: string }> = ({ url }) => {
  const { actualColorMode } = useColorMode();
  return <EmbeddedTweet url={url} theme={actualColorMode} lang="ja" />;
};
