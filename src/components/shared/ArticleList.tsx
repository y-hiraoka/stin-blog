import { FC } from "react";
import { ArticleHeader } from "../../models";
import { ArticleCard } from "./ArticleCard";
import classes from "./ArticleList.module.scss";

type Props = { articles: ArticleHeader[] };

export const ArticleList: FC<Props> = ({ articles }) => {
  return (
    <div className={classes.articleList}>
      {articles.map(article => (
        <ArticleCard
          key={article.type === "stin-blog" ? article.slug : article.url}
          article={article}
        />
      ))}
    </div>
  );
};
