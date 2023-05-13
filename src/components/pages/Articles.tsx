import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import { MdRssFeed } from "react-icons/md";
import { pagesPath } from "../../lib/$path";
import classes from "./Articles.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  articles: ArticleHeader[];
};

export const Articles: FC<Props> = ({ articles }) => {
  return (
    <div>
      <Header />
      <main className={classes.page}>
        <div className={classes.titleSection}>
          <PageTitle>Articles</PageTitle>
          <a
            aria-label="RSS Feed を表示"
            title="RSS Feed を表示"
            href={pagesPath.feed.$url().pathname}
            className={classes.rssFeedLink}
            target="_blank"
            rel="noreferrer">
            <MdRssFeed />
          </a>
        </div>
        <ArticlesNavigation />
        <div className={classes.articleList}>
          <ArticleList articles={articles} />
        </div>
      </main>
      <Footer />
    </div>
  );
};
