import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { ArticlesNavigation } from "../shared/ArticlesNavigation";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import classes from "./ZennArticles.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  articles: ArticleHeader[];
};

export const ZennArticles: FC<Props> = ({ articles }) => {
  return (
    <div>
      <Header />
      <main className={classes.container}>
        <div className={classes.title}>
          <PageTitle>Zenn Articles</PageTitle>
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
