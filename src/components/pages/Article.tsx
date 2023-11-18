import { FC } from "react";
import { Datetime } from "../shared/Datetime";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { TagLink } from "../shared/TagLink";
import { Article as IArticle } from "../../models";
import { FaTwitter } from "react-icons/fa";
import classes from "./Article.module.scss";
import { createIntentTweetLink } from "../../lib/createIntentTweetLink";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { TableOfContents } from "../shared/TableOfContents";

type Props = {
  article: IArticle;
};

export const Article: FC<Props> = ({ article }) => {
  return (
    <div className={classes.layout}>
      <div className={classes.article}>
        <div>
          <h1 className={classes.articleTitle}>{article.header.title}</h1>
          <p className={classes.createdAt}>
            <Datetime format="yyyy/MM/dd HH:mm" datetime={article.header.createdAt} />
          </p>
          <ul className={classes.tags}>
            {article.header.tags.map((tag) => (
              <li key={tag}>
                <TagLink tag={tag} />
              </li>
            ))}
          </ul>
        </div>
        <hr className={classes.contentDivider} />
        <section>
          <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
        </section>
        <hr className={classes.contentDivider} />
        <section>
          <div>
            <a
              className={classes.tweetLink}
              href={createIntentTweetLink({
                text: article.header.title,
                url: `https://blog.stin.ink/articles/${article.header.slug}`,
                hashtags: article.header.tags,
                via: "stin_factory",
              })}>
              <FaTwitter />
              記事をシェア
            </a>
          </div>
          <div>
            <Link className={classes.articlesLink} href="/">
              <MdArrowBack />
              記事一覧へ
            </Link>
          </div>
        </section>
      </div>
      <div>
        <div className={classes.toc}>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
};
