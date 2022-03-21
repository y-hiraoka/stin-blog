export type Tag = { name: string; itemCount: number };

type ArticleHeaderBase = {
  title: string;
  createdAt: string;
};

export type BlogArticleHeader = ArticleHeaderBase & {
  type: "stin-blog";
  slug: string;
  tags: string[];
  excerpt: string;
  updatedAt: string | null;
};

export type ZennArticleHeader = ArticleHeaderBase & {
  type: "zenn";
  url: string;
};

export type ArticleHeader = BlogArticleHeader | ZennArticleHeader;

export type Article = {
  header: BlogArticleHeader;
  bodyMdText: string;
  tocMdText: string;
};
