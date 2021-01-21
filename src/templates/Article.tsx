import React from "react";
import { Article as IArticle } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import { Toc } from "../atoms/Toc";
import { MarkdownRenderer } from "../molecules/MarkdownRenderer";
import { ArticleHeader } from "../atoms/ArticleHeader";
import styles from "./Article.module.css";
import { ExternalLink } from "../atoms/ExternalLink";
import { GitHubIcon } from "../atoms/GitHubIcon";

type Props = {
  article: IArticle;
};

export const Article: React.VFC<Props> = ({ article }) => {
  return (
    <ContentsLayout sidemenu={<Toc tocMdText={article.tocMdText} />}>
      <ArticleHeader article={article.header} />
      <article className={styles.article}>
        <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
      </article>
      <div className={styles.articleFooter}>
        <ExternalLink
          className={styles.githubLink}
          href={`https://github.com/y-hiraoka/stin-blog`}>
          <GitHubIcon className={styles.githubIcon} /> 質問、修正リクエストはGitHubまで
        </ExternalLink>
      </div>
    </ContentsLayout>
  );
};
