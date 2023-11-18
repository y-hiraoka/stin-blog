import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import rehypeHighlight from "rehype-highlight";
import { RichLinkCard } from "./RichLinkCard";
import Link from "next/link";
import classes from "./MarkdownRenderer.module.scss";
import { ArticleTweetCard } from "./ArticleTweetCard";
import "highlight.js/styles/panda-syntax-dark.css";

type Props = { children: string };

export const MarkdownRenderer: React.FC<Props> = ({ children }) => {
  return (
    <div id="markdown-renderer" className={classes.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkFrontmatter, remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true }]]}
        components={{
          a: MDLink,
          code: Code,
          p: Paragraph,
          img: Img,
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

const MDLink: Components["a"] = ({ node, href, ...props }) => {
  // a link to same domain
  if (href?.startsWith("#") || href?.startsWith("/") || href?.includes("stin.ink")) {
    // @ts-expect-error
    return <Link {...props} href={href} className={classes.textLink} />;
  }

  return (
    <a
      {...props}
      href={href}
      className={classes.textLink}
      target="_blank"
      rel="noreferrer"
    />
  );
};

const Code: Components["code"] = ({ node, className, children, ...props }) => {
  return <code className={className ?? classes.inlineCode}>{children}</code>;
};

const Paragraph: Components["p"] = ({ node, ...props }) => {
  const child = node?.children[0];
  if (
    node?.children.length === 1 &&
    child?.type === "element" &&
    child.tagName === "a" &&
    typeof child.properties?.href === "string" &&
    child.children[0].type === "text" &&
    child.properties.href === child.children[0].value
  ) {
    if (
      // Twitter の Tweet URL
      /https?:\/\/(www\.)?twitter.com\/\w{1,15}\/status\/.*/.test(child.properties.href)
    ) {
      return (
        <div className={classes.embeded}>
          <ArticleTweetCard url={child.properties.href} />
        </div>
      );
    }

    return (
      <div className={classes.embeded}>
        <RichLinkCard href={child.properties.href} isExternal />
      </div>
    );
  }

  return <p {...props} />;
};

const Img: Components["img"] = ({ src, alt }) => {
  return (
    <a href={src} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={classes.img} />
    </a>
  );
};
