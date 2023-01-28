import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import { MdRssFeed } from "react-icons/md";
import { pagesPath } from "../../lib/$path";
import { articlesStyles } from "./Articles.css";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  articles: ArticleHeader[];
};

export const Articles: FC<Props> = ({ articles }) => {
  return (
    <div>
      <Header />
      <main className={articlesStyles.page}>
        <div className={articlesStyles.titleSection}>
          <PageTitle>Articles</PageTitle>
          <a
            aria-label="RSS Feed を表示"
            title="RSS Feed を表示"
            href={pagesPath.feed.$url().pathname}
            className={articlesStyles.rssFeedLink}
            target="_blank"
            rel="noreferrer">
            <MdRssFeed />
          </a>
        </div>
        <ArticlesNavigation />
        <div className={articlesStyles.articleList}>
          <ArticleList articles={articles} />
        </div>
      </main>
      <Footer />
    </div>
  );
};
