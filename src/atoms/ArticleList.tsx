import { ArticleHeader } from "../models";
import { ArticleItem } from "./ArticleItem";
import styles from "./ArticleList.module.css";

type Props = { articles: ArticleHeader[] };

export const ArticleList: React.VFC<Props> = props => {
  return (
    <div className={styles.root}>
      {props.articles.map(article => (
        <ArticleItem key={article.slug} article={article} />
      ))}
    </div>
  );
};
