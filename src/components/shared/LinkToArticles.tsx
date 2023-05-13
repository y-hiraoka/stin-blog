import NextLink from "next/link";
import { FC } from "react";
import { MdArrowForward } from "react-icons/md";
import classes from "./LinkToArticles.module.scss";

export const LinkToArticles: FC = () => {
  return (
    <NextLink className={classes.linkToArticles} href="/articles">
      <span>すべての記事一覧へ</span>
      <MdArrowForward />
    </NextLink>
  );
};
