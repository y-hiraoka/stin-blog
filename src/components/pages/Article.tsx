import Link from "next/link";
import { FC } from "react";
import { FaTwitter } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Datetime } from "../shared/Datetime";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { TableOfContents } from "../shared/TableOfContents";
import { TagLink } from "../shared/TagLink";
import classes from "./Article.module.scss";
import { createIntentTweetLink } from "@/lib/createIntentTweetLink";
import { BlogArticle } from "@/models";

type Props = {
  article: BlogArticle;
};

export const Article: FC<Props> = ({ article }) => {
  return (
    <div className={classes.layout}>
      <div className={classes.article}>
        <div>
          <h1 className={classes.articleTitle}>{article.title}</h1>
          <p className={classes.createdAt}>
            <Datetime format="yyyy/MM/dd HH:mm" datetime={article.createdAt} />
          </p>
          <ul className={classes.tags}>
            {article.tags.map((tag) => (
              <li key={tag}>
                <TagLink tag={tag} />
              </li>
            ))}
          </ul>
        </div>
        <hr className={classes.contentDivider} />
        <section>
          <MarkdownRenderer>{article.body.raw}</MarkdownRenderer>
        </section>
        <hr className={classes.contentDivider} />
        <section>
          <div>
            <a
              className={classes.tweetLink}
              href={createIntentTweetLink({
                text: article.title,
                url: `https://blog.stin.ink/articles/${article.slug}`,
              })}
            >
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
