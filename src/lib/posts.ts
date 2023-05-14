import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import RssParser from "rss-parser";
import strip from "strip-markdown";
import { z } from "zod";
import { Article, BlogArticleHeader, Tag, ZennArticleHeader } from "../models";
import { config } from "../config";

const postsDirectory = path.join(process.cwd(), "contents");

async function getArticleRawData(fileName: string) {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContent = await fs.promises.readFile(fullPath, "utf8");

  return fileContent;
}

const frontMatterSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()),
});
type FrontMatter = z.infer<typeof frontMatterSchema>;
function divideFrontMatterAndContent(markdown: string): {
  frontMatter: FrontMatter;
  content: string;
} {
  const matterResult = matter(markdown);

  const matterData = frontMatterSchema.parse(matterResult.data);

  return {
    frontMatter: matterData,
    content: matterResult.content,
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  const fileNames = await fs.promises.readdir(postsDirectory);

  return fileNames.map(fileName => fileName.replace(/\.md$/, ""));
}

async function getArticleExcerpt(mdText: string): Promise<string> {
  const processed = await remark().use(strip).process(mdText);

  const contentText = processed.toString();

  const excerpt = contentText.trim().replace(/\s+/g, " ").slice(0, config.excerptLength);

  if (contentText.length > config.excerptLength) {
    return excerpt + "...";
  }

  return excerpt;
}

async function getAllArticlesRawData() {
  const slugs = await getAllPostSlugs();

  return await Promise.all(
    slugs.map(async slug => {
      const content = await getArticleRawData(`${slug}.md`);

      return { slug, content };
    }),
  );
}

export async function getSortedArticleHeaders(): Promise<BlogArticleHeader[]> {
  const rawData = await getAllArticlesRawData();

  const headerPromises = rawData.map<Promise<BlogArticleHeader>>(async data => {
    try {
      const { frontMatter, content } = divideFrontMatterAndContent(data.content);

      return {
        type: "stin-blog",
        slug: data.slug,
        tags: frontMatter.tags,
        title: frontMatter.title,
        excerpt: await getArticleExcerpt(content),
        createdAt: new Date(frontMatter.createdAt).toISOString(),
        updatedAt: frontMatter.updatedAt
          ? new Date(frontMatter.updatedAt).toISOString()
          : null,
      };
    } catch (error) {
      console.error(`Error occured in ${data.slug}.`);
      console.error(error);
      throw error;
    }
  });

  // Sort posts by date
  return await Promise.all(headerPromises).then(headers =>
    headers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  );
}

export async function getArticleData(slug: string): Promise<Article> {
  const rawData = await getArticleRawData(`${slug}.md`);

  try {
    const { content, frontMatter } = divideFrontMatterAndContent(rawData);

    const excerpt = await getArticleExcerpt(content);

    return {
      header: {
        type: "stin-blog",
        slug: slug,
        excerpt,
        tags: frontMatter.tags,
        createdAt: new Date(frontMatter.createdAt).toISOString(),
        title: frontMatter.title,
        updatedAt: frontMatter.updatedAt
          ? new Date(frontMatter.updatedAt).toISOString()
          : null,
      },
      bodyMdText: content,
    };
  } catch (error) {
    console.error(`Error occured in ${slug}.`);
    console.error(error);
    throw error;
  }
}

export async function getAllArticleTags(): Promise<Tag[]> {
  const articles = await getAllArticlesRawData();

  const tagsList = articles.map(article => {
    try {
      const { frontMatter } = divideFrontMatterAndContent(article.content);

      return frontMatter.tags;
    } catch (error) {
      console.error(`Error occured in ${article.slug}.`);
      console.error(error);
      throw error;
    }
  });

  const tagsCount = {} as Record<string, number>;

  tagsList.forEach(tags => {
    tags.forEach(tag => {
      tagsCount[tag] = tagsCount[tag] !== undefined ? tagsCount[tag] + 1 : 1;
    });
  });

  return Object.entries(tagsCount).map(([key, count]) => ({
    name: key,
    itemCount: count,
  }));
}

export async function getZennArticleHeaders(): Promise<ZennArticleHeader[]> {
  const parser = new RssParser();
  const xmlText = await fetch(`https://zenn.dev/${config.social.zenn}/feed?all=1`, {
    next: { revalidate: 60 * 60 * 24 },
  }).then(res => res.text());
  const feed = await parser.parseString(xmlText);

  return feed.items.map(item => ({
    type: "zenn",
    title: item.title ?? "",
    createdAt: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString(),
    url: item.link ?? "",
  }));
}
