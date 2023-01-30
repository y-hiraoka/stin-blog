import { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { pagesPath } from "../../lib/$path";
import { articlesNavigationStyles } from "./ArticlesNavigation.css";

export const ArticlesNavigation: FC = () => {
  const { pathname } = useRouter();

  return (
    <nav className={articlesNavigationStyles.root}>
      <NextLink
        href={pagesPath.articles.$url()}
        className={articlesNavigationStyles.link}
        data-is-active={pathname === "/articles"}>
        Blog
      </NextLink>
      <NextLink
        href={pagesPath.articles.zenn.$url()}
        className={articlesNavigationStyles.link}
        data-is-active={pathname === "/articles/zenn"}>
        Zenn
      </NextLink>
    </nav>
  );
};
