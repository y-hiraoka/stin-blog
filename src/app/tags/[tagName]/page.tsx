import { notFound } from "next/navigation";
import { TaggedArticles } from "../../../components/pages/TaggedArticles";
import { getMetadata } from "../../../lib/getMetadata";
import { getAllArticleTags, getSortedArticleHeaders } from "../../../lib/posts";
import { Metadata } from "next";

type Params = {
  tagName: string;
};

export const generateStaticParams = async () => {
  const tags = await getAllArticleTags();

  return tags.map(tag => ({ tagName: tag.name }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const { tagName } = params;
  const articles = await getSortedArticleHeaders().then(articles =>
    articles.filter(article => article.tags.includes(tagName)),
  );

  if (articles.length === 0) {
    return getMetadata({
      type: "website",
      pagePath: `/tags/${params.tagName}`,
      title: "Not Found",
      description: "記事が見つかりませんでした",
      noindex: true,
    });
  }

  return getMetadata({
    type: "website",
    pagePath: `/tags/${params.tagName}`,
    title: `tag: ${params.tagName}`,
    description: `"${params.tagName}" でタグ付けされた記事一覧`,
  });
};

// @ts-expect-error
const TagPage: React.FC<{ params: Params }> = async ({ params }) => {
  const { tagName } = params;
  const articles = await getSortedArticleHeaders().then(articles =>
    articles.filter(article => article.tags.includes(tagName)),
  );

  if (articles.length === 0) notFound();

  return <TaggedArticles tagName={tagName} articles={articles} />;
};

export default TagPage;
