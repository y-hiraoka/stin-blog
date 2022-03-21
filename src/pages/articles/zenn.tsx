import { GetStaticProps, NextPage } from "next";
import { SEO } from "../../components/shared/SEO";
import { getZennArticleHeaders } from "../../lib/posts";
import { ArticleHeader } from "../../models";
import { ZennArticles } from "../../components/pages/ZennArticles";

type Props = {
  articles: ArticleHeader[];
};

const ZennArticlesPage: NextPage<Props> = ({ articles }) => {
  return (
    <>
      <SEO
        title="Zennの記事一覧"
        description="すてぃんが Zenn に投稿した記事一覧ページです"
      />
      <ZennArticles articles={articles} />
    </>
  );
};
export default ZennArticlesPage;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles = await getZennArticleHeaders();

  return {
    props: { articles },
    revalidate: 60 * 60 * 24,
  };
};
