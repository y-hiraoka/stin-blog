import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkTwitterEmbed: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      const maybeLink = node.children[0];

      if (node.children.length !== 1) return;
      if (maybeLink.type !== "link") return;

      const isPlainLink = maybeLink.children.every((child) => child.type === "text");
      if (!isPlainLink) return;

      if (!parent || index === undefined) return;

      const matchTwitterLink =
        /https?:\/\/(www\.)?(twitter|x).com\/\w{1,15}\/status\/.*/.test(maybeLink.url);

      if (!matchTwitterLink) return;

      parent.children[index] = {
        type: "twitter-embed",
        url: maybeLink.url,
      };
    });
  };
};

declare module "mdast" {
  export interface TwitterEmbed extends Resource {
    type: "twitter-embed";
  }

  interface RootContentMap {
    "twitter-embed": TwitterEmbed;
  }
}
