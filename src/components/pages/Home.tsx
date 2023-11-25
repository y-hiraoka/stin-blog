import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { BlogArticleHeader } from "@/models";

type Props = {
  articles: BlogArticleHeader[];
};

export const Home: FC<Props> = ({ articles }) => {
  return <ArticleList articles={articles} />;
};
