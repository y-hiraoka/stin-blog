"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { FaGithub } from "react-icons/fa";
import classes from "./Header.module.scss";

export const Header: FC = () => {
  return (
    <header className={classes.header}>
      <NextLink href="/" className={classes.logoLink}>
        <span>stin</span>
        <span className={classes.logoLinkAccent}>&apos;</span>
        <span>s Blog</span>
      </NextLink>
      <nav className={classes.navigation}>
        <NavLinks />
      </nav>
    </header>
  );
};

const NavLinks: FC = () => {
  const pathname = usePathname();

  return (
    <>
      <NextLink
        href="/"
        className={classes.navLink}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        Articles
      </NextLink>
      <NextLink
        href="/articles/zenn"
        className={classes.navLink}
        aria-current={pathname === "/articles/zenn" ? "page" : undefined}
      >
        Zenn
      </NextLink>
      <a
        href="https://github.com/y-hiraoka/stin-blog"
        target="_blank"
        rel="noreferrer"
        className={classes.githubLink}
        aria-label="stin's Blog の GitHub repository"
      >
        <FaGithub />
      </a>
    </>
  );
};
