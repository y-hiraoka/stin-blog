import { getAllPostSlugs, getArticleData } from "../../lib/posts";
import { GetStaticProps, GetStaticPaths } from "next";
import { Article as IArticle } from "../../models";
import { Article } from "../../templates/Article";
import { SEO } from "../../components/SEO";

type Props = { article: IArticle };

export default function Post({ article }: Props) {
  return (
    <>
      <SEO title={article.header.title} description={article.header.excerpt} />
      <Article article={article} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllPostSlugs();

  return {
    fallback: false,
    paths: slugs.map(slug => ({ params: { slug } })),
  };
};

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({
  params,
}) => {
  if (!params) throw new Error("Component file name must has params.");

  const article = await getArticleData(params.slug);
  return {
    props: { article },
  };
};
