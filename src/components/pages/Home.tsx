import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { BlogArticle } from "@/models";

type Props = {
  articles: BlogArticle[];
};

export const Home: FC<Props> = ({ articles }) => {
  return <ArticleList articles={articles} />;
};
