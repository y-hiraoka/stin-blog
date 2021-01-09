import Link from "next/link";
import { ArticleHeader } from "../models";
import { DatetimeWithIcon } from "./DatetimeWithIcon";
import { TagsWithIcon } from "./TagsWithIcon";
import styles from "./ArticleItem.module.css";

type Props = { article: ArticleHeader };

export const ArticleItem: React.VFC<Props> = ({ article }) => {
  const imageUrl = article.matterData.imageUrl ?? "/images/no-image.png";

  return (
    <div className={styles.root}>
      <img className={styles.image} src={imageUrl} alt="article catch" />
      <div className={styles.info}>
        <h2 className={styles.title}>
          <Link href={`/articles/${article.slug}`}>
            <a className={styles.titleLink}>{article.matterData.title}</a>
          </Link>
        </h2>
        <div className={styles.metaInfo}>
          <TagsWithIcon tags={article.matterData.tags} />
          <DatetimeWithIcon dateString={article.matterData.createdAt} />
        </div>
      </div>
    </div>
  );
};
