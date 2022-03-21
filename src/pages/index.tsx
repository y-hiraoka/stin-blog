import { getSortedArticleHeaders, getZennArticleHeaders } from "../lib/posts";
import { GetStaticProps, NextPage } from "next";
import { ArticleHeader } from "../models";
import { Root } from "../templates/Root";
import { SEO } from "../components/SEO";

type Props = {
  articles: ArticleHeader[];
};

const Home: NextPage<Props> = ({ articles }) => {
  return (
    <>
      <SEO title="Home" description="すてぃんの技術ブログ" />
      <Root articles={articles} />
    </>
  );
};

export default Home;

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
