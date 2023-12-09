import { Feed } from "feed";
import { getSortedArticles } from "./posts";
import { SITE_DESCRIPTION, SITE_TITLE, metadataBase } from "@/constants";

export const generateFeed = async () => {
  const posts = getSortedArticles();

  const feed = new Feed({
    id: metadataBase.toString(),
    title: SITE_TITLE,
    copyright: `All right reserved ${new Date().getFullYear()}, stin_factory`,
    language: "ja",
    description: SITE_DESCRIPTION,
    link: metadataBase.toString(),
    image: new URL("/images/opengraph-image.png", metadataBase).toString(),
    favicon: new URL("/favicon.ico", metadataBase).toString(),
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: new URL(`/articles/${post.slug}`, metadataBase).toString(),
      link: new URL(`/articles/${post.slug}`, metadataBase).toString(),
      description: post.excerpt,
      date: new Date(post.createdAt),
      image: {
        url: new URL(`/articles/${post.slug}/opengraph-image`, metadataBase).toString(),
        type: "image/png",
      },
    });
  });

  return feed.rss2();
};
