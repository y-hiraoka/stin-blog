import React from "react";
import { ArticleHeader, Tag } from "../models";
import { ContentsLayout } from "../molecules/ContentsLayout";
import { TagLinks } from "../atoms/TagLinks";
import { ArticleList } from "../atoms/ArticleList";

type Props = {
  articles: ArticleHeader[];
  tags: Tag[];
};

export const Root: React.VFC<Props> = ({ articles, tags }) => {
  return (
    <ContentsLayout sidemenu={<TagLinks tags={tags} />}>
      <ArticleList articles={articles} />
    </ContentsLayout>
  );
};
