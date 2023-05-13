import { FC } from "react";
import { ArticleList } from "../shared/ArticleList";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { ArticleHeader } from "../../models";
import { TagLink } from "../shared/TagLink";
import classes from "./TaggedArticles.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  tagName: string;
  articles: ArticleHeader[];
};

export const TaggedArticles: FC<Props> = ({ tagName, articles }) => {
  return (
    <div>
      <Header />
      <main className={classes.container}>
        <div className={classes.titleSection}>
          <PageTitle>Tagged with</PageTitle>
          <TagLink tag={tagName} />
        </div>
        <ArticleList articles={articles} />
      </main>
      <Footer />
    </div>
  );
};
