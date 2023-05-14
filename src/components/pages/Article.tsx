import { FC, Suspense } from "react";
import { Datetime } from "../shared/Datetime";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { TagLink } from "../shared/TagLink";
import { Article as IArticle } from "../../models";
import { LinkToArticles } from "../shared/LinkToArticles";
import { TwitterIntentTweet } from "../shared/TwitterIntentTweet";
import { config } from "../../config";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { AdSense } from "../shared/AdSense";
import classes from "./Article.module.scss";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  article: IArticle;
};

export const Article: FC<Props> = ({ article }) => {
  return (
    <main className={classes.container}>
      <div className={classes.articleHeader}>
        <PageTitle>{article.header.title}</PageTitle>
        <div className={classes.datetimes}>
          <p className={classes.datetime}>
            公開:{" "}
            <Datetime
              format="yyyy年MM月dd日 HH時mm分"
              datetime={article.header.createdAt}
            />
          </p>
          {article.header.updatedAt && (
            <p className={classes.datetime}>
              更新:{" "}
              <Datetime
                format="yyyy年MM月dd日 HH時mm分"
                datetime={article.header.updatedAt}
              />
            </p>
          )}
        </div>
        <ul className={classes.tags}>
          {article.header.tags.map(tag => (
            <li key={tag}>
              <TagLink tag={tag} />
            </li>
          ))}
        </ul>
      </div>
      <hr className={classes.contentDivider} />
      <section className={classes.articleContent}>
        <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
      </section>
      <section className={classes.adsense}>
        <Suspense fallback={null}>
          <AdSense />
        </Suspense>
      </section>
      <section className={classes.externalLinks}>
        <div className={classes.shareButtons}>
          <TwitterIntentTweet
            className={classes.twitterButton}
            text={article.header.title}
            url={`${config.siteUrl}/articles/${article.header.slug}`}
            hashtags={article.header.tags}
            via={config.social.twitter}>
            <FaTwitter />
            記事をシェア
          </TwitterIntentTweet>
        </div>
        <a
          className={classes.githubLink}
          href={`${config.repository}/tree/main/contents/${article.header.slug}.md`}
          rel="noreferrer">
          <FaGithub className={classes.githubIcon} />
          GitHub で修正をリクエストする
        </a>
      </section>
      <div className={classes.linkToArticles}>
        <LinkToArticles />
      </div>
    </main>
  );
};
