export type Tag = { name: string; itemCount: number };

export type FrontMatter = {
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
};

export type ArticleHeader = {
  type: "stin-blog";
  slug: string;
  matterData: FrontMatter;
  excerpt: string;
};

export type Article = {
  header: ArticleHeader;
  bodyMdText: string;
  tocMdText: string;
};

export type ZennArticleHeader = {
  type: "zenn";
  url: string;
  title: string;
  pubDate: string;
};
