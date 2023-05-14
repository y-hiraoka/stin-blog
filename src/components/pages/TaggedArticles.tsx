import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticleHeader } from "../../models";
import { TagLink } from "../shared/TagLink";
import classes from "./TaggedArticles.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  tagName: string;
  articles: ArticleHeader[];
};

export const TaggedArticles: FC<Props> = ({ tagName, articles }) => {
  return (
    <main className={classes.container}>
      <div className={classes.titleSection}>
        <PageTitle>Tagged with</PageTitle>
        <TagLink tag={tagName} />
      </div>
      <ArticleList articles={articles} />
    </main>
  );
};
