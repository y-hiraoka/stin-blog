import { Article } from "markdown-contents";

export type ZennArticle = {
  url: string;
  title: string;
  thumbnail: string;
  createdAt: string;
};

export type BlogArticle = Article;
