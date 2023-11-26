import { Article, allArticles } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import RssParser from "rss-parser";
import { config } from "@/config";
import { BlogArticle, ZennArticle } from "@/models";

export async function getZennArticles(): Promise<ZennArticle[]> {
  const parser = new RssParser();
  const xmlText = await fetch(`https://zenn.dev/${config.social.zenn}/feed?all=1`, {
    next: { revalidate: 60 * 60 * 24 },
  }).then((res) => res.text());
  const feed = await parser.parseString(xmlText);

  return feed.items.map((item) => ({
    type: "zenn",
    title: item.title ?? "",
    createdAt: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString(),
    url: item.link ?? "",
    thumbnail: item.enclosure?.url ?? "",
  }));
}

export function getSortedArticles(): BlogArticle[] {
  return allArticles
    .slice()
    .sort((a, b) => compareDesc(new Date(a.createdAt), new Date(b.createdAt)));
}

export function getAllArticleTags(): string[] {
  const tags = new Set<string>();

  allArticles.forEach((article) => {
    article.tags.forEach((tag) => {
      tags.add(tag);
    });
  });

  return Array.from(tags);
}

export function getArticle(slug: string): Article | undefined {
  return allArticles.find((article) => article.slug === slug);
}
