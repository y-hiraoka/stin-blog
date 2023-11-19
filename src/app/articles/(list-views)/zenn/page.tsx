import { Metadata } from "next";
import { ZennArticles } from "../../../../components/pages/ZennArticles";
import { getZennArticleHeaders } from "../../../../lib/posts";
import { config } from "../../../../config";

const ZennArticlesPage: React.FC = async () => {
  const articles = await getZennArticleHeaders();

  return <ZennArticles articles={articles} />;
};

export default ZennArticlesPage;

export const metadata: Metadata = {
  title: "Zennの記事一覧",
  description: "すてぃんが Zenn に投稿した記事一覧ページです",
  alternates: {
    canonical: "/articles/zenn",
  },
  openGraph: {
    type: "website",
    url: `${config.siteUrl}/articles/zenn`,
    title: "Zennの記事一覧",
    description: "すてぃんが Zenn に投稿した記事一覧ページです",
  },
};
