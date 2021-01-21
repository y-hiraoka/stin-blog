export type Tag = { name: string; itemCount: number };

export type FrontMatter = {
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
};

export type ArticleHeader = {
  slug: string;
  matterData: FrontMatter;
  excerpt: string;
};

export type Article = {
  header: ArticleHeader;
  bodyMdText: string;
  tocMdText: string;
};
