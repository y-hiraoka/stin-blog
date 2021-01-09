import React from "react";
import { Article as IArticle } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import { Toc } from "../atoms/Toc";
import styles from "../molecules/MarkdownRenderer.module.css";

type Props = {
  article: IArticle;
};

export const Article: React.VFC<Props> = ({ article }) => {
  return (
    <ContentsLayout sidemenu={<Toc tocMdText={article.tocMdText} />}>
      <article>
        <div
          className={styles.markdownBody}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </article>
    </ContentsLayout>
  );
};
