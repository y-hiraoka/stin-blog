import { ZennArticles } from "../../../../components/pages/ZennArticles";
import { getMetadata } from "../../../../lib/getMetadata";
import { getZennArticleHeaders } from "../../../../lib/posts";

// @ts-expect-error
const ZennArticlesPage: React.FC = async () => {
  const articles = await getZennArticleHeaders();

  return <ZennArticles articles={articles} />;
};

export default ZennArticlesPage;
export const metadata = getMetadata({
  type: "website",
  pagePath: "/articles/zenn",
  title: "Zennの記事一覧",
  description: "すてぃんが Zenn に投稿した記事一覧ページです",
});
