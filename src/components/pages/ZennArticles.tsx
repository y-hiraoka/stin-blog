import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticleHeader } from "../../models";
import classes from "./ZennArticles.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  articles: ArticleHeader[];
};

export const ZennArticles: FC<Props> = ({ articles }) => {
  return (
    <main className={classes.container}>
      <div className={classes.title}>
        <PageTitle>Zenn Articles</PageTitle>
      </div>
      <div className={classes.articleList}>
        <ArticleList articles={articles} />
      </div>
    </main>
  );
};
