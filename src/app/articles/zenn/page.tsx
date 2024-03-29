import { Metadata } from "next";
import { ZennArticles } from "@/components/pages/ZennArticles";
import { getZennArticles } from "@/lib/posts";

const ZennArticlesPage: React.FC = async () => {
  const articles = await getZennArticles();

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
    url: `/articles/zenn`,
    title: "Zennの記事一覧",
    description: "すてぃんが Zenn に投稿した記事一覧ページです",
  },
};
