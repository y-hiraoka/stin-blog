import { FC } from "react";
import { ArticleCard } from "./ArticleCard";
import classes from "./ArticleList.module.scss";
import { BlogArticle } from "@/models";

type Props = { articles: BlogArticle[] };

export const ArticleList: FC<Props> = ({ articles }) => {
  return (
    <div className={classes.articleList}>
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
};
