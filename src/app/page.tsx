import { Metadata } from "next";
import { FC } from "react";
import { Home } from "@/components/pages/Home";
import { getSortedArticles } from "@/lib/posts";

const TestPage: FC = async () => {
  return <Home articles={getSortedArticles()} />;
};

export default TestPage;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
