import { Feed } from "feed";
import { config } from "../config";
import { getSortedArticleHeaders } from "./posts";

export const generateFeed = async () => {
  const posts = await getSortedArticleHeaders();

  const feed = new Feed({
    id: config.siteUrl,
    title: config.siteTitle,
    copyright: `All right reserved 2020, ${config.social.twitter}`,
    language: "ja",
    description: "すてぃんの個人ブログ",
    link: config.siteUrl,
    image: `${config.siteUrl}/images/ogimage.png`,
    favicon: `${config.siteUrl}/favicon.ico`,
  });

  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: post.slug,
      link: `${config.siteUrl}/articles/${post.slug}`,
      description: post.excerpt,
      date: new Date(post.createdAt),
    });
  });

  return feed.rss2();
};
