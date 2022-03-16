import { Heading, Link, Text } from "@chakra-ui/react";
import React from "react";
import ReactMarkdown, { Components, Options } from "react-markdown";
import remarkSlug from "remark-slug";
import remarkGfm from "remark-gfm";
import { Prism } from "react-syntax-highlighter";
import { a11yDark as prismStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ExternalLink } from "../atoms/ExternalLink";
import { RichLinkCard } from "./RichLinkCard";

type Props = { children: string };

export const MarkdownRenderer: React.VFC<Props> = ({ children }) => {
  return (
    <div>
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
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

const MDLink: Components["a"] = ({ node, href, ...props }) => {
  if (!href) return <span>(href 忘れてるかも){props.children}</span>;

  // a link to same domain
  if (href.startsWith("#") || href.startsWith("/") || href.includes("stin.ink")) {
    return <Link {...props} href={href} />;
  }

  return <Link {...props} href={href} isExternal />;
};

const Heading1: Components["h1"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h1" fontSize="2xl" />;
};

const Heading2: Components["h2"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h2" fontSize="xl" />;
};

const Heading3: Components["h3"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h3" fontSize="xl" />;
};

const Heading4: Components["h4"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h4" fontSize="xl" />;
};

const Heading5: Components["h5"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h5" fontSize="xl" />;
};

const Heading6: Components["h6"] = ({ level, node, ...props }) => {
  return <Heading {...props} as="h6" fontSize="xl" />;
};

const Code: Components["code"] = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <Prism style={prismStyle} language={match[1]} PreTag="div" {...props}>
      {String(children).replace(/\n$/, "")}
    </Prism>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const Paragraph: Components["p"] = ({ node, ...props }) => {
  const child = node.children[0];
  if (
    node.children.length === 1 &&
    child.type === "element" &&
    child.tagName === "a" &&
    typeof child.properties?.href === "string" &&
    child.children[0].type === "text" &&
    child.properties.href === child.children[0].value
  ) {
    return <RichLinkCard href={child.properties.href} isExternal />;
  }

  return <Text {...props} />;
};
