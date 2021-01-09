import { FrontMatter as IArticleHeader } from "../models";
import { DatetimeWithIcon } from "./DatetimeWithIcon";
import { TagsWithIcon } from "./TagsWithIcon";
import styles from "./ArticleHeader.module.css";

type Props = { article: IArticleHeader };

export const ArticleHeader: React.VFC<Props> = ({ article }) => {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{article.title}</h1>
      <TagsWithIcon tags={article.tags} />
      <DatetimeWithIcon dateString={article.createdAt} />
    </div>
  );
};
