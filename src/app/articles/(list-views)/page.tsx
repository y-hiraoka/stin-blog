import { Articles } from "../../../components/pages/Articles";
import { getMetadata } from "../../../lib/getMetadata";
import { getSortedArticleHeaders } from "../../../lib/posts";

// @ts-expect-error
const ArticlesPage: React.FC = async () => {
  const articles = await getSortedArticleHeaders();

  return <Articles articles={articles} />;
};

export default ArticlesPage;
export const metadata = getMetadata({
  type: "website",
  pagePath: "/articles",
  title: "記事一覧",
  description: "すてぃんのブログの記事一覧ページです",
});
