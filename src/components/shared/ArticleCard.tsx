import Image from "next/image";
import NextLink from "next/link";
import { FC } from "react";
import { config } from "../../config";
import { pagesPath } from "../../lib/$path";
import { getFaviconUrl } from "../../lib/getFaviconUrl";
import { ArticleHeader } from "../../models";
import classes from "./ArticleCard.module.scss";
import { Datetime } from "./Datetime";
import { TagLink } from "./TagLink";

type Props = { article: ArticleHeader };

export const ArticleCard: FC<Props> = ({ article }) => {
  return (
    <article className={classes.card}>
      <Datetime
        className={classes.publishedAt}
        datetime={article.createdAt}
        format="yyyy年MM月dd日 HH時mm分"
      />
      <h3 className={classes.title}>
        {article.type === "stin-blog" ? (
          <NextLink
            className={classes.titleLink}
            href={pagesPath.articles._slug(article.slug).$url()}>
            {article.title}
          </NextLink>
        ) : (
          <a
            className={classes.titleLink}
            href={article.url}
            target="_blank"
            rel="noreferrer">
            {article.title}
          </a>
        )}
      </h3>
      {article.type === "stin-blog" ? (
        <ul className={classes.tags}>
          {article.tags.map(tag => (
            <li key={tag}>
              <TagLink tag={tag} />
            </li>
          ))}
        </ul>
      ) : (
        <a
          className={classes.zennLink}
          href={`https://zenn.dev/${config.social.zenn}`}
          target="_blank"
          rel="noreferrer">
          <Image src={getFaviconUrl("zenn.dev", 16)} alt="" width={16} height={16} />
          <span>Zenn</span>
        </a>
      )}
    </article>
  );
};
