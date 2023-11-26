import { allArticles } from "contentlayer/generated";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/pages/Article";
import { config } from "@/config";
import { getArticle } from "@/lib/posts";

type Params = {
  slug: string;
};

export const generateStaticParams = async () => {
  const slugs = allArticles.map((article) => article.slug);

  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const article = getArticle(params.slug);

  if (!article) return notFound();

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${params.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/articles/${params.slug}`,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt ?? undefined,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      creator: `@${config.social.twitter}`,
    },
  };
};

const ArticlePage: React.FC<{
  params: Params;
}> = async ({ params }) => {
  const { slug } = params;
  const article = getArticle(slug);

  if (!article) notFound();

  return <Article article={article} />;
};

export default ArticlePage;
