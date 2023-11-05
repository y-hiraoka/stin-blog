"use client";

import { useState, FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import classes from "./Footer.module.scss";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const Footer: FC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = useState("");

  useIsomorphicLayoutEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(`${currentYear}`);
  }, []);

  return (
    <footer className={classes.footer}>
      <div className={classes.footerContents}>
        <div className={classes.links}>
          <a
            className={classes.externalLink}
            href="https://twitter.com/stin_factory"
            target="_blank"
            rel="noreferrer">
            Twitter
          </a>
          <a
            className={classes.externalLink}
            href="https://github.com/y-hiraoka"
            target="_blank"
            rel="noreferrer">
            GitHub
          </a>
          <a
            className={classes.externalLink}
            href="https://zenn.dev/stin"
            target="_blank"
            rel="noreferrer">
            Zenn
          </a>
        </div>
        <p className={classes.description}>This site uses Google Analytics.</p>
        <small className={classes.copyright}>&copy;{copyrightPeriod} stin_factory</small>
      </div>
      <div className={classes.colorModeSwitcher}>
        <ColorModeSwitcher />
      </div>
    </footer>
  );
};
