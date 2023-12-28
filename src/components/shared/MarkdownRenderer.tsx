import "server-only";
import { RootContent, RootContentMap, PhrasingContent } from "mdast";
import React, { FC } from "react";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import shiki from "shiki";
import { ArticleTweetCard } from "./ArticleTweetCard";
import classes from "./MarkdownRenderer.module.scss";
import { RichLinkCard } from "./RichLinkCard";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { remarkLinkBlock } from "@/lib/remark-link-block";
import { remarkTwitterEmbed } from "@/lib/remark-twitter-embed";
import { remarkYouTubeEmbed } from "@/lib/remark-youtube-embed";

const parseMarkdown = remark()
  .use(remarkFrontmatter)
  .use(remarkTwitterEmbed)
  .use(remarkYouTubeEmbed)
  .use(remarkLinkBlock)
  .use(remarkGfm);

type Props = { children: string };

export const MarkdownRenderer: React.FC<Props> = async ({ children }) => {
  const parsed = parseMarkdown.parse(children);
  const mdastRoot = await parseMarkdown.run(parsed);

  return (
    <div id="markdown-renderer" className={classes.markdown}>
      <NodesRenderer nodes={mdastRoot.children} />
    </div>
  );
};

const NodesRenderer: FC<{ nodes: RootContent[] }> = ({ nodes }) => {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "heading": {
        return <HeadingNode key={index} node={node} />;
      }
      case "text": {
        return <TextNode key={index} node={node} />;
      }
      case "paragraph": {
        return <ParagraphNode key={index} node={node} />;
      }
      case "inlineCode": {
        return <InlineCodeNode key={index} node={node} />;
      }
      case "blockquote": {
        return <BlockQuoteNode key={index} node={node} />;
      }
      case "link": {
        return <LinkNode key={index} node={node} />;
      }
      case "list": {
        return <ListNode key={index} node={node} />;
      }
      case "listItem": {
        return <ListItemNode key={index} node={node} />;
      }
      case "strong": {
        return <StrongNode key={index} node={node} />;
      }
      case "image": {
        return <ImageNode key={index} node={node} />;
      }
      case "code": {
        return <CodeNode key={index} node={node} />;
      }
      case "delete": {
        return <DeleteNode key={index} node={node} />;
      }
      case "table": {
        return <TableNode key={index} node={node} />;
      }
      case "thematicBreak": {
        return <ThematicBreakNode key={index} node={node} />;
      }
      case "html": {
        return <HTMLNode key={index} node={node} />;
      }
      case "blocklink": {
        return <BlockLinkNode key={index} node={node} />;
      }
      case "twitter-embed": {
        return <TwitterEmbedNode key={index} node={node} />;
      }
      case "youtube-embed": {
        return <YouTubeEmbedNode key={index} node={node} />;
      }

      default: {
        if (process.env.NODE_ENV === "development") {
          return (
            <div key={index}>
              <p style={{ color: "red" }}>Unknown node type: {node.type}</p>
              <pre>{JSON.stringify(node, null, 2)}</pre>
            </div>
          );
        } else {
          throw new Error(`Unknown node type: ${node.type}`);
        }
      }
    }
  });
};

const HeadingNode: FC<{ node: RootContentMap["heading"] }> = ({ node }) => {
  const Component = (
    {
      1: "h1",
      2: "h2",
      3: "h3",
      4: "h4",
      5: "h5",
      6: "h6",
    } as const
  )[node.depth];

  const childrenText = (function getChildrenText(children: PhrasingContent[]): string {
    return children.reduce((acc, child) => {
      if ("value" in child) {
        return acc + child.value;
      }
      if ("children" in child) {
        return acc + getChildrenText(child.children);
      }
      return acc;
    }, "");
  })(node.children);

  return (
    <Component id={encodeURIComponent(childrenText)}>
      <NodesRenderer nodes={node.children} />
    </Component>
  );
};

const TextNode: FC<{ node: RootContentMap["text"] }> = ({ node }) => {
  return node.value;
};

const ParagraphNode: FC<{ node: RootContentMap["paragraph"] }> = ({ node }) => {
  return (
    <p>
      <NodesRenderer nodes={node.children} />
    </p>
  );
};

const InlineCodeNode: FC<{ node: RootContentMap["inlineCode"] }> = ({ node }) => {
  return <code className={classes.inlineCode}>{node.value}</code>;
};

const BlockQuoteNode: FC<{ node: RootContentMap["blockquote"] }> = ({ node }) => {
  return (
    <blockquote>
      <NodesRenderer nodes={node.children} />
    </blockquote>
  );
};

const LinkNode: FC<{ node: RootContentMap["link"] }> = ({ node }) => {
  return (
    <a className={classes.textLink} href={node.url} target="_blank" rel="noreferrer">
      <NodesRenderer nodes={node.children} />
    </a>
  );
};

const ListNode: FC<{ node: RootContentMap["list"] }> = ({ node }) => {
  return node.ordered ? (
    <ol>
      <NodesRenderer nodes={node.children} />
    </ol>
  ) : (
    <ul>
      <NodesRenderer nodes={node.children} />
    </ul>
  );
};

const ListItemNode: FC<{ node: RootContentMap["listItem"] }> = ({ node }) => {
  if (node.children.length === 1 && node.children[0].type === "paragraph") {
    return (
      <li>
        <NodesRenderer nodes={node.children[0].children} />
      </li>
    );
  }

  return (
    <li>
      <NodesRenderer nodes={node.children} />
    </li>
  );
};

const StrongNode: FC<{ node: RootContentMap["strong"] }> = ({ node }) => {
  return (
    <strong>
      <NodesRenderer nodes={node.children} />
    </strong>
  );
};

const ImageNode: FC<{ node: RootContentMap["image"] }> = ({ node }) => {
  return (
    <a href={node.url} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={node.url} alt={node.alt ?? ""} className={classes.img} />
    </a>
  );
};

const CodeNode: FC<{ node: RootContentMap["code"] }> = async ({ node }) => {
  const lang = node.lang ?? "";

  const highlighted = await shiki
    .getHighlighter({ theme: "dark-plus" })
    .then((highlighter) => highlighter.codeToHtml(node.value, { lang }));

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const DeleteNode: FC<{ node: RootContentMap["delete"] }> = ({ node }) => {
  return (
    <del>
      <NodesRenderer nodes={node.children} />
    </del>
  );
};

const TableNode: FC<{ node: RootContentMap["table"] }> = ({ node }) => {
  const [headRow, ...bodyRows] = node.children;
  return (
    <table>
      <thead>
        <tr>
          {headRow.children.map((cell, index) => (
            <th key={index} style={{ textAlign: node.align?.[index] ?? undefined }}>
              <NodesRenderer nodes={cell.children} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, index) => (
          <tr key={index}>
            {row.children.map((cell, index) => (
              <td key={index} style={{ textAlign: node.align?.[index] ?? undefined }}>
                <NodesRenderer nodes={cell.children} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ThematicBreakNode: FC<{ node: RootContentMap["thematicBreak"] }> = () => {
  return <hr />;
};

const HTMLNode: FC<{ node: RootContentMap["html"] }> = ({ node }) => {
  return node.value;
};

const BlockLinkNode: FC<{ node: RootContentMap["blocklink"] }> = ({ node }) => {
  return (
    <div className={classes.embeded}>
      <RichLinkCard href={node.url} isExternal />
    </div>
  );
};

const TwitterEmbedNode: FC<{ node: RootContentMap["twitter-embed"] }> = ({ node }) => {
  return (
    <div className={classes.embeded}>
      <ArticleTweetCard url={node.url} />
    </div>
  );
};

const YouTubeEmbedNode: FC<{ node: RootContentMap["youtube-embed"] }> = ({ node }) => {
  return (
    <div className={classes.embeded}>
      <YouTubeEmbed videoId={node.videoId} />
    </div>
  );
};
