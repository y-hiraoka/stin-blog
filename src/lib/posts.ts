import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import remarkHtml from "remark-html";
import remarkSlug from "remark-slug";
import markdownToc from "markdown-toc";
import { Article, ArticleHeader, FrontMatter, Tag } from "../models";

const postsDirectory = path.join(process.cwd(), "contents");

async function getArticleRawData(fileName: string) {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContent = await fs.promises.readFile(fullPath, "utf8");

  return fileContent;
}

function getFrontMatter(
  slug: string,
  rawData: string,
): { frontMatter: FrontMatter; content: string } {
  const matterResult = matter(rawData);

  const matterData = matterResult.data as Partial<FrontMatter>;

  if (!matterData.title) {
    throw new Error(`${slug}: title is required in front-matter`);
  }

  if (!matterData.createdAt) {
    throw new Error(`${slug}: createdAt is required in front-matter`);
  }

  if (!matterData.updatedAt) {
    throw new Error(`${slug}: updatedAt is required in front-matter`);
  }

  if (!matterData.tags) {
    throw new Error(`${slug}: tags is required in front-matter`);
  }

  return {
    frontMatter: {
      ...matterData,
      title: matterData.title,
      createdAt: matterData.createdAt,
      updatedAt: matterData.updatedAt,
      tags: matterData.tags,
    },
    content: matterResult.content,
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  const fileNames = await fs.promises.readdir(postsDirectory);

  return fileNames.map(fileName => fileName.replace(/\.md$/, ""));
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

export async function getSortedArticleHeaders(): Promise<ArticleHeader[]> {
  const rawData = await getAllArticlesRawData();

  const headers = rawData.map<ArticleHeader>(data => {
    const { frontMatter: fonrtMatter } = getFrontMatter(data.slug, data.content);

    return {
      slug: data.slug,
      matterData: fonrtMatter,
    };
  });

  // Sort posts by date
  return headers.sort((a, b) =>
    a.matterData.createdAt < b.matterData.createdAt ? 1 : -1,
  );
}

export async function getArticleData(slug: string): Promise<Article> {
  const rawData = await getArticleRawData(`${slug}.md`);

  const { content, frontMatter } = getFrontMatter(slug, rawData);

  const contentHtml = await remark().use(remarkHtml).use(remarkSlug).process(content);

  const tocMdText = markdownToc(content).content;

  return {
    header: {
      slug,
      matterData: frontMatter,
    },
    body: contentHtml.toString(),
    tocMdText,
  };
}

export async function getAllArticleTags(): Promise<Tag[]> {
  const articles = await getAllArticlesRawData();

  const tagsList = articles.map(article => {
    const { frontMatter } = getFrontMatter(article.slug, article.content);

    return frontMatter.tags;
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
