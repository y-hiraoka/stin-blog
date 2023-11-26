import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaggedArticles } from "@/components/pages/TaggedArticles";
import { getAllArticleTags, getSortedArticles } from "@/lib/posts";

type Params = {
  tagName: string;
};

export const generateStaticParams = async () => {
  const tags = getAllArticleTags();

  return tags.map((tag) => ({ tagName: tag }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const tagName = decodeURIComponent(params.tagName);

  const articles = getSortedArticles().filter((article) =>
    article.tags.includes(tagName),
  );

  if (articles.length === 0) {
    return notFound();
  }

  return {
    title: `tag: ${params.tagName}`,
    description: `${params.tagName} でタグ付けされた記事一覧`,
    alternates: {
      canonical: `/tags/${params.tagName}`,
    },
    openGraph: {
      type: "website",
      url: `/tags/${params.tagName}`,
      title: `tag: ${params.tagName}`,
      description: `${params.tagName} でタグ付けされた記事一覧`,
    },
  };
};

const TagPage: React.FC<{ params: Params }> = async ({ params }) => {
  const tagName = decodeURIComponent(params.tagName);

  const articles = getSortedArticles().filter((article) =>
    article.tags.includes(tagName),
  );

  if (articles.length === 0) notFound();

  return <TaggedArticles tagName={tagName} articles={articles} />;
};

export default TagPage;
