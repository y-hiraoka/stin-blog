import { Root } from "mdast";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkFootnoteBackLink: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, "footnoteDefinition", (node) => {
      visit(node, "paragraph", (childParagraph) => {
        childParagraph.children.push({
          type: "footnote-back-link",
          url: `#fnref-${node.identifier}`,
        });
      });
    });
  };
};

declare module "mdast" {
  export interface FootnoteBackLink extends Resource {
    type: "footnote-back-link";
  }

  interface RootContentMap {
    "footnote-back-link": FootnoteBackLink;
  }

  interface PhrasingContentMap {
    "footnote-back-link": FootnoteBackLink;
  }
}
