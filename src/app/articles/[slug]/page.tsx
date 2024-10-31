import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/pages/Article";
import { getArticle } from "@/lib/posts";
import { allArticles } from "contentlayer/generated";

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
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) return notFound();

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `/articles/${slug}`,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt ?? undefined,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      creator: `@stin_factory`,
    },
  };
};

const ArticlePage: React.FC<{
  params: Promise<Params>;
}> = async ({ params }) => {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  return <Article article={article} />;
};

export default ArticlePage;
