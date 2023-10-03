import { FC } from "react";
import { Home } from "../components/pages/Home";
import { ArticleHeader } from "../models";
import { getSortedArticleHeaders, getZennArticleHeaders } from "../lib/posts";

const TestPage: FC = async () => {
  const blogArticles = await getSortedArticleHeaders();
  const zennArticles = await getZennArticleHeaders();

  const articles = ([] as ArticleHeader[])
    .concat(blogArticles)
    .concat(zennArticles)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  return <Home articles={articles} />;
};

export default TestPage;
