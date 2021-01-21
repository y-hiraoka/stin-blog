import { ArticleHeader as IArticleHeader } from "../models";
import { CreatedAt } from "./CreatedAt";
import { UpdatedAt } from "./UpdatedAt";
import { TagsWithIcon } from "./TagsWithIcon";
import styles from "./ArticleHeader.module.css";

type Props = { article: IArticleHeader };

export const ArticleHeader: React.VFC<Props> = ({ article }) => {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{article.matterData.title}</h1>
      <TagsWithIcon tags={article.matterData.tags} />
      <CreatedAt createdAt={article.matterData.createdAt} />
      {article.matterData.updatedAt && (
        <UpdatedAt updatedAt={article.matterData.updatedAt} />
      )}
    </div>
  );
};
