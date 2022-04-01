import { GetStaticProps, NextPage } from "next";
import { SEO } from "../../components/shared/SEO";
import { getSortedArticleHeaders } from "../../lib/posts";
import { ArticleHeader } from "../../models";
import { Articles } from "../../components/pages/Articles";

type Props = {
  articles: ArticleHeader[];
};

const ArticlesPage: NextPage<Props> = ({ articles }) => {
  return (
    <>
      <SEO
        type="website"
        pagePath="/articles"
        title="記事一覧"
        description="すてぃんのブログの記事一覧ページです"
      />
      <Articles articles={articles} />
    </>
  );
};
export default ArticlesPage;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles = await getSortedArticleHeaders();

  return {
    props: { articles },
  };
};
