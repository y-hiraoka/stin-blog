import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkLinkBlock: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      const maybeLink = node.children[0];

      if (node.children.length !== 1) return;
      if (maybeLink.type !== "link") return;

      const isPlainLink = maybeLink.children.every((child) => child.type === "text");
      if (!isPlainLink) return;

      if (!parent || index === undefined) return;

      parent.children[index] = {
        type: "blocklink",
        url: maybeLink.url,
      };
    });
  };
};

declare module "mdast" {
  export interface BlockLink extends Resource {
    type: "blocklink";
  }

  interface RootContentMap {
    blocklink: BlockLink;
  }
}
