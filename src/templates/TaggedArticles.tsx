import React from "react";
import { ArticleList } from "../atoms/ArticleList";
import { TagLinks } from "../atoms/TagLinks";
import { ArticleHeader, Tag } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import styles from "./TaggedArticles.module.css";

type Props = {
  tagName: string;
  tags: Tag[];
  articles: ArticleHeader[];
};

export const TaggedArticles: React.VFC<Props> = ({ tagName, articles, tags }) => {
  return (
    <ContentsLayout sidemenu={<TagLinks tags={tags} />}>
      <h1 className={styles.heading}>タグ指定: {tagName}</h1>
      <ArticleList articles={articles} />
    </ContentsLayout>
  );
};
