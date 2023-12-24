import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { extractYouTubeVideoId } from "./extractYouTubeVideoId";

export const remarkYouTubeEmbed: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      const maybeLink = node.children[0];

      if (node.children.length !== 1) return;
      if (maybeLink.type !== "link") return;

      const isPlainLink = maybeLink.children.every((child) => child.type === "text");
      if (!isPlainLink) return;

      if (!parent || index === undefined) return;

      const videoId = extractYouTubeVideoId(maybeLink.url);

      if (!videoId) return;

      parent.children[index] = {
        type: "youtube-embed",
        videoId: videoId,
      };
    });
  };
};

declare module "mdast" {
  export interface YouTubeEmbed {
    type: "youtube-embed";
    videoId: string;
  }

  interface RootContentMap {
    "youtube-embed": YouTubeEmbed;
  }
}
