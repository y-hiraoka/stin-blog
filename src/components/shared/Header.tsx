import { FC } from "react";
import { MdDarkMode, MdLightMode, MdMenu } from "react-icons/md";
import NextLink from "next/link";
import { pagesPath } from "../../lib/$path";
import { config } from "../../config";
import { useColorMode, useColorModeValue } from "../../lib/colorMode";
import { headerStyles } from "./Header.css";
import { IconButton } from "../system/IconButton";
import Image from "next/image";
import logoBlack from "./logo_black.png";
import logoWhite from "./logo_white.png";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const Header: FC = () => {
  const { toggleColorMode } = useColorMode();

  return (
    <div>
      <header className={headerStyles.header}>
        <NextLink href={pagesPath.$url()} className={headerStyles.logoLink}>
          <Image
            className={headerStyles.logoLinkImage}
            src={useColorModeValue(logoBlack, logoWhite)}
            alt="stin's blog"
            title="stin's blog"
            priority
          />
        </NextLink>
        <nav className={headerStyles.navigations}>
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
      <NextLink href={pagesPath.articles.$url()} className={headerStyles.navigationLink}>
        Articles
      </NextLink>
      <a href="https://stin.ink" className={headerStyles.navigationLink}>
        About
      </a>
      <a
        href={config.repository}
        target="_blank"
        rel="noreferrer"
        className={headerStyles.navigationLink}>
        GitHub
      </a>
    </>
  );
};

const CollapsedNavLinks: FC = () => {
  return (
    <DropdownMenu.Root>
      <div className={headerStyles.collapsedNavigationTrigger}>
        <DropdownMenu.Trigger asChild>
          <IconButton
            aria-label="ナビゲーションリンクを開閉する"
            variant="outlined"
            icon={<MdMenu />}
          />
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className={headerStyles.collapsedNavigationContent}>
          <DropdownMenu.Item asChild>
            <NextLink
              href={pagesPath.articles.$url()}
              className={headerStyles.collapsedNavigationLink}>
              Articles
            </NextLink>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a href="https://stin.ink" className={headerStyles.collapsedNavigationLink}>
              About
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a
              href={config.repository}
              target="_blank"
              rel="noreferrer"
              className={headerStyles.collapsedNavigationLink}>
              GitHub
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
