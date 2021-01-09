import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "./MarkdownRenderer.module.css";

type Props = { mdText: string };

export const MarkdownRenderer: React.VFC<Props> = ({ mdText }) => {
  return (
    <div className={styles.markdownBody}>
      <ReactMarkdown>{mdText}</ReactMarkdown>
    </div>
  );
};
