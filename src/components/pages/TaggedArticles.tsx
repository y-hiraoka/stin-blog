import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { PageTitle } from "../shared/PageTitle";
import { TagLink } from "../shared/TagLink";
import classes from "./TaggedArticles.module.scss";
import { BlogArticle } from "@/models";

type Props = {
  tagName: string;
  articles: BlogArticle[];
};

export const TaggedArticles: FC<Props> = ({ tagName, articles }) => {
  return (
    <div>
      <div className={classes.titleSection}>
        <PageTitle>Tagged with</PageTitle>
        <TagLink tag={tagName} />
      </div>
      <ArticleList articles={articles} />
    </div>
  );
};
