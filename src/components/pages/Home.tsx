import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { BlogArticleHeader } from "../../models";
import classes from "./Home.module.scss";

type Props = {
  articles: BlogArticleHeader[];
};

export const Home: FC<Props> = ({ articles }) => {
  return (
    <main className={classes.container}>
      <ArticleList articles={articles} />
    </main>
  );
};
