import { getAllArticleTags, getSortedArticleHeaders } from "../../lib/posts";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { ArticleHeader, Tag } from "../../models";
import { TaggedArticles } from "../../templates/TaggedArticles";

type Props = {
  tagName: string;
  articles: ArticleHeader[];
  tags: Tag[];
};

const Post: NextPage<Props> = ({ articles, tagName, tags }) => {
  return (
    <>
      <Head>
        <title>tag: {tagName}</title>
      </Head>
      <TaggedArticles tags={tags} articles={articles} />
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
  const tags = await getAllArticleTags();

  return {
    props: {
      tagName: params.tagName,
      articles: articles.filter(article =>
        article.matterData.tags.includes(params.tagName),
      ),
      tags,
    },
  };
};
