import React from "react";
import ReactMarkdown from "react-markdown";
import remarkSlug from "remark-slug";
import remarkGfm from "remark-gfm";
import { Prism } from "react-syntax-highlighter";
import { a11yDark as prismStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import styles from "./MarkdownRenderer.module.css";
import { ExternalLink } from "../atoms/ExternalLink";

type Props = { children: string };

export const MarkdownRenderer: React.VFC<Props> = ({ children }) => {
  return (
    <div className={styles.markdownBody}>
      <ReactMarkdown
        allowDangerousHtml
        plugins={[remarkSlug, remarkGfm]}
        renderers={{
          link: Link,
          heading: Heading,
          code: Code,
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

type LinkProps = {
  href?: string;
};

const Link: React.FC<LinkProps> = ({ children, href }) => {
  if (!href) return <span>(href 忘れてるかも){children}</span>;

  // a link to same domain
  if (href.startsWith("#") || href.startsWith("/") || href.includes("stin.ink")) {
    return <a href={href} children={children} />;
  }

  return <ExternalLink href={href} children={children} />;
};

type HeadingProps = {
  level: string;
  node: {
    data: { id: string };
  };
};

const Heading: React.FC<HeadingProps> = props => {
  return React.createElement(
    `h${props.level}`,
    { id: props.node.data.id },
    props.children,
  );
};

type CodeProps = {
  language: string | null;
  value: string;
};

const Code: React.VFC<CodeProps> = props => {
  return (
    <Prism language={props.language ?? undefined} style={prismStyle}>
      {props.value}
    </Prism>
  );
};
