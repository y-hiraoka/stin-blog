import Link from "next/link";
import { ArticleHeader } from "../models";
import { ArrowAltCircleRightIcon } from "./ArrowAltCircleRightIcon";
import styles from "./PreviousArticle.module.css";

type Props = { article: ArticleHeader };

export const PreviousArticle: React.VFC<Props> = ({ article }) => {
  return (
    <Link href={`/articles/${article.slug}`}>
      <a className={styles.root}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>{article.matterData.title}</div>
        </div>
        <div className={styles.iconWrapper}>
          <ArrowAltCircleRightIcon className={styles.icon} />
        </div>
      </a>
    </Link>
  );
};
