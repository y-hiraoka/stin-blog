import { FC } from "react";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import NextLink from "next/link";
import { pagesPath } from "../../lib/$path";
import { config } from "../../config";
import { useColorMode, useColorModeValue } from "../../lib/colorMode";
import classes from "./Header.module.scss";
import { IconButton } from "../system/IconButton";
import Image from "next/image";
import logoBlack from "./logo_black.png";
import logoWhite from "./logo_white.png";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const Header: FC = () => {
  const { toggleColorMode } = useColorMode();

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <NextLink href={pagesPath.$url()} className={classes.logoLink}>
          <Image
            className={classes.logoLinkImage}
            src={useColorModeValue(logoBlack, logoWhite)}
            alt="stin's blog"
            title="stin's blog"
            priority
          />
        </NextLink>
        <nav className={classes.navigations}>
          <IconButton
            aria-label="toggle theme"
            variant="ghost"
            icon={useColorModeValue(<MdDarkMode />, <MdLightMode />)}
            onClick={toggleColorMode}
          />
          <NavLinks />
          <CollapsedNavLinks />
        </nav>
      </header>
    </div>
  );
};

const NavLinks: FC = () => {
  return (
    <>
      <NextLink href={pagesPath.articles.$url()} className={classes.navigationLink}>
        Articles
      </NextLink>
      <a href="https://stin.ink" className={classes.navigationLink}>
        About
      </a>
      <a
        href={config.repository}
        target="_blank"
        rel="noreferrer"
        className={classes.navigationLink}>
        GitHub
      </a>
    </>
  );
};

const CollapsedNavLinks: FC = () => {
  return (
    <DropdownMenu.Root>
      <div className={classes.collapsedNavigationTrigger}>
        <DropdownMenu.Trigger asChild>
          <IconButton
            aria-label="ナビゲーションリンクを開閉する"
            variant="outlined"
            icon={<MdMenu />}
          />
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className={classes.collapsedNavigationContent}>
          <DropdownMenu.Item asChild>
            <NextLink
              href={pagesPath.articles.$url()}
              className={classes.collapsedNavigationLink}>
              Articles
            </NextLink>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a href="https://stin.ink" className={classes.collapsedNavigationLink}>
              About
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a
              href={config.repository}
              target="_blank"
              rel="noreferrer"
              className={classes.collapsedNavigationLink}>
              GitHub
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
