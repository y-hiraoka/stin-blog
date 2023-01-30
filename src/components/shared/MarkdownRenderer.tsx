import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkSlug from "remark-slug";
import remarkGfm from "remark-gfm";
import { Prism } from "react-syntax-highlighter";
import { a11yDark as prismStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { RichLinkCard } from "./RichLinkCard";
import { EmbeddedTweet } from "./EmbeddedTweet";
import Link from "next/link";
import { markdownRendererStyles } from "./MarkdownRenderer.css";
import { useColorMode } from "../../lib/colorMode";
import { staticPath } from "../../lib/$path";

type Props = { children: string };

export const MarkdownRenderer: React.FC<Props> = ({ children }) => {
  return (
    <div className={markdownRendererStyles.root}>
      <ReactMarkdown
        remarkPlugins={[remarkSlug, remarkGfm]}
        components={{
          a: MDLink,
          h1: Heading1,
          h2: Heading2,
          h3: Heading3,
          h4: Heading4,
          h5: Heading5,
          h6: Heading6,
          code: Code,
          p: Paragraph,
          ul: UnorderedList,
          ol: OrderedList,
          li: ListItem,
          blockquote: Blockquote,
          table: Table,
          thead: Thead,
          tbody: Tbody,
          tr: Tr,
          th: Th,
          td: Td,
          hr: Hr,
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
    return <Link {...props} href={href} className={markdownRendererStyles.textLink} />;
  }

  return (
    <a
      {...props}
      href={href}
      className={markdownRendererStyles.textLink}
      target="_blank"
      rel="noreferrer"
    />
  );
};

const Heading1: Components["h1"] = ({ level, node, ...props }) => {
  return <h1 {...props} className={markdownRendererStyles.h1} />;
};

const Heading2: Components["h2"] = ({ level, node, ...props }) => {
  return <h2 {...props} className={markdownRendererStyles.h2} />;
};

const Heading3: Components["h3"] = ({ level, node, ...props }) => {
  return <h3 {...props} className={markdownRendererStyles.h3} />;
};

const Heading4: Components["h4"] = ({ level, node, ...props }) => {
  return <h4 {...props} className={markdownRendererStyles.h4} />;
};

const Heading5: Components["h5"] = ({ level, node, ...props }) => {
  return <h5 {...props} className={markdownRendererStyles.h5} />;
};

const Heading6: Components["h6"] = ({ level, node, ...props }) => {
  return <h6 {...props} className={markdownRendererStyles.h6} />;
};

const Code: Components["code"] = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline ? (
    <div className={markdownRendererStyles.codeBlock}>
      {/* @ts-expect-error 原因不明のエラー */}
      <Prism style={prismStyle} language={match?.[1]} {...props}>
        {String(children).replace(/\n$/, "")}
      </Prism>
    </div>
  ) : (
    <code className={markdownRendererStyles.inlineCode}>{children}</code>
  );
};

const UnorderedList: Components["ul"] = ({ node, depth, ordered, ...props }) => {
  return <ul {...props} className={markdownRendererStyles.list} />;
};

const OrderedList: Components["ol"] = ({ node, depth, ordered, ...props }) => {
  return <ol {...props} className={markdownRendererStyles.list} />;
};

const ListItem: Components["li"] = ({ node, checked, index, ordered, ...props }) => {
  return <li {...props} className={markdownRendererStyles.listItem} />;
};

const Paragraph: Components["p"] = ({ node, ...props }) => {
  const { colorMode } = useColorMode();

  const child = node.children[0];
  if (
    node.children.length === 1 &&
    child.type === "element" &&
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
        <div className={markdownRendererStyles.embeded}>
          <EmbeddedTweet url={child.properties.href} theme={colorMode} lang="ja" />
        </div>
      );
    }

    return (
      <div className={markdownRendererStyles.embeded}>
        <RichLinkCard href={child.properties.href} isExternal />
      </div>
    );
  }

  return <p {...props} className={markdownRendererStyles.paragraph} />;
};

const Blockquote: Components["blockquote"] = ({ node, ...props }) => {
  return <blockquote {...props} className={markdownRendererStyles.blockquote} />;
};

const Table: Components["table"] = ({ node, ...props }) => {
  return <table {...props} className={markdownRendererStyles.table} />;
};

const Thead: Components["thead"] = ({ node, ...props }) => {
  return <thead {...props} />;
};

const Tbody: Components["tbody"] = ({ node, ...props }) => {
  return <tbody {...props} />;
};

const Tr: Components["tr"] = ({ node, isHeader, ...props }) => {
  return <tr {...props} />;
};

const Th: Components["th"] = ({ node, isHeader, ...props }) => {
  return <th {...props} className={markdownRendererStyles.th} />;
};

const Td: Components["td"] = ({ node, isHeader, ...props }) => {
  return <td {...props} className={markdownRendererStyles.td} />;
};

const Hr: Components["hr"] = ({ node, ...props }) => {
  return <hr {...props} className={markdownRendererStyles.hr} />;
};

const Img: Components["img"] = ({ src, alt }) => {
  return (
    <a href={src} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src ?? staticPath.images.no_image_png} alt={alt ?? ""} />
    </a>
  );
};
