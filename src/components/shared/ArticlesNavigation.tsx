"use client";

import { FC } from "react";
import NextLink from "next/link";
import classes from "./ArticlesNavigation.module.scss";
import { usePathname } from "next/navigation";

export const ArticlesNavigation: FC = () => {
  const pathname = usePathname();

  return (
    <nav className={classes.root}>
      <NextLink
        href="/articles"
        className={classes.link}
        aria-current={pathname === "/articles" ? "page" : false}>
        Blog
      </NextLink>
      <NextLink
        href="/articles/zenn"
        className={classes.link}
        aria-current={pathname === "/articles/zenn" ? "page" : false}>
        Zenn
      </NextLink>
    </nav>
  );
};
