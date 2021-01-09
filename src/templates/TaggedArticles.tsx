import React from "react";
import { ArticleList } from "../atoms/ArticleList";
import { TagLinks } from "../atoms/TagLinks";
import { ArticleHeader, Tag } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";

type Props = {
  tags: Tag[];
  articles: ArticleHeader[];
};

export const TaggedArticles: React.VFC<Props> = ({ articles, tags }) => {
  return (
    <ContentsLayout sidemenu={<TagLinks tags={tags} />}>
      <ArticleList articles={articles} />
    </ContentsLayout>
  );
};
