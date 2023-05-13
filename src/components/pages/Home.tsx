import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { LinkToArticles } from "../shared/LinkToArticles";
import { ArticleHeader } from "../../models";
import { PageTitle } from "../shared/PageTitle";
import classes from "./Home.module.scss";

type Props = {
  articles: ArticleHeader[];
};

export const Home: FC<Props> = ({ articles }) => {
  return (
    <main className={classes.container}>
      <div className={classes.title}>
        <PageTitle>Home</PageTitle>
      </div>
      <ArticleList articles={articles} />
      <div className={classes.linkToArticles}>
        <LinkToArticles />
      </div>
    </main>
  );
};
