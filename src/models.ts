export type Tag = { name: string; itemCount: number };

export type FrontMatter = {
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
};

export type ArticleHeader = {
  slug: string;
  matterData: FrontMatter;
};

export type Article = {
  header: ArticleHeader;
  body: string;
  tocMdText: string;
};
