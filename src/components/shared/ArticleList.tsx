import { FC } from "react";
import { ArticleCard } from "./ArticleCard";
import classes from "./ArticleList.module.scss";
import { BlogArticleHeader } from "@/models";

type Props = { articles: BlogArticleHeader[] };

export const ArticleList: FC<Props> = ({ articles }) => {
  return (
    <div className={classes.articleList}>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
};
