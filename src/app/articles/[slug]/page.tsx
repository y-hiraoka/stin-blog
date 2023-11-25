import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/pages/Article";
import { config } from "@/config";
import { getAllPostSlugs, getArticleData } from "@/lib/posts";

type Params = {
  slug: string;
};

export const generateStaticParams = async () => {
  const slugs = await getAllPostSlugs();

  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  try {
    const article = await getArticleData(params.slug);

    return {
      title: article.header.title,
      description: article.header.excerpt,
      alternates: {
        canonical: `/articles/${params.slug}`,
      },
      openGraph: {
        type: "article",
        url: `/articles/${params.slug}`,
        title: article.header.title,
        description: article.header.excerpt,
        publishedTime: article.header.createdAt,
        modifiedTime: article.header.updatedAt ?? undefined,
        tags: article.header.tags,
      },
      twitter: {
        card: "summary_large_image",
        creator: `@${config.social.twitter}`,
      },
    };
  } catch (error) {
    return notFound();
  }
};

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
