import { FC } from "react";
import { BlogArticleHeader } from "../../models";
import { ArticleList } from "../shared/ArticleList";

type Props = {
  articles: BlogArticleHeader[];
};

export const Home: FC<Props> = ({ articles }) => {
  return <ArticleList articles={articles} />;
};
