import { Metadata } from "next";
import { FC } from "react";
import { Home } from "../components/pages/Home";
import { getSortedArticleHeaders } from "../lib/posts";

const TestPage: FC = async () => {
  const blogArticles = await getSortedArticleHeaders();

  return <Home articles={blogArticles} />;
};

export default TestPage;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
