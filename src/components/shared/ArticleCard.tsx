import Image from "next/image";
import NextLink from "next/link";
import { FC } from "react";
import ogimageBase from "../../../assets/article-ogimage-base.png";
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
          className={classes.link}
        >
          <span className={classes.thumbnail}>
            <Image
              src={ogimageBase}
              alt=""
              priority={imagePriority}
              sizes="(max-width: 640px) 100vw, 400px"
            />
            <span className={classes.title}>{article.title}</span>
          </span>
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
