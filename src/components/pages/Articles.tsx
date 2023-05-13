import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticleHeader } from "../../models";
import { MdRssFeed } from "react-icons/md";
import classes from "./Articles.module.scss";
import { PageTitle } from "../shared/PageTitle";
import Link from "next/link";

type Props = {
  articles: ArticleHeader[];
};

export const Articles: FC<Props> = ({ articles }) => {
  return (
    <main className={classes.page}>
      <div className={classes.titleSection}>
        <PageTitle>Articles</PageTitle>
        <Link
          aria-label="RSS Feed を表示"
          title="RSS Feed を表示"
          href="/feed"
          className={classes.rssFeedLink}
          target="_blank"
          rel="noreferrer">
          <MdRssFeed />
        </Link>
      </div>
      <div className={classes.articleList}>
        <ArticleList articles={articles} />
      </div>
    </main>
  );
};
