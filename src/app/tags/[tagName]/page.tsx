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
  params: Promise<Params>;
}): Promise<Metadata> => {
  const tagNameRaw = (await params).tagName;
  const tagName = decodeURIComponent(tagNameRaw);

  const articles = getSortedArticles().filter((article) =>
    article.tags.includes(tagName),
  );

  if (articles.length === 0) {
    return notFound();
  }

  return {
    title: `tag: ${tagName}`,
    description: `${tagName} でタグ付けされた記事一覧`,
    alternates: {
      canonical: `/tags/${tagName}`,
    },
    openGraph: {
      type: "website",
      url: `/tags/${tagName}`,
      title: `tag: ${tagName}`,
      description: `${tagName} でタグ付けされた記事一覧`,
    },
  };
};

const TagPage: React.FC<{ params: Promise<Params> }> = async ({ params }) => {
  const tagNameRaw = (await params).tagName;
  const tagName = decodeURIComponent(tagNameRaw);

  const articles = getSortedArticles().filter((article) =>
    article.tags.includes(tagName),
  );

  if (articles.length === 0) notFound();

  return <TaggedArticles tagName={tagName} articles={articles} />;
};

export default TagPage;
