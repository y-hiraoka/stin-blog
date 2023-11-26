import { Article } from "contentlayer/generated";

export type ZennArticle = {
  url: string;
  title: string;
  thumbnail: string;
  createdAt: string;
};

export type BlogArticle = Article;
