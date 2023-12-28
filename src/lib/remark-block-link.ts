import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkBlockLink: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      const maybeLink = node.children[0];

      if (node.children.length !== 1) return;
      if (maybeLink.type !== "link") return;
      if (maybeLink.children.length !== 1) return;

      const isPlainLink =
        maybeLink.children[0].type === "text" &&
        maybeLink.url === maybeLink.children[0].value;
      if (!isPlainLink) return;

      if (!parent || index === undefined) return;

      parent.children[index] = {
        type: "block-link",
        url: maybeLink.url,
      };
    });
  };
};

declare module "mdast" {
  export interface BlockLink extends Resource {
    type: "block-link";
  }

  interface RootContentMap {
    "block-link": BlockLink;
  }
}
