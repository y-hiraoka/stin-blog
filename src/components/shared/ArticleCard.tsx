import Image from "next/image";
import NextLink from "next/link";
import { FC } from "react";
import classes from "./ArticleCard.module.scss";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";
import { BlogArticle } from "@/models";

type Props = {
  article: BlogArticle;
  imagePriority: boolean;
};

export const ArticleCard: FC<Props> = ({ article, imagePriority }) => {
  return (
    <article className={classes.card}>
      <h3>
        <NextLink
          prefetch={false}
          href={`/articles/${article.slug}`}
          className={classes.link}>
          <Image
            width={1200}
            height={630}
            src={`/articles/${article.slug}/opengraph-image`}
            alt=""
            priority={imagePriority}
          />
          <span className={classes.hiddenTitle}>{article.title}</span>
        </NextLink>
      </h3>
      <div className={classes.metadata}>
        <Datetime
          className={classes.publishedAt}
          datetime={article.createdAt}
          format="yyyy/MM/dd HH:mm"
        />
        <ul className={classes.tags}>
          {article.tags.map((tag) => (
            <li key={tag}>
              <TagLink tag={tag} />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
