import { Metadata } from "next";
import { Article } from "../../../components/pages/Article";
import { getMetadata } from "../../../lib/getMetadata";
import { getAllPostSlugs, getArticleData } from "../../../lib/posts";
import { notFound } from "next/navigation";

type Params = {
  slug: string;
};

export const generateStaticParams = async () => {
  const slugs = await getAllPostSlugs();

  return slugs.map(slug => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  try {
    const article = await getArticleData(params.slug);

    return getMetadata({
      type: "article",
      pagePath: `/articles/${params.slug}`,
      publishedTime: article.header.createdAt,
      modifiedTime: article.header.updatedAt ?? undefined,
      tags: article.header.tags,
      title: article.header.title,
      description: article.header.excerpt,
    });
  } catch (error) {
    return getMetadata({
      type: "website",
      pagePath: `/articles/${params.slug}`,
      title: "Not Found",
      description: "記事が見つかりませんでした",
      noindex: true,
    });
  }
};

// @ts-expect-error
const ArticlePage: React.FC<{
  params: Params;
}> = async ({ params }) => {
  try {
    const { slug } = params;
    const article = await getArticleData(slug);
    return <Article article={article} />;
  } catch (error) {
    notFound();
  }
};

export default ArticlePage;
