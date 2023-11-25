import { FC } from "react";
import { BlogArticleHeader } from "../../models";
import { ArticleList } from "../shared/ArticleList";
import { PageTitle } from "../shared/PageTitle";
import { TagLink } from "../shared/TagLink";
import classes from "./TaggedArticles.module.scss";

type Props = {
  tagName: string;
  articles: BlogArticleHeader[];
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
