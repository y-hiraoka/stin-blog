import { YouTubeEmbed as NextYouTubeEmbed } from "@next/third-parties/google";
import { FC } from "react";

export const YouTubeEmbed: FC<{ videoId: string }> = ({ videoId }) => {
  return (
    <NextYouTubeEmbed
      videoid={videoId}
      style={`background-image: url('https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg');`}
    />
  );
};
