import Head from "next/head";
import { getAllArticleTags, getSortedArticleHeaders } from "../lib/posts";
import { GetStaticProps, NextPage } from "next";
import { ArticleHeader as IArticleHeader, Tag } from "../models";
import { Root } from "../templates/Root";
import { SEO } from "../molecules/SEO";

type Props = {
  articles: IArticleHeader[];
  tags: Tag[];
};

const Home: NextPage<Props> = ({ articles, tags }: Props) => {
  return (
    <>
      <SEO title="TOP" description="すてぃんの技術ブログ" />
      <Root articles={articles} tags={tags} />
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles = await getSortedArticleHeaders();
  const tags = await getAllArticleTags();

  return {
    props: {
      articles,
      tags,
    },
  };
};
