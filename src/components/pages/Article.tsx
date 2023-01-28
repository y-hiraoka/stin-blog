import { FC } from "react";
import { Datetime } from "../shared/Datetime";
import { Footer } from "../shared/Footer";
import { Header } from "../shared/Header";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { TagLink } from "../shared/TagLink";
import { Article as IArticle } from "../../models";
import { LinkToArticles } from "../shared/LinkToArticles";
import { TwitterIntentTweet } from "../shared/TwitterIntentTweet";
import { config } from "../../config";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { AdSense } from "../shared/AdSense";
import { articleStyles } from "./Article.css";
import { PageTitle } from "../shared/PageTitle";

type Props = {
  article: IArticle;
};

export const Article: FC<Props> = ({ article }) => {
  return (
    <div>
      <Header />
      <main className={articleStyles.container}>
        <div className={articleStyles.articleHeader}>
          <PageTitle>{article.header.title}</PageTitle>
          <div className={articleStyles.datetimes}>
            <p className={articleStyles.datetime}>
              公開:{" "}
              <Datetime
                format="yyyy年MM月dd日 HH時mm分"
                datetime={article.header.createdAt}
              />
            </p>
            {article.header.updatedAt && (
              <p className={articleStyles.datetime}>
                更新:{" "}
                <Datetime
                  format="yyyy年MM月dd日 HH時mm分"
                  datetime={article.header.updatedAt}
                />
              </p>
            )}
          </div>
          <ul className={articleStyles.tags}>
            {article.header.tags.map(tag => (
              <li key={tag}>
                <TagLink tag={tag} />
              </li>
            ))}
          </ul>
        </div>
        <hr className={articleStyles.contentDivider} />
        <section className={articleStyles.articleContent}>
          <MarkdownRenderer>{article.bodyMdText}</MarkdownRenderer>
        </section>
        <section className={articleStyles.adsense}>
          <AdSense />
        </section>
        <section className={articleStyles.externalLinks}>
          <div className={articleStyles.shareButtons}>
            <TwitterIntentTweet
              className={articleStyles.twitterButton}
              text={article.header.title}
              url={`${config.siteUrl}/articles/${article.header.slug}`}
              hashtags={article.header.tags}
              via={config.social.twitter}>
              <FaTwitter />
              記事をシェア
            </TwitterIntentTweet>
          </div>
          <a
            className={articleStyles.githubLink}
            href={`${config.repository}/tree/main/contents/${article.header.slug}.md`}
            rel="noreferrer">
            <FaGithub className={articleStyles.githubIcon} />
            GitHub で修正をリクエストする
          </a>
        </section>
        <div className={articleStyles.linkToArticles}>
          <LinkToArticles />
        </div>
      </main>
      <Footer />
    </div>
  );
};
