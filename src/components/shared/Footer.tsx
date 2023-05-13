"use client";

import { useState, FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";
import classes from "./Footer.module.scss";

export const Footer: FC = () => {
  const [copyrightPeriod, setCopyrightPeriod] = useState("");

  useIsomorphicLayoutEffect(() => {
    const currentYear = new Date().getFullYear();
    setCopyrightPeriod(`${currentYear}`);
  }, []);

  return (
    <div>
      <footer className={classes.footer}>
        <p className={classes.description}>
          このサイトは{" "}
          <a
            className={classes.textLink}
            href="https://policies.google.com/technologies/partner-sites?hl=ja"
            target="_blank"
            rel="noreferrer">
            {" "}
            Google Analytics
          </a>{" "}
          を使用しています
        </p>
        <small>
          &copy;{copyrightPeriod}{" "}
          <a
            className={classes.textLink}
            href="https://twitter.com/stin_factory"
            target="_blank"
            rel="noreferrer">
            stin_factory
          </a>
        </small>
      </footer>
    </div>
  );
};
