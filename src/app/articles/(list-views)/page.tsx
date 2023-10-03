import { Metadata } from "next";
import { Articles } from "../../../components/pages/Articles";
import { getSortedArticleHeaders } from "../../../lib/posts";
import { config } from "../../../config";

const ArticlesPage: React.FC = async () => {
  const articles = await getSortedArticleHeaders();

  return <Articles articles={articles} />;
};

export default ArticlesPage;

export const metadata: Metadata = {
  title: "記事一覧",
  description: "すてぃんのブログの記事一覧ページです",
  openGraph: {
    type: "website",
    url: `${config.siteUrl}/articles`,
    title: "記事一覧",
    description: "すてぃんのブログの記事一覧ページです",
  },
};
