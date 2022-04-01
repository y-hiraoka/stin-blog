import { getAllArticleTags, getSortedArticleHeaders } from "../../lib/posts";
import { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { ArticleHeader } from "../../models";
import { TaggedArticles } from "../../components/pages/TaggedArticles";
import { SEO } from "../../components/shared/SEO";

type Props = {
  tagName: string;
  articles: ArticleHeader[];
};

const Post: NextPage<Props> = ({ articles, tagName }) => {
  return (
    <>
      <SEO
        type="website"
        pagePath={`/tags/${tagName}`}
        title={`tag: ${tagName}`}
        description={`"${tagName}" でタグ付けされた記事一覧`}
      />
      <TaggedArticles tagName={tagName} articles={articles} />
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await getAllArticleTags();

  return {
    paths: tags.map(tag => ({ params: { tagName: tag.name } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, { tagName: string }> = async ({
  params,
}) => {
  if (!params) throw new Error("Component file name must has params.");

  const articles = await getSortedArticleHeaders();

  return {
    props: {
      tagName: params.tagName,
      articles: articles.filter(article => article.tags.includes(params.tagName)),
    },
  };
};
