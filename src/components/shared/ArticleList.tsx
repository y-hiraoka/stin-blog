import { FC } from "react";
import { ArticleHeader } from "../../models";
import { ArticleCard } from "./ArticleCard";
import { articleListStyle } from "./ArticleList.css";

type Props = { articles: ArticleHeader[] };

export const ArticleList: FC<Props> = ({ articles }) => {
  return (
    <div className={articleListStyle}>
      {articles.map(article => (
        <ArticleCard
          key={article.type === "stin-blog" ? article.slug : article.url}
          article={article}
        />
      ))}
    </div>
  );
};
