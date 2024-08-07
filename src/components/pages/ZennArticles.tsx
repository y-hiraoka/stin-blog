import Image from "next/image";
import { FC } from "react";
import { PageTitle } from "../shared/PageTitle";
import classes from "./ZennArticles.module.scss";
import { ZennArticle } from "@/models";

type Props = {
  articles: ZennArticle[];
};

export const ZennArticles: FC<Props> = ({ articles }) => {
  return (
    <div>
      <div className={classes.title}>
        <PageTitle>Posted on Zenn</PageTitle>
      </div>
      <ul className={classes.articleList}>
        {articles.map((article, index) => (
          <li key={index}>
            <a
              className={classes.articleListItem}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={article.thumbnail}
                alt={article.title}
                width={1200}
                height={630}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
