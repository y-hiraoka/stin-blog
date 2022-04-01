import { getSortedArticleHeaders, getZennArticleHeaders } from "../lib/posts";
import { GetStaticProps, NextPage } from "next";
import { ArticleHeader } from "../models";
import { Home } from "../components/pages/Home";
import { SEO } from "../components/shared/SEO";

type Props = {
  articles: ArticleHeader[];
};

const HomePage: NextPage<Props> = ({ articles }) => {
  return (
    <>
      <SEO type="website" pagePath="/" title="Home" description="すてぃんの技術ブログ" />
      <Home articles={articles} />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles = await getSortedArticleHeaders();
  const zennArticles = await getZennArticleHeaders();

  const result = ([] as ArticleHeader[])
    .concat(articles)
    .concat(zennArticles)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  return {
    props: { articles: result },
    revalidate: 60 * 60 * 24,
  };
};
