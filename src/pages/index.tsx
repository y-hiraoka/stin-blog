import { getSortedArticleHeaders } from "../lib/posts";
import { GetStaticProps, NextPage } from "next";
import { ArticleHeader as IArticleHeader } from "../models";
import { Root } from "../templates/Root";
import { SEO } from "../components/SEO";

type Props = {
  articles: IArticleHeader[];
};

const Home: NextPage<Props> = ({ articles }: Props) => {
  return (
    <>
      <SEO title="TOP" description="すてぃんの技術ブログ" />
      <Root articles={articles} />
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles = await getSortedArticleHeaders();

  return {
    props: { articles },
  };
};
