import Link from "next/link";
import { ArticleHeader } from "../models";
import { ArrowAltCircleLeftIcon } from "./ArrowAltCircleLeftIcon";
import styles from "./NextArticle.module.css";

type Props = { article: ArticleHeader };

export const NextArticle: React.VFC<Props> = ({ article }) => {
  return (
    <Link href={`/articles/${article.slug}`}>
      <a className={styles.root}>
        <div className={styles.iconWrapper}>
          <ArrowAltCircleLeftIcon className={styles.icon} />
        </div>
        <div className={styles.titleContainer}>
          <div className={styles.title}>{article.matterData.title}</div>
        </div>
      </a>
    </Link>
  );
};
