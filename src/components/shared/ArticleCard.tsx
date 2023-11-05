import Image from "next/image";
import NextLink from "next/link";
import { FC } from "react";
import { BlogArticleHeader } from "../../models";
import classes from "./ArticleCard.module.scss";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";

type Props = { article: BlogArticleHeader };

export const ArticleCard: FC<Props> = ({ article }) => {
  return (
    <article className={classes.card}>
      <h3>
        <NextLink href={`/articles/${article.slug}`} className={classes.link}>
          <Image
            width={1200}
            height={630}
            src={`/articles/${article.slug}/opengraph-image`}
            alt={article.title}
          />
        </NextLink>
      </h3>
      <div className={classes.metadata}>
        <Datetime
          className={classes.publishedAt}
          datetime={article.createdAt}
          format="yyyy/MM/dd HH:mm"
        />
        <ul className={classes.tags}>
          {article.tags.map(tag => (
            <li key={tag}>
              <TagLink tag={tag} />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
