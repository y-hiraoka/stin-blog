import NextLink from "next/link";
import { FC } from "react";
import { MdArrowForward } from "react-icons/md";
import { pagesPath } from "../../lib/$path";
import { linkToArticlesStyle } from "./LinkToArticles.css";

export const LinkToArticles: FC = () => {
  return (
    <NextLink className={linkToArticlesStyle} href={pagesPath.articles.$url()}>
      <span>すべての記事一覧へ</span>
      <MdArrowForward />
    </NextLink>
  );
};
