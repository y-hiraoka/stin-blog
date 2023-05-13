import { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { pagesPath } from "../../lib/$path";
import classes from "./ArticlesNavigation.module.scss";

export const ArticlesNavigation: FC = () => {
  const { pathname } = useRouter();

  return (
    <nav className={classes.root}>
      <NextLink
        href={pagesPath.articles.$url()}
        className={classes.link}
        data-is-active={pathname === "/articles"}>
        Blog
      </NextLink>
      <NextLink
        href={pagesPath.articles.zenn.$url()}
        className={classes.link}
        data-is-active={pathname === "/articles/zenn"}>
        Zenn
      </NextLink>
    </nav>
  );
};
