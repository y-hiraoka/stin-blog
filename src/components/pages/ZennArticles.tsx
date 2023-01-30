import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import { zennArticlesStyles } from "./ZennArticles.css";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  articles: ArticleHeader[];
};

export const ZennArticles: FC<Props> = ({ articles }) => {
  return (
    <div>
      <Header />
      <main className={zennArticlesStyles.container}>
        <div className={zennArticlesStyles.title}>
          <PageTitle>Zenn Articles</PageTitle>
        </div>
        <ArticlesNavigation />
        <div className={zennArticlesStyles.articleList}>
          <ArticleList articles={articles} />
        </div>
      </main>
      <Footer />
    </div>
  );
};
